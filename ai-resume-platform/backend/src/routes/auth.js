const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post('/register',
  [body('name').trim().notEmpty().withMessage('Name required'),
   body('email').isEmail().withMessage('Valid email required'),
   body('password').isLength({ min: 8 }).withMessage('Password min 8 chars')],
  validate, ctrl.register);

router.post('/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate, ctrl.login);

router.get('/me', protect, ctrl.getMe);
router.post('/logout', protect, ctrl.logout);
router.put('/change-password', protect,
  [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 8 })],
  validate, ctrl.changePassword);

module.exports = router;
