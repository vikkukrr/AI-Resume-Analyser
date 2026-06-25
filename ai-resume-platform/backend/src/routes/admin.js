const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');
const auth = [protect, adminOnly];

router.get('/stats', auth, ctrl.getStats);
router.get('/users', auth, ctrl.getUsers);
router.patch('/users/:id/toggle', auth, ctrl.toggleUserStatus);
router.patch('/users/:id/role', auth, ctrl.changeUserRole);
router.delete('/users/:id', auth, ctrl.deleteUser);
router.get('/feedback', auth, ctrl.getFeedback);

module.exports = router;
