const mongoose = require("mongoose");
const Product = require("../models/Product");
const ProductReview = require("../models/ProductReview");
const User = require("../models/User");
const Order = require("../models/sales/Order");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function normalizeComment(comment) {
  return String(comment || "").trim();
}

function buildDisplayName(user) {
  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || user?.name || user?.fullName || user?.email || "Người dùng";
}

function buildAvatar(user) {
  return user?.avatar || user?.profileImage || user?.photoURL || "/uploads/default-avatar.png";
}

function mapImagesFromFiles(files) {
  if (!Array.isArray(files) || files.length === 0) return [];
  return files.map((file) => `/uploads/reviews/${file.filename}`);
}

async function ensureProductExists(productId) {
  if (!isValidObjectId(productId)) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  return product;
}

async function ensureUserExists(authUser) {
  const userId = authUser?._id || authUser?.id || authUser?.userId;

  if (!userId || !isValidObjectId(userId)) {
    throw new Error("UNAUTHORIZED");
  }

  const user = await User.findById(userId).lean();
  if (!user || user.isActive === false) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

function isStaffOrAdmin(user) {
  return ["admin", "staff"].includes(String(user?.role || ""));
}

async function ensurePurchasedProduct(userId, productId) {
  const order = await Order.findOne({
    userId,
    orderStatus: "SUCCESS",
    "items.productId": productId,
  }).lean();

  if (!order) {
    throw new Error("PRODUCT_NOT_PURCHASED");
  }

  return order;
}

async function recalcProductRating(productId) {
  const objectProductId = new mongoose.Types.ObjectId(productId);

  const [ratingAgg, reviewCount] = await Promise.all([
    ProductReview.aggregate([
      {
        $match: {
          productId: objectProductId,
          parentId: null,
          isActive: true,
          rating: { $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          ratingCount: { $sum: 1 },
        },
      },
    ]),
    ProductReview.countDocuments({
      productId,
      parentId: null,
      isActive: true,
    }),
  ]);

  const avgRating = ratingAgg[0]?.avgRating || 0;
  const ratingCount = ratingAgg[0]?.ratingCount || 0;

  await Product.findByIdAndUpdate(productId, {
    ratingAverage: Number(avgRating.toFixed(1)),
    ratingCount,
    reviewCount,
  });
}

function buildReviewTree(items) {
  const rootReviews = [];
  const repliesMap = new Map();

  for (const item of items) {
    if (item.parentId) {
      const parentKey = String(item.parentId);

      if (!repliesMap.has(parentKey)) {
        repliesMap.set(parentKey, []);
      }

      repliesMap.get(parentKey).push(item);
    } else {
      rootReviews.push(item);
    }
  }

  return rootReviews.map((review) => ({
    ...review,
    replies: repliesMap.get(String(review._id)) || [],
  }));
}

exports.getByProduct = async (productId) => {
  await ensureProductExists(productId);

  const items = await ProductReview.find({
    productId,
    isActive: true,
  })
    .populate(
      "userId",
      "firstName lastName email avatar role"
    )
    .sort({ createdAt: -1 })
    .lean();

  const mapped = items.map((item) => {
    const user =
      item.userId && typeof item.userId === "object" ? item.userId : null;

    return {
      ...item,
      displayName: user
        ? buildDisplayName(user)
        : item.displayName || "Người dùng",
      avatar: user ? buildAvatar(user) : "/uploads/default-avatar.png",
      helpfulCount: item.helpfulCount || 0,
      replyCount: item.replyCount || 0,
      hasStaffReply: item.hasStaffReply || false,
      role: user?.role || null,
    };
  });

  return buildReviewTree(mapped);
};

exports.createReview = async (productId, body, authUser, files) => {
  const product = await ensureProductExists(productId);
  const user = await ensureUserExists(authUser);

  await ensurePurchasedProduct(user._id, product._id);

  const comment = normalizeComment(body.comment);
  const rating = Number(body.rating);
  const images = mapImagesFromFiles(files);

  if (!comment) {
    throw new Error("COMMENT_REQUIRED");
  }

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    throw new Error("INVALID_RATING");
  }

  const existed = await ProductReview.findOne({
    productId: product._id,
    userId: user._id,
    parentId: null,
    isActive: true,
  });

  if (existed) {
    throw new Error("ALREADY_REVIEWED");
  }

  const doc = await ProductReview.create({
    productId: product._id,
    userId: user._id,
    parentId: null,
    rating,
    comment,
    images,
    displayName: buildDisplayName(user),
  });

  await recalcProductRating(product._id);

  return {
    ...doc.toObject(),
    avatar: buildAvatar(user),
    helpfulCount: 0,
    replyCount: 0,
    hasStaffReply: false,
  };
};

exports.createReply = async (productId, reviewId, body, authUser, files) => {
  const product = await ensureProductExists(productId);
  const user = await ensureUserExists(authUser);

  if (!isStaffOrAdmin(user)) {
    throw new Error("FORBIDDEN");
  }

  if (!isValidObjectId(reviewId)) {
    throw new Error("REVIEW_NOT_FOUND");
  }

  const parentReview = await ProductReview.findOne({
    _id: reviewId,
    productId: product._id,
    parentId: null,
    isActive: true,
  });

  if (!parentReview) {
    throw new Error("REVIEW_NOT_FOUND");
  }

  const comment = normalizeComment(body.comment);
  const images = mapImagesFromFiles(files);

  if (!comment) {
    throw new Error("COMMENT_REQUIRED");
  }

  const doc = await ProductReview.create({
    productId: product._id,
    userId: user._id,
    parentId: parentReview._id,
    rating: null,
    comment,
    images,
    displayName: buildDisplayName(user),
  });

  parentReview.replyCount = Number(parentReview.replyCount || 0) + 1;
  parentReview.hasStaffReply = true;
  parentReview.lastRepliedAt = new Date();
  await parentReview.save();

  return {
    ...doc.toObject(),
    avatar: buildAvatar(user),
  };
};

exports.markHelpful = async (reviewId, authUser) => {
  const user = await ensureUserExists(authUser);

  if (!isValidObjectId(reviewId)) {
    throw new Error("REVIEW_NOT_FOUND");
  }

  const review = await ProductReview.findOne({
    _id: reviewId,
    parentId: null,
    isActive: true,
  });

  if (!review) {
    throw new Error("REVIEW_NOT_FOUND");
  }

  if (!Array.isArray(review.helpfulBy)) {
    review.helpfulBy = [];
  }

  const alreadyMarked = review.helpfulBy.some(
    (id) => String(id) === String(user._id)
  );

  if (alreadyMarked) {
    throw new Error("ALREADY_MARKED_HELPFUL");
  }

  review.helpfulBy.push(user._id);
  review.helpfulCount = review.helpfulBy.length;

  await review.save();

  return {
    reviewId: review._id,
    helpfulCount: review.helpfulCount,
  };
};

exports.getAdminReviews = async (query = {}) => {
  const {
    productId,
    unreplied,
    rating,
    keyword,
    page = 1,
    limit = 10,
    isActive,
  } = query;

  const filter = {
    parentId: null,
  };

  if (productId && isValidObjectId(productId)) {
    filter.productId = productId;
  }

  if (unreplied === "true") {
    filter.hasStaffReply = false;
  }

  if (rating && Number(rating) >= 1 && Number(rating) <= 5) {
    filter.rating = Number(rating);
  }

  if (typeof isActive !== "undefined") {
    filter.isActive = String(isActive) === "true";
  }

  if (keyword) {
    filter.$or = [
      { comment: { $regex: keyword, $options: "i" } },
      { displayName: { $regex: keyword, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    ProductReview.find(filter)
      .populate("productId", "name slug primaryImage images ratingAverage ratingCount reviewCount")
      .populate("userId", "firstName lastName email avatar role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    ProductReview.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

exports.toggleReviewActive = async (reviewId) => {
  if (!isValidObjectId(reviewId)) {
    throw new Error("REVIEW_NOT_FOUND");
  }

  const review = await ProductReview.findById(reviewId);

  if (!review || review.parentId) {
    throw new Error("REVIEW_NOT_FOUND");
  }

  review.isActive = !review.isActive;
  await review.save();

  await ProductReview.updateMany(
    { parentId: review._id },
    { $set: { isActive: review.isActive } }
  );

  await recalcProductRating(review.productId);

  return review;
};

exports.deleteReview = async (reviewId) => {
  if (!isValidObjectId(reviewId)) {
    throw new Error("REVIEW_NOT_FOUND");
  }

  const review = await ProductReview.findById(reviewId);

  if (!review || review.parentId) {
    throw new Error("REVIEW_NOT_FOUND");
  }

  await ProductReview.deleteMany({
    $or: [{ _id: review._id }, { parentId: review._id }],
  });

  await recalcProductRating(review.productId);

  return { deleted: true };
};