const mongoose = require("mongoose");
const Product = require("../models/Product");
const InventoryLog = require("../models/InventoryLog");

exports.adjustStock = async ({ productId, type, qty, note }, userId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("INVALID_PRODUCT_ID");
  }

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("INVALID_USER_ID");
  }

  if (!["IN", "OUT", "ADJUST"].includes(type)) {
    throw new Error("INVALID_TYPE");
  }

  const nQty = Number(qty);
  if (!Number.isFinite(nQty) || nQty <= 0) {
    throw new Error("INVALID_QTY");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await Product.findById(productId).session(session);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");

    const beforeWarehouse = Number(product.warehouseStock || 0);
    const beforeShop = Number(product.stock || 0);

    let afterWarehouse = beforeWarehouse;
    let afterShop = beforeShop;

    if (type === "IN") {
      afterWarehouse = beforeWarehouse + nQty;
    }

    if (type === "OUT") {
      if (beforeWarehouse < nQty) throw new Error("WAREHOUSE_NOT_ENOUGH");
      afterWarehouse = beforeWarehouse - nQty;
      afterShop = beforeShop + nQty;
    }

    if (type === "ADJUST") {
      afterWarehouse = nQty;
    }

    product.warehouseStock = afterWarehouse;
    product.stock = afterShop;
    await product.save({ session });

    await InventoryLog.create(
      [
        {
          productId,
          type,
          qty: nQty,
          beforeWarehouse,
          afterWarehouse,
          beforeShop,
          afterShop,
          note: note || "",
          createdBy: userId,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return {
      productId,
      beforeWarehouse,
      afterWarehouse,
      beforeShop,
      afterShop,
    };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

exports.history = async ({ productId, page = 1, limit = 20 }) => {
  const filter = {};

  if (productId) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error("INVALID_PRODUCT_ID");
    }
    filter.productId = productId;
  }

  const currentPage = Number(page) > 0 ? Number(page) : 1;
  const currentLimit = Number(limit) > 0 ? Number(limit) : 20;
  const skip = (currentPage - 1) * currentLimit;

  const [items, total] = await Promise.all([
    InventoryLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(currentLimit)
      .populate("productId", "name sku slug stock warehouseStock")
      .populate("createdBy", "firstName lastName email")
      .lean(),
    InventoryLog.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page: currentPage,
    limit: currentLimit,
    totalPages: Math.ceil(total / currentLimit) || 1,
  };
};