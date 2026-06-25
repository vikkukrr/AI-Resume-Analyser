const express = require('express');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  uploadResume,
  getResumes,
  getResume,
  getResumeStatus,
  deleteResume,
  reanalyzeResume,
} = require('../controllers/resumeController');

const router = express.Router();

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.get('/', protect, getResumes);
router.get('/:id', protect, getResume);
router.get('/:id/status', protect, getResumeStatus);
router.delete('/:id', protect, deleteResume);
router.post('/:id/reanalyze', protect, reanalyzeResume);

module.exports = router;
