const router = require('express').Router();
const { getNotifications, markAsRead, sendBroadcast } = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getNotifications);
router.put('/mark-read', markAsRead);
router.post('/broadcast', authorize('admin', 'government_officer'), sendBroadcast);

module.exports = router;
