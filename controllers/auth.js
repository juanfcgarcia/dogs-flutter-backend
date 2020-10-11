const { response } = require("express");
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { generateJWT } = require('../helpers/jwt');


const createUser = async (req, res = response) => {

    const { email, password } = req.body;

    try {

        const emailExists = await User.findOne({ email });
        if(emailExists) {
            return res.status(400).json({
                ok: false,
                msg: 'Las credenciales no son validas, intente con otro correo'
            })
        }

        const user = new User( req.body );

        //Encriptar Contraseña
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync( password, salt );

        await user.save();

        // Generar mi JWT
        const token = await generateJWT( user.id );
    
        res.json({
            ok: true,
            user,
            token
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador '
        }); 
    }
}

const login = async (req, res = response) => { 

    const { email, password } = req.body;

    try {

        const userDB = await User.findOne({ email });
        if( !userDB ) {
            return res.status(404).json({
                ok: false,
                msg: 'Verifique sus credenciales'
            });
        }

        //Validar el password  
        const validPassword = bcrypt.compareSync( password, userDB.password );
        if(!validPassword){
            return res.status(400).json({
                ok: false,
                msg: 'Verifique su contraseña'
            });
        }

        //Generar el JWT 
        const token = await generateJWT( userDB.id );
        res.json({
            ok: true,
            user: userDB,
            token
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Hable con el admin'
        })
    }


}

const renewToken = async (req, res = response) => {

    const uid = req.uid;

    //Generar nuevo JWT
    const token = await generateJWT( uid ); 

    // Obtener el usuario  por el UID
    const user = await User.findById( uid );

    res.json({
        ok: true,
        user,
        token
    });
}



module.exports = {
    createUser,
    login,
    renewToken 
}