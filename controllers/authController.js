const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dynamoDB, TABLE_NAME } = require('../config/db');
const { GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const register = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar si el usuario ya existe en DynamoDB
    const checkParams = {
      TableName: TABLE_NAME,
      Key: { email }
    };
    const { Item } = await dynamoDB.send(new GetCommand(checkParams));

    if (Item) {
      return res.status(400).json({ message: "El usuario ya está registrado" });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Guardar usuario en DynamoDB
    const params = {
      TableName: TABLE_NAME,
      Item: {
        email,
        password: hashedPassword
      }
    };

    await dynamoDB.send(new PutCommand(params));

    res.json({ message: "Usuario registrado correctamente" });

  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar si el usuario existe
    const params = {
      TableName: TABLE_NAME,
      Key: { email }
    };

    const { Item } = await dynamoDB.send(new GetCommand(params));

    if (!Item) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    // Comparar contraseñas
    const validPassword = await bcrypt.compare(password, Item.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // Generar token
    const token = jwt.sign({ email: Item.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Exportar funciones correctamente
module.exports = { register, login };
