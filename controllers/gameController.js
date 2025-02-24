const { dynamoDB, TABLE_NAME } = require('../config/db');
const { ScanCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

exports.getGames = async (req, res) => {
  try {
    const params = { TableName: TABLE_NAME };
    const data = await dynamoDB.send(new ScanCommand(params));

    if (!data.Items || data.Items.length === 0) {
      return res.status(404).json({ message: "No hay juegos disponibles" });
    }

    res.json(data.Items);
  } catch (error) {
    console.error("Error al obtener juegos:", error);
    res.status(500).json({ message: "Error al obtener juegos", error: error.message });
  }
};

exports.getGameById = async (req, res) => {
  const { id } = req.params;
  const params = { TableName: TABLE_NAME, Key: { game_id: id } };

  try {
    const data = await dynamoDB.send(new GetCommand(params));

    if (!data.Item) {
      return res.status(404).json({ message: "Juego no encontrado" });
    }

    res.json(data.Item);
  } catch (error) {
    console.error("Error al obtener juego:", error);
    res.status(500).json({ message: "Error al obtener juego", error: error.message });
  }
};
