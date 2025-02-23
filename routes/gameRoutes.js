const express = require('express');
const { getGames, getGameById } = require('../controllers/gameController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getGames);
router.get('/:id', authMiddleware, getGameById);

module.exports = router;
