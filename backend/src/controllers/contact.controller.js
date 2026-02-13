const Contact = require("../models/Contact");
const sendContactMail = require("../services/contactMail.service");

exports.createContact = async (req, res) => {
    try {
        const contact = await Contact.create(req.body);

        await sendContactMail(contact);

        res.status(201).json({ message: "Gửi liên hệ thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

exports.getContacts = async (req, res) => {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
};

exports.updateContact = async (req, res) => {
    const contact = await Contact.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.json(contact);
};

exports.deleteContact = async (req, res) => {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa" });
};
