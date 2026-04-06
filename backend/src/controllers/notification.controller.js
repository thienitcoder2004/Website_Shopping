const Notification = require("../models/Notification");

exports.createNotification = async (data, io) => {
    const noti = await Notification.create(data);

    if (io) {
        io.emit("new_notification", noti); // realtime
    }

    return noti;
};

// API
exports.getAll = async (req, res) => {
    const data = await Notification.find().sort({ createdAt: -1 });
    res.json(data);
};

exports.getUnread = async (req, res) => {
    const count = await Notification.countDocuments({ isRead: false });
    res.json({ count });
};

exports.markRead = async (req, res) => {
    await Notification.findByIdAndUpdate(req.params.id, {
        isRead: true,
    });
    res.json({ ok: true });
};