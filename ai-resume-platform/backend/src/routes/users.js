const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, ctrl.getProfile);
router.put('/profile', protect, ctrl.updateProfile);
router.get('/leaderboard', protect, ctrl.getLeaderboard);
router.get('/:id', protect, ctrl.getPublicProfile);
router.delete('/account', protect, ctrl.deleteAccount);

module.exports = router;
