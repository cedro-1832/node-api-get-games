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

module.exports = { register };
