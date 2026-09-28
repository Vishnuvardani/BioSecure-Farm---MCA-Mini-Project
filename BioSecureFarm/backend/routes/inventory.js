const router = require('express').Router();
const { createItem, getInventory, updateItem } = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getInventory).post(authorize('farmer', 'admin'), createItem);
router.put('/:id', authorize('farmer', 'admin'), updateItem);

module.exports = router;
