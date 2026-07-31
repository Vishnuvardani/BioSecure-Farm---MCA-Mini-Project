const router = require('express').Router();
const { getUsers, getUser, updateUser, toggleUserStatus, getUserStats } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/stats', authorize('admin'), getUserStats);
router.get('/', authorize('admin', 'government_officer'), getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.patch('/:id/toggle-status', authorize('admin'), toggleUserStatus);

module.exports = router;
