const { dynamoDB, TABLE_NAME } = require('../config/db');
const gameSchema = require('../models/gameModel');

exports.getGames = async (req, res) => {
  try {
    const params = { TableName: TABLE_NAME };
    const data = await dynamoDB.scan(params).promise();
    res.json(data.Items);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener juegos", error });
  }
};

exports.getGameById = async (req, res) => {
  const { id } = req.params;
  const params = { TableName: TABLE_NAME, Key: { game_id: id } };

  try {
    const data = await dynamoDB.get(params).promise();
    if (!data.Item) return res.status(404).json({ message: "Juego no encontrado" });
    res.json(data.Item);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener juego", error });
  }
};
