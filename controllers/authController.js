const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Simulación de usuario en base de datos (reemplazar con DynamoDB)
  const fakeUser = { email: "user@example.com", password: "$2a$10$xxxxxx" };

  if (email !== fakeUser.email) return res.status(400).json({ message: "Usuario no encontrado" });

  const validPassword = await bcrypt.compare(password, fakeUser.password);
  if (!validPassword) return res.status(400).json({ message: "Contraseña incorrecta" });

  const token = jwt.sign({ email: fakeUser.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.json({ token });
};

exports.register = async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  // Guardar usuario en DynamoDB (esto es un ejemplo)
  res.json({ message: "Usuario registrado", email, hashedPassword });
};
