const Notification = require('../models/Notification');
const User = require('../models/User');

exports.createNotification = async (recipientId, title, message, type = 'system', data = {}) => {
  const notification = await Notification.create({ recipient: recipientId, title, message, type, data });
  // FCM push (if firebase-admin configured)
  try {
    const admin = require('../config/firebase');
    const user = await User.findById(recipientId).select('fcmToken');
    if (user?.fcmToken) {
      await admin.messaging().send({
        token: user.fcmToken,
        notification: { title, body: message },
        data: { type, ...data }
      });
      notification.sentViaFCM = true;
      await notification.save();
    }
  } catch { /* FCM optional */ }
  return notification;
};

exports.broadcastNotification = async (title, message, type, role) => {
  const filter = role ? { role, isActive: true } : { isActive: true };
  const users = await User.find(filter).select('_id fcmToken');
  const notifications = users.map(u => ({ recipient: u._id, title, message, type }));
  await Notification.insertMany(notifications);

  try {
    const admin = require('../config/firebase');
    const tokens = users.map(u => u.fcmToken).filter(Boolean);
    if (tokens.length > 0) {
      await admin.messaging().sendEachForMulticast({ tokens, notification: { title, body: message } });
    }
  } catch { /* FCM optional */ }
};
