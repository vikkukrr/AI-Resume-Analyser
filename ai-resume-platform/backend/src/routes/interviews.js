const router = require('express').Router();
const ctrl = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

router.post('/start', protect,
  [body('targetRole').notEmpty().withMessage('targetRole required')],
  validate, ctrl.startInterview);

router.post('/:id/answer', protect,
  [body('questionId').notEmpty(), body('answer').trim().notEmpty().withMessage('Answer required')],
  validate, ctrl.submitAnswer);

router.post('/:id/skip', protect, ctrl.skipQuestion);
router.post('/:id/complete', protect, ctrl.completeInterview);
router.get('/', protect, ctrl.getInterviews);
router.get('/:id', protect, ctrl.getInterview);
router.delete('/:id', protect, ctrl.deleteInterview);

module.exports = router;
