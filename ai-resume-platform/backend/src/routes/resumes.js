const router = require('express').Router();
const ctrl = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', protect, upload.single('resume'), ctrl.uploadResume);
router.get('/', protect, ctrl.getResumes);
router.get('/:id', protect, ctrl.getResume);
router.get('/:id/status', protect, ctrl.getResumeStatus);
router.delete('/:id', protect, ctrl.deleteResume);
router.post('/:id/reanalyze', protect, ctrl.reanalyzeResume);

module.exports = router;
