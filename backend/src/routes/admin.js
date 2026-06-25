const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const {
  getStats,
  getUsers,
  toggleUser,
  setRole,
  deleteUser,
} = require('../controllers/adminController');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id/toggle', toggleUser);
router.patch('/users/:id/role', setRole);
router.delete('/users/:id', deleteUser);

module.exports = router;
