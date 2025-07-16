const { verificarCredenciales, resetPassword } = require("../models/usuario/usuario.service");
const jwtMiddleware = require('../middleware/jwtMiddleware');
const nodemailer = require("nodemailer");
require("dotenv").config();


const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const usuario = await verificarCredenciales(username, password);

    if (!usuario) {
      return res.status(401).json({
        success: false,
        error: "Credenciales incorrectas"
      });
    }
    
// let roles = usuario.Rol.RolNombres;
// const rolEncontrado = roles.find(rol => rol.dataValues.sexo === usuario.sexo);
const nombreRol = usuario.Rol && usuario.Rol.RolNombres
  ? usuario.Rol.RolNombres.find(rn => rn.sexo === usuario.sexo)?.nombre_rol
  : null;

    // Generar token JWT
    const token = jwtMiddleware.generateToken({
      ...usuario,
      nombre_rol: nombreRol
    });


    res.json({
      success: true,
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: nombreRol,
        //rol: rolEncontrado,
        ROL_id_rol: usuario.ROL_id_rol,
        unidad: usuario.unidad,
        fecha_de_baja: usuario.fecha_de_baja
      }
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      error: "Error en el servidor"
    });
  }
};

const recuperarContrasena = async (req, res) => {
  const { correo } = req.body;

  try {
    const nuevaPass = await resetPassword(correo);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: '"Soporte - Municipalidad de Jalapa" <${process.env.MAIL_USER}>',
      to: correo,
      subject: "📧 Recuperación de contraseña temporal",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h3>Hola,</h3>
          <p>Has solicitado recuperar tu contraseña. A continuación, te enviamos una contraseña temporal para que puedas iniciar sesión:</p>
          <p><strong style="font-size: 18px;">${nuevaPass}</strong></p>
          <p>Por favor, inicia sesión y cámbiala lo antes posible por una contraseña segura.</p>
          <hr/>
          <p style="font-size: 12px; color: gray;">Este es un mensaje automático. No respondas a este correo.</p>
        </div>
      `,
    });

    res.json({ success: true, message: "Contraseña temporal enviada por correo." });

  } catch (error) {
    console.error("Error al recuperar contraseña:", error);
    res.status(500).json({
      success: false,
      error: "No se pudo recuperar la contraseña. Verifica el correo electrónico.",
    });
  }
};


module.exports = { login, recuperarContrasena };
