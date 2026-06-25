const express = require('express');
const { protect } = require('../middleware/auth');
const {
  startInterview,
  answerQuestion,
  skipQuestion,
  completeInterview,
  getInterviews,
  getInterview,
  deleteInterview,
} = require('../controllers/interviewController');

const router = express.Router();

router.post('/start', protect, startInterview);
router.post('/:id/answer', protect, answerQuestion);
router.post('/:id/skip', protect, skipQuestion);
router.post('/:id/complete', protect, completeInterview);
router.get('/', protect, getInterviews);
router.get('/:id', protect, getInterview);
router.delete('/:id', protect, deleteInterview);

module.exports = router;
