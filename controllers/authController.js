const jwt = require('jsonwebtoken');

const USER_DEFAULT = {
  email: "admin@playstation.com",
  password: "123456"
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (email !== USER_DEFAULT.email || password !== USER_DEFAULT.password) {
    return res.status(400).json({ message: "Usuario o contraseña incorrectos" });
  }

  // Generar token
  const token = jwt.sign({ email: USER_DEFAULT.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.json({ token });
};

module.exports = { login };
