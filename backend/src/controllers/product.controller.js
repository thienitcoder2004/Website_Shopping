const productService = require("../services/product.service");

function getUserIdFromReq(req) {
  return req.user?.id || req.user?._id || req.user?.userId || null;
}

exports.list = async (req, res) => {
  try {
    const data = await productService.list(req.query);
    return res.json({ ok: true, data });
  } catch (e) {
    return res.status(400).json({ ok: false, message: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await productService.getById(req.params.id);
    return res.json({ ok: true, data });
  } catch (e) {
    const code = e.message === "PRODUCT_NOT_FOUND" ? 404 : 400;
    return res.status(code).json({ ok: false, message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: "Không xác định được người dùng",
      });
    }

    const data = await productService.create(req.body, userId);
    return res.status(201).json({ ok: true, data });
  } catch (e) {
    return res.status(400).json({ ok: false, message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: "Không xác định được người dùng",
      });
    }

    const data = await productService.update(req.params.id, req.body, userId);
    return res.json({ ok: true, data });
  } catch (e) {
    const code = e.message === "PRODUCT_NOT_FOUND" ? 404 : 400;
    return res.status(code).json({ ok: false, message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await productService.remove(req.params.id);
    return res.json({ ok: true, data });
  } catch (e) {
    const code = e.message === "PRODUCT_NOT_FOUND" ? 404 : 400;
    return res.status(code).json({ ok: false, message: e.message });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const data = await productService.getBySlug(req.params.slug);
    return res.json({ ok: true, data });
  } catch (e) {
    const code = e.message === "PRODUCT_NOT_FOUND" ? 404 : 400;
    return res.status(code).json({ ok: false, message: e.message });
  }
};