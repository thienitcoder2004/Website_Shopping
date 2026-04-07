const crypto = require("crypto");
const Product = require("../../models/Product");
const User = require("../../models/User");
const Order = require("../../models/sales/Order");
const Coupon = require("../../models/sales/Coupon");
const Promotion = require("../../models/sales/Promotion");
const { getIO } = require("../../socket/socket");
const { createNotification } = require("../notification.controller");

function buildOrderCode() {
  return `DH${Date.now()}`;
}

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return 0;

  const today = new Date();
  const dob = new Date(dateOfBirth);

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dob.getDate())
  ) {
    age--;
  }

  return age;
}

async function ensureUserCanPlaceOrder(userId) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Không tìm thấy tài khoản");
  }

  if (!user.dateOfBirth) {
    throw new Error("Vui lòng cập nhật ngày sinh trước khi mua hàng");
  }

  if (calculateAge(user.dateOfBirth) < 16) {
    throw new Error("Bạn phải đủ 16 tuổi mới được mua hàng");
  }

  if (!user.isActive) {
    throw new Error("Tài khoản của bạn đã bị khóa");
  }

  return user;
}

function signMomo(rawSignature) {
  return crypto
    .createHmac("sha256", String(process.env.MOMO_SECRET_KEY || "").trim())
    .update(rawSignature)
    .digest("hex");
}

function getPaymentText(paymentMethod, paymentStatus, orderStatus = "PENDING") {
  if (paymentStatus === "PAID") {
    if (paymentMethod === "MOMO") {
      return "Đã thanh toán qua MoMo";
    }

    return "Đã thanh toán khi nhận hàng";
  }

  if (paymentMethod === "MOMO") {
    if (orderStatus === "CANCELLED") {
      return "Thanh toán MoMo chưa hoàn tất";
    }

    return "Chờ MoMo xác nhận thanh toán";
  }

  if (orderStatus === "SUCCESS") {
    return "Đã thanh toán khi nhận hàng";
  }

  return "Thanh toán khi nhận hàng";
}

function mapOrderResponse(order) {
  const json = order?.toObject ? order.toObject() : order;

  return {
    ...json,
    paymentNote: getPaymentText(
      json.paymentMethod,
      json.paymentStatus,
      json.orderStatus
    ),
  };
}

function calculateCouponDiscount(coupon, subtotal) {
  let discount = 0;

  if (!coupon) return 0;

  if (coupon.type === "percentage") {
    discount = (subtotal * Number(coupon.value || 0)) / 100;

    if (Number(coupon.maxDiscount || 0) > 0) {
      discount = Math.min(discount, Number(coupon.maxDiscount || 0));
    }
  } else {
    discount = Number(coupon.value || 0);
  }

  discount = Math.min(discount, subtotal);

  return Math.max(0, discount);
}

function calculatePromotionPrice(productPrice, promotion) {
  const price = Number(productPrice || 0);
  if (price <= 0 || !promotion) return price;

  let discount = 0;

  if (promotion.type === "percentage") {
    discount = (price * Number(promotion.value || 0)) / 100;

    if (Number(promotion.maxDiscount || 0) > 0) {
      discount = Math.min(discount, Number(promotion.maxDiscount || 0));
    }
  } else {
    discount = Number(promotion.value || 0);
  }

  discount = Math.min(discount, price);

  return Math.max(0, price - discount);
}

async function getBestPromotionForProduct(productId, quantity = 1) {
  const now = new Date();

  const promotions = await Promotion.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    productIds: productId,
    $or: [
      { saleStock: 0 },
      { $expr: { $lt: ["$soldCount", "$saleStock"] } },
    ],
  }).sort({ priority: -1, createdAt: -1 });

  if (!promotions.length) return null;

  for (const promotion of promotions) {
    if (Number(promotion.saleStock || 0) > 0) {
      const remain =
        Number(promotion.saleStock || 0) - Number(promotion.soldCount || 0);

      if (remain < Number(quantity || 1)) {
        continue;
      }
    }

    return promotion;
  }

  return null;
}

async function validateAndBuildCoupon(couponCode, subtotal) {
  if (!couponCode || !String(couponCode).trim()) {
    return {
      couponDoc: null,
      couponData: null,
      discountAmount: 0,
      finalTotal: subtotal,
    };
  }

  const normalizedCode = String(couponCode).trim().toUpperCase();

  const coupon = await Coupon.findOne({
    code: normalizedCode,
    isActive: true,
  });

  if (!coupon) {
    throw new Error("Mã giảm giá không tồn tại hoặc đã bị khóa");
  }

  const now = new Date();

  if (coupon.startDate && now < new Date(coupon.startDate)) {
    throw new Error("Mã giảm giá chưa đến thời gian sử dụng");
  }

  if (coupon.endDate && now > new Date(coupon.endDate)) {
    throw new Error("Mã giảm giá đã hết hạn");
  }

  if (
    Number(coupon.usageLimit || 0) > 0 &&
    Number(coupon.usedCount || 0) >= Number(coupon.usageLimit || 0)
  ) {
    throw new Error("Mã giảm giá đã hết lượt sử dụng");
  }

  if (subtotal < Number(coupon.minOrderValue || 0)) {
    throw new Error(
      `Đơn hàng tối thiểu ${Number(coupon.minOrderValue || 0).toLocaleString(
        "vi-VN"
      )} VNĐ`
    );
  }

  const discountAmount = calculateCouponDiscount(coupon, subtotal);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  return {
    couponDoc: coupon,
    couponData: {
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value || 0),
      discountAmount,
    },
    discountAmount,
    finalTotal,
  };
}

async function markCouponUsedIfNeeded(order) {
  if (!order?.coupon?.code) return;
  if (order.couponUsed) return;

  const coupon = await Coupon.findOne({
    code: String(order.coupon.code).trim().toUpperCase(),
  });

  if (!coupon) return;

  if (
    Number(coupon.usageLimit || 0) > 0 &&
    Number(coupon.usedCount || 0) >= Number(coupon.usageLimit || 0)
  ) {
    return;
  }

  coupon.usedCount = Number(coupon.usedCount || 0) + 1;
  await coupon.save();

  order.couponUsed = true;
  await order.save();
}

async function markPromotionsSoldIfNeeded(order) {
  if (!order?.items?.length) return;
  if (order.promotionUsed) return;

  for (const item of order.items) {
    const promotionId = item?.promotion?._id;
    const quantity = Number(item?.quantity || 0);

    if (!promotionId || quantity <= 0) continue;

    const promotion = await Promotion.findById(promotionId);
    if (!promotion) continue;

    if (Number(promotion.saleStock || 0) > 0) {
      const remain =
        Number(promotion.saleStock || 0) - Number(promotion.soldCount || 0);

      if (remain <= 0) continue;

      const increase = Math.min(remain, quantity);
      promotion.soldCount = Number(promotion.soldCount || 0) + increase;
    } else {
      promotion.soldCount = Number(promotion.soldCount || 0) + quantity;
    }

    await promotion.save();
  }

  order.promotionUsed = true;
  await order.save();
}

async function buildOrderItems(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Giỏ hàng trống");
  }

  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);

    if (!product) {
      throw new Error("Có sản phẩm không tồn tại");
    }

    if (product.isActive === false) {
      throw new Error(`Sản phẩm "${product.name}" đã ngừng bán`);
    }

    const quantity = Number(item.quantity || 0);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error("Số lượng sản phẩm không hợp lệ");
    }

    const basePrice =
      Number(product.salePrice) > 0
        ? Number(product.salePrice)
        : Number(product.price);

    const promotion = await getBestPromotionForProduct(product._id, quantity);

    const finalPrice = promotion
      ? calculatePromotionPrice(basePrice, promotion)
      : basePrice;

    orderItems.push({
      productId: product._id,
      name: product.name,
      slug: product.slug || "",
      image:
        item.image ||
        product.primaryImage ||
        (Array.isArray(product.images) ? product.images[0] : "") ||
        "",
      price: finalPrice,
      originalPrice: basePrice,
      quantity,
      color: item.color || "",
      size: item.size || "",
      lineTotal: finalPrice * quantity,
      promotion: promotion
        ? {
          _id: promotion._id,
          name: promotion.name,
          type: promotion.type,
          value: Number(promotion.value || 0),
          maxDiscount: Number(promotion.maxDiscount || 0),
        }
        : null,
    });
  }

  return orderItems;
}

exports.createCashOrder = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const {
      items,
      customerName,
      customerPhone,
      customerAddress,
      note,
      couponCode,
    } = req.body;

    await ensureUserCanPlaceOrder(userId);

    if (!customerName || !customerPhone || !customerAddress) {
      return res.status(400).json({
        ok: false,
        message: "Vui lòng nhập đầy đủ thông tin nhận hàng",
      });
    }

    const orderItems = await buildOrderItems(items);
    const subtotalAmount = orderItems.reduce(
      (sum, item) => sum + item.lineTotal,
      0
    );

    const { couponData, discountAmount, finalTotal } =
      await validateAndBuildCoupon(couponCode, subtotalAmount);

    const order = await Order.create({
      orderCode: buildOrderCode(),
      userId,
      items: orderItems,
      subtotalAmount,
      discountAmount,
      totalAmount: finalTotal,
      coupon: couponData || {
        code: "",
        type: "",
        value: 0,
        discountAmount: 0,
      },
      couponUsed: false,
      promotionUsed: false,
      paymentMethod: "COD",
      paymentStatus: "UNPAID",
      paymentNote: getPaymentText("COD", "UNPAID", "PENDING"),
      orderStatus: "PENDING",
      customerName,
      customerPhone,
      customerAddress,
      note: note || "",
    });

    await createNotification(
      {
        title: "🛎️ Đơn hàng mới",
        message: `Khách ${customerName} vừa đặt đơn COD`,
        type: "order",
      },
      getIO()
    );

    await markCouponUsedIfNeeded(order);
    await markPromotionsSoldIfNeeded(order);

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { sold: item.quantity }
      });
    }

    return res.status(201).json({
      ok: true,
      message: "Đặt hàng tiền mặt thành công",
      order: mapOrderResponse(order),
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      message: error.message || "Tạo đơn hàng thất bại",
    });
  }
};

exports.createMomoPayment = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const {
      items,
      customerName,
      customerPhone,
      customerAddress,
      note,
      couponCode,
    } = req.body;

    if (!customerName || !customerPhone || !customerAddress) {
      return res.status(400).json({
        ok: false,
        message: "Vui lòng nhập đầy đủ thông tin nhận hàng",
      });
    }

    const user = await ensureUserCanPlaceOrder(userId);
    const orderItems = await buildOrderItems(items);
    const subtotalAmount = orderItems.reduce(
      (sum, item) => sum + item.lineTotal,
      0
    );

    const { couponData, discountAmount, finalTotal } =
      await validateAndBuildCoupon(couponCode, subtotalAmount);

    const orderCode = buildOrderCode();
    const requestId = `${orderCode}-${Date.now()}`;
    const extraData = Buffer.from(
      JSON.stringify({
        orderCode,
        userId,
        couponCode: couponData?.code || "",
      })
    ).toString("base64");

    const partnerCode = String(process.env.MOMO_PARTNER_CODE || "").trim();
    const accessKey = String(process.env.MOMO_ACCESS_KEY || "").trim();
    const secretKey = String(process.env.MOMO_SECRET_KEY || "").trim();
    const redirectUrl = String(process.env.MOMO_REDIRECT_URL || "").trim();
    const ipnUrl = String(process.env.MOMO_IPN_URL || "").trim();
    const requestType = "captureWallet";
    const amount = String(finalTotal);
    const orderInfo = `Thanh toan don hang ${orderCode}`;

    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}` +
      `&orderId=${orderCode}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const payload = {
      partnerCode,
      partnerName: "Test",
      storeId: "MomoTestStore",
      requestId,
      amount,
      orderId: orderCode,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: "vi",
      requestType,
      autoCapture: true,
      extraData,
      signature,
      items: orderItems.map((item) => ({
        id: String(item.productId),
        name: item.name,
        imageUrl: item.image || "",
        price: item.price,
        quantity: item.quantity,
        totalPrice: item.lineTotal,
        currency: "VND",
      })),
      userInfo: {
        name: customerName,
        phoneNumber: customerPhone,
        email: user?.email || "",
      },
    };

    const momoResponse = await fetch(process.env.MOMO_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const momoData = await momoResponse.json();

    if (Number(momoData.resultCode) !== 0 || !momoData.payUrl) {
      return res.status(400).json({
        ok: false,
        message: momoData.message || "Không tạo được link thanh toán MoMo",
        momoData,
      });
    }

    const order = await Order.create({
      orderCode,
      userId,
      items: orderItems,
      subtotalAmount,
      discountAmount,
      totalAmount: finalTotal,
      coupon: couponData || {
        code: "",
        type: "",
        value: 0,
        discountAmount: 0,
      },
      couponUsed: false,
      promotionUsed: false,
      paymentMethod: "MOMO",
      paymentStatus: "UNPAID",
      paymentNote: getPaymentText("MOMO", "UNPAID", "PENDING"),
      orderStatus: "PENDING",
      customerName,
      customerPhone,
      customerAddress,
      note: note || "",
      momo: {
        requestId,
        orderId: momoData.orderId || orderCode,
        resultCode: Number(momoData.resultCode || 0),
        message: momoData.message || "",
        payUrl: momoData.payUrl || "",
        deeplink: momoData.deeplink || "",
        qrCodeUrl: momoData.qrCodeUrl || "",
        responseTime: momoData.responseTime || null,
      },
    });

    await createNotification(
      {
        title: "💰 Đơn hàng MoMo",
        message: `Khách ${customerName} vừa tạo đơn thanh toán`,
        type: "order",
      },
      getIO()
    );

    return res.status(201).json({
      ok: true,
      message: "Tạo thanh toán MoMo thành công",
      orderId: order._id,
      orderCode,
      payUrl: momoData.payUrl,
      deeplink: momoData.deeplink || "",
      qrCodeUrl: momoData.qrCodeUrl || "",
    });
  } catch (error) {
    console.error("createMomoPayment error:", error);
    return res.status(400).json({
      ok: false,
      message: error.message || "Tạo thanh toán MoMo thất bại",
    });
  }
};

exports.momoIpn = async (req, res) => {
  try {
    const data = req.body || {};

    const rawSignature =
      `accessKey=${String(process.env.MOMO_ACCESS_KEY || "").trim()}` +
      `&amount=${data.amount}` +
      `&extraData=${data.extraData || ""}` +
      `&message=${data.message}` +
      `&orderId=${data.orderId}` +
      `&orderInfo=${data.orderInfo}` +
      `&orderType=${data.orderType}` +
      `&partnerCode=${data.partnerCode}` +
      `&payType=${data.payType}` +
      `&requestId=${data.requestId}` +
      `&responseTime=${data.responseTime}` +
      `&resultCode=${data.resultCode}` +
      `&transId=${data.transId}`;

    const expectedSignature = signMomo(rawSignature);

    if (expectedSignature !== data.signature) {
      return res.status(400).json({
        ok: false,
        message: "Sai chữ ký IPN MoMo",
      });
    }

    const order = await Order.findOne({
      orderCode: data.orderId,
      paymentMethod: "MOMO",
    });

    if (!order) {
      return res.status(404).json({
        ok: false,
        message: "Không tìm thấy đơn hàng MoMo",
      });
    }

    order.momo = {
      ...order.momo,
      requestId: data.requestId || order.momo?.requestId || "",
      orderId: data.orderId || order.momo?.orderId || order.orderCode,
      transId: String(data.transId || ""),
      resultCode: Number(data.resultCode),
      message: data.message || "",
      payType: data.payType || "",
      responseTime: data.responseTime || null,
      rawCallback: data,
    };

    if (Number(data.resultCode) === 0) {
      order.paymentStatus = "PAID";
      order.paymentNote = getPaymentText("MOMO", "PAID", order.orderStatus);
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { sold: item.quantity }
        });
      }
      await order.save();

      await createNotification(
        {
          title: "✅ Thanh toán thành công",
          message: `Đơn ${order.orderCode} đã thanh toán`,
          type: "payment",
        },
        getIO()
      );
      await markCouponUsedIfNeeded(order);
      await markPromotionsSoldIfNeeded(order);
    } else {
      order.paymentStatus = "UNPAID";
      order.paymentNote = getPaymentText("MOMO", "UNPAID", order.orderStatus);
      await order.save();
    }

    return res.status(200).json({
      ok: true,
      message: "Đã nhận IPN MoMo",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi xử lý IPN MoMo",
    });
  }
};

exports.momoReturn = async (req, res) => {
  try {
    const data = req.body || {};
    const userId = req.user.id || req.user._id;
    const orderCode = data.orderId || data.orderCode;

    if (!orderCode) {
      return res.status(400).json({
        ok: false,
        message: "Thiếu mã đơn hàng MoMo",
      });
    }

    const order = await Order.findOne({
      orderCode,
      userId,
      paymentMethod: "MOMO",
    });

    if (!order) {
      return res.status(404).json({
        ok: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    order.momo = {
      ...order.momo,
      requestId: data.requestId || order.momo?.requestId || "",
      orderId: data.orderId || order.momo?.orderId || order.orderCode,
      transId: String(data.transId || order.momo?.transId || ""),
      resultCode:
        data.resultCode !== undefined
          ? Number(data.resultCode)
          : order.momo?.resultCode ?? null,
      message: data.message || order.momo?.message || "",
      payType: data.payType || order.momo?.payType || "",
      responseTime: data.responseTime || order.momo?.responseTime || null,
      rawReturn: data,
    };

    order.paymentNote = getPaymentText(
      order.paymentMethod,
      order.paymentStatus,
      order.orderStatus
    );

    await order.save();

    const mappedOrder = mapOrderResponse(order);
    const verifiedPaid = mappedOrder.paymentStatus === "PAID";

    return res.json({
      ok: true,
      verifiedPaid,
      message: verifiedPaid
        ? "Thanh toán MoMo đã được xác nhận"
        : Number(data.resultCode) === 0
          ? "MoMo đã trả kết quả thành công, hệ thống đang chờ xác nhận thanh toán"
          : "Thanh toán MoMo chưa thành công",
      order: mappedOrder,
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      message: error.message || "Xác nhận thanh toán MoMo thất bại",
    });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    return res.json({
      ok: true,
      orders: orders.map(mapOrderResponse),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Không lấy được danh sách đơn hàng",
    });
  }
};

exports.getMyOrderDetail = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const order = await Order.findOne({
      _id: req.params.id,
      userId,
    });

    if (!order) {
      return res.status(404).json({
        ok: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    return res.json({
      ok: true,
      order: mapOrderResponse(order),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Không lấy được chi tiết đơn hàng",
    });
  }
};

exports.getAdminOrders = async (req, res) => {
  try {
    const { status, q } = req.query;

    const filter = {};

    if (status && status !== "ALL") {
      filter.orderStatus = status;
    }

    if (q && String(q).trim()) {
      const keyword = String(q).trim();
      filter.$or = [
        { orderCode: { $regex: keyword, $options: "i" } },
        { customerName: { $regex: keyword, $options: "i" } },
        { customerPhone: { $regex: keyword, $options: "i" } },
      ];
    }

    const orders = await Order.find(filter)
      .populate("userId", "firstName lastName email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      ok: true,
      orders: orders.map(mapOrderResponse),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi lấy danh sách đơn hàng",
      error: error.message,
    });
  }
};

exports.updateAdminOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const allowedStatuses = ["PENDING", "SHIPPING", "SUCCESS", "CANCELLED"];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        ok: false,
        message: "Trạng thái đơn hàng không hợp lệ",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        ok: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    const currentStatus = order.orderStatus;

    const validTransitions = {
      PENDING: ["SHIPPING", "CANCELLED"],
      SHIPPING: ["SUCCESS"],
      SUCCESS: [],
      CANCELLED: [],
    };

    if (!validTransitions[currentStatus]) {
      return res.status(400).json({
        ok: false,
        message: "Trạng thái hiện tại của đơn hàng không hợp lệ",
      });
    }

    if (!validTransitions[currentStatus].includes(orderStatus)) {
      return res.status(400).json({
        ok: false,
        message: `Không thể chuyển từ ${currentStatus} sang ${orderStatus}`,
      });
    }

    if (
      order.paymentMethod === "MOMO" &&
      order.paymentStatus !== "PAID" &&
      ["SHIPPING", "SUCCESS"].includes(orderStatus)
    ) {
      return res.status(400).json({
        ok: false,
        message:
          "Đơn hàng MoMo chưa được xác nhận thanh toán, chưa thể duyệt giao hoặc hoàn tất",
      });
    }

    order.orderStatus = orderStatus;

    if (orderStatus === "SUCCESS") {
      order.paymentStatus = "PAID";
    }

    if (orderStatus === "CANCELLED" && order.paymentMethod === "COD") {
      order.paymentStatus = "UNPAID";
    }

    order.paymentNote = getPaymentText(
      order.paymentMethod,
      order.paymentStatus,
      order.orderStatus
    );

    const updatedOrder = await order.save();

    await createNotification(
      {
        title: "📦 Cập nhật đơn hàng",
        message: `Đơn ${order.orderCode} → ${orderStatus}`,
        type: "order",
      },
      getIO()
    );

    return res.status(200).json({
      ok: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
      order: mapOrderResponse(updatedOrder),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Lỗi cập nhật trạng thái đơn hàng",
      error: error.message,
    });
  }
};