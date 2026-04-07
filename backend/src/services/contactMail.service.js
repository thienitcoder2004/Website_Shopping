const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendContactMail = async (data) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "📩 Liên hệ mới từ website",
    html: `
      <h3>Thông tin liên hệ mới</h3>
      <p><b>Họ tên:</b> ${data.name || ""}</p>
      <p><b>Email:</b> ${data.email || ""}</p>
      <p><b>SĐT:</b> ${data.phone || ""}</p>
      <p><b>Chủ đề:</b> ${data.subject || ""}</p>
      <p><b>Nội dung:</b></p>
      <p>${data.message || ""}</p>
    `,
  });
};

module.exports = sendContactMail;