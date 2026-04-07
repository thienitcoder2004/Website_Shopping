const mongoose = require("mongoose");
const Contact = require("../models/Contact");
const sendContactMail = require("../services/contactMail.service");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

exports.createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        ok: false,
        message: "Vui lòng nhập đầy đủ họ tên, email và nội dung",
      });
    }

    const contact = await Contact.create({
      name,
      email,
      phone: phone || "",
      subject: subject || "",
      message,
      status: "pending",
    });

    await sendContactMail(contact);

    return res.status(201).json({
      ok: true,
      message: "Gửi liên hệ thành công",
      contact,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    return res.json({
      ok: true,
      contacts,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi lấy danh sách liên hệ",
      error: error.message,
    });
  }
};

exports.updateContact = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        ok: false,
        message: "ID liên hệ không hợp lệ",
      });
    }

    const allowedFields = ["name", "email", "phone", "subject", "message", "status"];
    const updateData = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    const contact = await Contact.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!contact) {
      return res.status(404).json({
        ok: false,
        message: "Không tìm thấy liên hệ",
      });
    }

    return res.json({
      ok: true,
      message: "Cập nhật liên hệ thành công",
      contact,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi cập nhật liên hệ",
      error: error.message,
    });
  }
};

exports.resolveContact = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        ok: false,
        message: "ID liên hệ không hợp lệ",
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: "resolved" },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        ok: false,
        message: "Không tìm thấy liên hệ",
      });
    }

    return res.json({
      ok: true,
      message: "Đã đánh dấu liên hệ là đã xử lý",
      contact,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi cập nhật trạng thái liên hệ",
      error: error.message,
    });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        ok: false,
        message: "ID liên hệ không hợp lệ",
      });
    }

    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        ok: false,
        message: "Không tìm thấy liên hệ",
      });
    }

    return res.json({
      ok: true,
      message: "Đã xóa",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi xóa liên hệ",
      error: error.message,
    });
  }
};