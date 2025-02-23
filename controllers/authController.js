const { PutCommand } = require('@aws-sdk/lib-dynamodb');

exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

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
    res.status(500).json({ message: "Error en el servidor" });
  }
};
