const productReviewService = require("../services/productReview.service");

exports.list = async (req, res) => {
  try {
    const data = await productReviewService.getAdminReviews(req.query);

    return res.json({
      ok: true,
      data,
    });
  } catch (e) {
    return res.status(400).json({
      ok: false,
      message: e.message,
    });
  }
};

exports.toggleActive = async (req, res) => {
  try {
    const data = await productReviewService.toggleReviewActive(req.params.id);

    return res.json({
      ok: true,
      message: "Cập nhật trạng thái review thành công",
      data,
    });
  } catch (e) {
    const code = e.message === "REVIEW_NOT_FOUND" ? 404 : 400;

    return res.status(code).json({
      ok: false,
      message: e.message,
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await productReviewService.deleteReview(req.params.id);

    return res.json({
      ok: true,
      message: "Xóa review thành công",
      data,
    });
  } catch (e) {
    const code = e.message === "REVIEW_NOT_FOUND" ? 404 : 400;

    return res.status(code).json({
      ok: false,
      message: e.message,
    });
  }
};