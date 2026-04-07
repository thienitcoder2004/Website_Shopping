import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { productApi, type TProductReview } from "../../../api/product.api";
import ProductZoomSimple from "../../../components/ProductDetail/ProductZoomSimple";
import ProductInfoPanel from "../../../components/ProductDetail/ProductInfoPanel";
import ProductReviewsSection from "../../../components/ProductDetail/ProductReviewsSection";
import ProductTabs, {
  type TabKey,
} from "../../../components/ProductDetail/ProductTabs";
import { useCart } from "../../../context/cart.context";
import type { TProduct } from "../../../types/product.type";

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];
const API_BASE = "http://localhost:5000";

type ProductPromotion = {
  _id?: string;
  name?: string;
  type?: string;
  value?: number;
  maxDiscount?: number;
  startDate?: string;
  endDate?: string;
  saleStock?: number;
  soldCount?: number;
  perUserLimit?: number;
  priority?: number;
};

type ProductWithPricing = TProduct & {
  finalPrice?: number;
  originalPrice?: number;
  activePromotion?: ProductPromotion | null;
};

function sortSizes(arr: string[]) {
  const map = new Map(SIZE_ORDER.map((s, i) => [s, i]));
  return [...arr].sort(
    (a, b) => (map.get(a) ?? 999) - (map.get(b) ?? 999) || a.localeCompare(b),
  );
}

function formatDate(input?: string) {
  if (!input) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleString("vi-VN");
}

function renderStars(rating: number) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function getImageUrl(path?: string) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE}${path}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const err = error as {
      response?: {
        data?: {
          message?: string;
        };
      };
      message?: string;
    };

    return err.response?.data?.message || err.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState<ProductWithPricing | null>(null);
  const [loading, setLoading] = useState(false);

  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<TabKey>("info");

  const [reviews, setReviews] = useState<TProductReview[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(
    null,
  );

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImages, setReviewImages] = useState<File[]>([]);

  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [replyImagesMap, setReplyImagesMap] = useState<Record<string, File[]>>(
    {},
  );
  const [openReplyBoxId, setOpenReplyBoxId] = useState<string | null>(null);

  const [selectedRatingFilter, setSelectedRatingFilter] = useState<
    number | "all"
  >("all");
  const [onlyHasComment, setOnlyHasComment] = useState(false);
  const [onlyHasMedia, setOnlyHasMedia] = useState(false);

  const token = localStorage.getItem("token");

  const userRaw = localStorage.getItem("user");
  const currentUser = userRaw ? JSON.parse(userRaw) : null;

  const currentUserRole = String(currentUser?.role || "").toLowerCase();
  const isStaffOrAdmin =
    currentUserRole === "admin" || currentUserRole === "staff";

  const colors = useMemo(() => product?.colors ?? [], [product]);
  const sizes = useMemo(
    () => (product?.sizes?.length ? sortSizes(product.sizes) : []),
    [product],
  );

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  const loadProduct = useCallback(async () => {
    if (!slug) return null;

    const res = await productApi.getBySlug(slug);
    const nextProduct = res.data.data as ProductWithPricing;
    setProduct(nextProduct);
    return nextProduct;
  }, [slug]);

  const loadReviews = useCallback(async (productId: string) => {
    setReviewLoading(true);
    try {
      const res = await productApi.getReviews(productId);
      setReviews(res.data.data || []);
    } catch {
      toast.error("Không tải được đánh giá sản phẩm");
    } finally {
      setReviewLoading(false);
    }
  }, []);

  const reloadProductAndReviews = useCallback(async () => {
    if (!slug) return;

    try {
      const nextProduct = await loadProduct();
      if (nextProduct?._id) {
        await loadReviews(nextProduct._id);
      }
    } catch {
      toast.error("Không thể làm mới dữ liệu");
    }
  }, [slug, loadProduct, loadReviews]);

  useEffect(() => {
    const run = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const nextProduct = await loadProduct();
        if (nextProduct?._id) {
          await loadReviews(nextProduct._id);
        }
      } catch {
        toast.error("Không tải được sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [slug, loadProduct, loadReviews]);

  useEffect(() => {
    if (!product) return;
    setSelectedColor(product.colors?.[0] ?? "");
    setSelectedSize(product.sizes?.length ? sortSizes(product.sizes)[0] : "");
  }, [product]);

  const canBuy = useMemo(() => {
    if (!product) return false;
    return (product.stock ?? 0) > 0 && product.isActive;
  }, [product]);

  const purchasedVariant = useMemo(
    () => ({
      color: selectedColor || undefined,
      size: selectedSize || undefined,
    }),
    [selectedColor, selectedSize],
  );

  const onAddToCart = () => {
    if (!product) return;

    if (!token) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      navigate("/login");
      return;
    }

    if (!canBuy) {
      toast.error("Sản phẩm hiện không mua được");
      return;
    }

    const n = Number(qty);
    if (!Number.isFinite(n) || n <= 0) {
      toast.error("Số lượng không hợp lệ");
      return;
    }

    addItem(product, n, purchasedVariant);
    toast.success("Đã thêm vào giỏ hàng 🛒");
    navigate("/cart");
  };

  const onChangeReviewImages = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setReviewImages(files);
  };

  const onChangeReplyImages = (
    reviewId: string,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []).slice(0, 3);
    setReplyImagesMap((prev) => ({
      ...prev,
      [reviewId]: files,
    }));
  };

  const submitReview = async () => {
    if (!product?._id) return;

    if (!token) {
      toast.error("Vui lòng đăng nhập để đánh giá sản phẩm");
      return;
    }

    if (!reviewComment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá");
      return;
    }

    if (reviewRating < 1 || reviewRating > 5) {
      toast.error("Số sao không hợp lệ");
      return;
    }

    try {
      setSubmittingReview(true);

      const formData = new FormData();
      formData.append("rating", String(reviewRating));
      formData.append("comment", reviewComment.trim());

      reviewImages.forEach((file) => {
        formData.append("images", file);
      });

      await productApi.createReview(product._id, formData);

      toast.success("Đánh giá thành công");
      setReviewComment("");
      setReviewRating(5);
      setReviewImages([]);
      await reloadProductAndReviews();
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Gửi đánh giá thất bại");

      if (message === "PRODUCT_NOT_PURCHASED") {
        toast.error("Bạn chỉ có thể đánh giá sau khi đã mua sản phẩm này");
        return;
      }

      if (message === "ALREADY_REVIEWED") {
        toast.warning("Bạn đã đánh giá sản phẩm này rồi");
        return;
      }

      if (message === "INVALID_RATING") {
        toast.warning("Số sao không hợp lệ");
        return;
      }

      if (message === "COMMENT_REQUIRED") {
        toast.warning("Vui lòng nhập nội dung đánh giá");
        return;
      }

      toast.error(message || "Gửi đánh giá thất bại");
    } finally {
      setSubmittingReview(false);
    }
  };

  const submitReply = async (reviewId: string) => {
    if (!product?._id) return;

    if (!token) {
      toast.error("Vui lòng đăng nhập để trả lời bình luận");
      return;
    }

    if (!isStaffOrAdmin) {
      toast.error("Chỉ admin hoặc nhân viên mới được phản hồi đánh giá");
      return;
    }

    const comment = (replyTextMap[reviewId] || "").trim();
    if (!comment) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }

    try {
      setSubmittingReplyId(reviewId);

      const formData = new FormData();
      formData.append("comment", comment);

      (replyImagesMap[reviewId] || []).forEach((file) => {
        formData.append("images", file);
      });

      await productApi.createReply(product._id, reviewId, formData);

      toast.success("Đã gửi phản hồi");
      setReplyTextMap((prev) => ({ ...prev, [reviewId]: "" }));
      setReplyImagesMap((prev) => ({ ...prev, [reviewId]: [] }));
      setOpenReplyBoxId(null);
      await reloadProductAndReviews();
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Gửi phản hồi thất bại");

      if (message === "FORBIDDEN") {
        toast.error("Chỉ admin hoặc nhân viên mới được phản hồi đánh giá");
        return;
      }

      if (message === "REVIEW_NOT_FOUND") {
        toast.error("Không tìm thấy đánh giá cần phản hồi");
        return;
      }

      if (message === "COMMENT_REQUIRED") {
        toast.warning("Vui lòng nhập nội dung phản hồi");
        return;
      }

      toast.error(message || "Gửi phản hồi thất bại");
    } finally {
      setSubmittingReplyId(null);
    }
  };

  const onMarkHelpful = async (reviewId: string) => {
    if (!token) {
      toast.error("Vui lòng đăng nhập để đánh dấu hữu ích");
      return;
    }

    try {
      const res = await productApi.markReviewHelpful(reviewId);
      const helpfulCount = res.data?.data?.helpfulCount;

      setReviews((prev) =>
        prev.map((review) =>
          review._id === reviewId
            ? {
                ...review,
                helpfulCount:
                  typeof helpfulCount === "number"
                    ? helpfulCount
                    : (review.helpfulCount || 0) + 1,
              }
            : review,
        ),
      );

      toast.success("Đã ghi nhận đánh giá hữu ích");
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Không thể đánh dấu hữu ích");

      if (message === "ALREADY_MARKED_HELPFUL") {
        toast.warning("Bạn đã đánh dấu hữu ích đánh giá này rồi");
        return;
      }

      toast.error(message || "Không thể đánh dấu hữu ích");
    }
  };

  const averageRating = Number(product?.ratingAverage || 0);

  const reviewStats = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  const filteredReviews = reviews.filter((review) => {
    const passRating =
      selectedRatingFilter === "all"
        ? true
        : review.rating === selectedRatingFilter;

    const passComment = onlyHasComment
      ? Boolean(review.comment && review.comment.trim())
      : true;

    const passMedia = onlyHasMedia ? Boolean(review.images?.length) : true;

    return passRating && passComment && passMedia;
  });

  if (loading) return <div className="p-4">Đang tải...</div>;
  if (!product) return <div className="p-4">Không tìm thấy sản phẩm</div>;

  return (
    <div className="mx-auto max-w-6xl p-4 pb-10">
      <div className="mb-3 text-sm text-gray-600">
        <Link to="/" className="hover:underline">
          Trang chủ
        </Link>{" "}
        /{" "}
        <Link to="/products" className="hover:underline">
          Danh mục
        </Link>{" "}
        / <span className="font-semibold text-gray-900">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <ProductZoomSimple product={product} />
        </div>

        <ProductInfoPanel
          product={product}
          token={token}
          canBuy={canBuy}
          qty={qty}
          setQty={setQty}
          colors={colors}
          sizes={sizes}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          onAddToCart={onAddToCart}
          renderStars={renderStars}
        />
      </div>

      <ProductTabs product={product} tab={tab} setTab={setTab} />

      <ProductReviewsSection
        token={token}
        isStaffOrAdmin={isStaffOrAdmin}
        canReview={!isStaffOrAdmin}
        reviewPermissionMessage={
          isStaffOrAdmin
            ? "Tài khoản nhân viên/quản trị không gửi đánh giá như khách hàng."
            : "Bạn chỉ có thể đánh giá sau khi đã mua sản phẩm này."
        }
        reviewLoading={reviewLoading}
        reviews={reviews}
        filteredReviews={filteredReviews}
        selectedRatingFilter={selectedRatingFilter}
        setSelectedRatingFilter={setSelectedRatingFilter}
        onlyHasComment={onlyHasComment}
        setOnlyHasComment={setOnlyHasComment}
        onlyHasMedia={onlyHasMedia}
        setOnlyHasMedia={setOnlyHasMedia}
        reviewStats={reviewStats}
        averageRating={averageRating}
        reviewRating={reviewRating}
        setReviewRating={setReviewRating}
        reviewComment={reviewComment}
        setReviewComment={setReviewComment}
        reviewImages={reviewImages}
        onChangeReviewImages={onChangeReviewImages}
        submittingReview={submittingReview}
        submitReview={submitReview}
        openReplyBoxId={openReplyBoxId}
        setOpenReplyBoxId={setOpenReplyBoxId}
        replyTextMap={replyTextMap}
        setReplyTextMap={setReplyTextMap}
        replyImagesMap={replyImagesMap}
        onChangeReplyImages={onChangeReplyImages}
        submittingReplyId={submittingReplyId}
        submitReply={submitReply}
        onMarkHelpful={onMarkHelpful}
        renderStars={renderStars}
        formatDate={formatDate}
        getImageUrl={getImageUrl}
      />
    </div>
  );
}