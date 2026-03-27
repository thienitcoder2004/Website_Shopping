const inventoryService = require("../services/inventory.service");

function getUserIdFromReq(req) {
  return req.user?.id || req.user?._id || req.user?.userId || null;
}

exports.adjust = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: "Không xác định được người dùng",
      });
    }

    const data = await inventoryService.adjustStock(req.body, userId);
    return res.json({ ok: true, data });
  } catch (e) {
    let code = 400;

    if (e.message === "PRODUCT_NOT_FOUND") code = 404;
    if (e.message === "WAREHOUSE_NOT_ENOUGH") code = 409;

    return res.status(code).json({
      ok: false,
      message: e.message,
    });
  }
};

exports.history = async (req, res) => {
  try {
    const data = await inventoryService.history(req.query);
    return res.json({ ok: true, data });
  } catch (e) {
    return res.status(400).json({
      ok: false,
      message: e.message,
    });
  }
};