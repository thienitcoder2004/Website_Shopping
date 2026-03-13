const crypto = require("crypto");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

function buildOrderCode() {
    return `DH${Date.now()}`;
}

function signMomo(rawSignature) {
    return crypto
        .createHmac("sha256", process.env.MOMO_SECRET_KEY)
        .update(rawSignature)
        .digest("hex");
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

        const price =
            Number(product.salePrice) > 0
                ? Number(product.salePrice)
                : Number(product.price);

        orderItems.push({
            productId: product._id,
            name: product.name,
            slug: product.slug || "",
            image: product.primaryImage || product.images?.[0] || "",
            price,
            quantity,
            color: item.color || "",
            size: item.size || "",
            lineTotal: price * quantity,
        });
    }

    return orderItems;
}

exports.createCashOrder = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { items, customerName, customerPhone, customerAddress, note } = req.body;

        if (!customerName || !customerPhone || !customerAddress) {
            return res.status(400).json({
                ok: false,
                message: "Vui lòng nhập đầy đủ thông tin nhận hàng",
            });
        }

        const orderItems = await buildOrderItems(items);
        const totalAmount = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);

        const order = await Order.create({
            orderCode: buildOrderCode(),
            userId,
            items: orderItems,
            totalAmount,
            paymentMethod: "COD",
            paymentStatus: "UNPAID",
            paymentNote: "Chưa trả tiền",
            orderStatus: "PENDING",
            customerName,
            customerPhone,
            customerAddress,
            note: note || "",
        });

        return res.status(201).json({
            ok: true,
            message: "Đặt hàng tiền mặt thành công",
            order,
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
        const { items, customerName, customerPhone, customerAddress, note } = req.body;

        if (!customerName || !customerPhone || !customerAddress) {
            return res.status(400).json({
                ok: false,
                message: "Vui lòng nhập đầy đủ thông tin nhận hàng",
            });
        }

        const user = await User.findById(userId);
        const orderItems = await buildOrderItems(items);
        const totalAmount = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);

        const orderCode = buildOrderCode();
        const requestId = `${orderCode}-${Date.now()}`;
        const extraData = Buffer.from(
            JSON.stringify({
                orderCode,
                userId,
            })
        ).toString("base64");

        // Ép toàn bộ về string để ký và gửi nhất quán
        const partnerCode = String(process.env.MOMO_PARTNER_CODE || "").trim();
        const accessKey = String(process.env.MOMO_ACCESS_KEY || "").trim();
        const secretKey = String(process.env.MOMO_SECRET_KEY || "").trim();
        const redirectUrl = String(process.env.MOMO_REDIRECT_URL || "").trim();
        const ipnUrl = String(process.env.MOMO_IPN_URL || "").trim();
        const requestType = "captureWallet";
        const amount = String(totalAmount);
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

        console.log("=== MOMO CONFIG ===");
        console.log("partnerCode =", JSON.stringify(partnerCode));
        console.log("accessKey =", JSON.stringify(accessKey));
        console.log("secretKey length =", secretKey.length);
        console.log("redirectUrl =", JSON.stringify(redirectUrl));
        console.log("ipnUrl =", JSON.stringify(ipnUrl));

        console.log("=== MOMO RAW SIGNATURE ===");
        console.log(rawSignature);

        console.log("=== MOMO SIGNATURE ===");
        console.log(signature);

        console.log("=== MOMO PAYLOAD ===");
        console.log(payload);

        const momoResponse = await fetch(process.env.MOMO_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const momoData = await momoResponse.json();

        console.log("=== MOMO RESPONSE ===");
        console.log(momoData);

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
            totalAmount,
            paymentMethod: "MOMO",
            paymentStatus: "UNPAID",
            paymentNote: "Chưa trả tiền",
            orderStatus: "PENDING",
            customerName,
            customerPhone,
            customerAddress,
            note: note || "",
            momo: {
                requestId,
                orderId: momoData.orderId || orderCode,
                resultCode: momoData.resultCode,
                message: momoData.message || "",
                payUrl: momoData.payUrl || "",
                deeplink: momoData.deeplink || "",
                qrCodeUrl: momoData.qrCodeUrl || "",
                responseTime: momoData.responseTime || null,
            },
        });

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
            `accessKey=${process.env.MOMO_ACCESS_KEY}` +
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
            return res.status(204).send();
        }

        const order = await Order.findOne({ orderCode: data.orderId });
        if (!order) {
            return res.status(204).send();
        }

        order.momo = {
            ...order.momo,
            transId: String(data.transId || ""),
            resultCode: Number(data.resultCode),
            message: data.message || "",
            responseTime: data.responseTime || null,
            rawCallback: data,
        };

        if (Number(data.resultCode) === 0) {
            order.paymentStatus = "PAID";
            order.paymentNote = "Đã trả tiền";
        } else {
            order.paymentStatus = "UNPAID";
            order.paymentNote = "Chưa trả tiền";
        }

        await order.save();

        return res.status(204).send();
    } catch (error) {
        return res.status(204).send();
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });

        return res.json({
            ok: true,
            orders,
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
            order,
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

        if (q) {
            filter.orderCode = { $regex: q, $options: "i" };
        }

        const orders = await Order.find(filter)
            .populate("userId", "firstName lastName email phone")
            .sort({ createdAt: -1 });

        return res.json({
            ok: true,
            orders,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: "Không lấy được danh sách đơn hàng admin",
        });
    }
};

exports.updateAdminOrderStatus = async (req, res) => {
    try {
        const { orderStatus } = req.body;
        const allowStatuses = ["PENDING", "CANCELLED", "SUCCESS", "SHIPPING"];

        if (!allowStatuses.includes(orderStatus)) {
            return res.status(400).json({
                ok: false,
                message: "Trạng thái đơn hàng không hợp lệ",
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                ok: false,
                message: "Không tìm thấy đơn hàng",
            });
        }

        order.orderStatus = orderStatus;
        await order.save();

        return res.json({
            ok: true,
            message: "Cập nhật trạng thái đơn hàng thành công",
            order,
        });
    } catch (error) {
        return res.status(400).json({
            ok: false,
            message: error.message || "Cập nhật trạng thái thất bại",
        });
    }
};