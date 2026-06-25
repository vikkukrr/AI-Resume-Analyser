const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  getLeaderboard,
  getUserById,
  deleteAccount,
} = require('../controllers/userController');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/:id', getUserById);
router.delete('/account', protect, deleteAccount);

module.exports = router;
