exports.login = (req, res) => {
    const { username, password } = req.body;
  
    // Datos Hardcore
    if (username === 'admin' && password === '1234') {
      res.json({ success: true, message: 'Login correcto' });
    } else {
      res.json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }
  };
  
  