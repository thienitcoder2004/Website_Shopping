const productReviewService = require("../services/productReview.service");

exports.getByProduct = async (req, res) => {
  try {
    const data = await productReviewService.getByProduct(req.params.id);

    return res.json({
      ok: true,
      data,
    });
  } catch (e) {
    const code = e.message === "PRODUCT_NOT_FOUND" ? 404 : 400;

    return res.status(code).json({
      ok: false,
      message: e.message,
    });
  }
};

exports.createReview = async (req, res) => {
  try {
    const data = await productReviewService.createReview(
      req.params.id,
      req.body,
      req.user,
      req.files
    );

    return res.status(201).json({
      ok: true,
      data,
    });
  } catch (e) {
    let code = 400;

    if (e.message === "PRODUCT_NOT_FOUND") code = 404;
    if (e.message === "UNAUTHORIZED") code = 401;

    return res.status(code).json({
      ok: false,
      message: e.message,
    });
  }
};

exports.createReply = async (req, res) => {
  try {
    const data = await productReviewService.createReply(
      req.params.id,
      req.params.reviewId,
      req.body,
      req.user,
      req.files
    );

    return res.status(201).json({
      ok: true,
      data,
    });
  } catch (e) {
    let code = 400;

    if (
      e.message === "PRODUCT_NOT_FOUND" ||
      e.message === "REVIEW_NOT_FOUND"
    ) {
      code = 404;
    }

    if (e.message === "UNAUTHORIZED") {
      code = 401;
    }

    return res.status(code).json({
      ok: false,
      message: e.message,
    });
  }
};

exports.markHelpful = async (req, res) => {
  try {
    const data = await productReviewService.markHelpful(
      req.params.reviewId,
      req.user
    );

    return res.json({
      ok: true,
      message: "Đã đánh dấu hữu ích",
      data,
    });
  } catch (e) {
    let code = 400;

    if (e.message === "REVIEW_NOT_FOUND") {
      code = 404;
    }

    if (e.message === "UNAUTHORIZED") {
      code = 401;
    }

    return res.status(code).json({
      ok: false,
      message: e.message,
    });
  }
};