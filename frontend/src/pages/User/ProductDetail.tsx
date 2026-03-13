import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { productApi, type TProductReview } from "../../api/product.api";
import type { TProduct } from "../../types/product.type";
import ProductZoomSimple from "../../components/ProductZoomSimple";
import { useCart } from "../../context/cart.context";

type TabKey = "info" | "how" | "policy";

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];
const API_BASE = "http://localhost:5000";

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

  const [product, setProduct] = useState<TProduct | null>(null);
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
  const isAdmin =
    currentUser?.role === "admin" || currentUser?.isAdmin === true;

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
    const nextProduct = res.data.data;
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

  const onAddToCart = () => {
    if (!product) return;

    if (!canBuy) {
      toast.error("Sản phẩm hiện không mua được");
      return;
    }

    const n = Number(qty);
    if (!Number.isFinite(n) || n <= 0) {
      toast.error("Số lượng không hợp lệ");
      return;
    }

    addItem(product, n, {
      color: selectedColor || undefined,
      size: selectedSize || undefined,
    });

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
      toast.error(getErrorMessage(error, "Gửi đánh giá thất bại"));
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

    if (!isAdmin) {
      toast.error("Chỉ admin mới được phản hồi đánh giá");
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
      toast.error(getErrorMessage(error, "Gửi phản hồi thất bại"));
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
      toast.error(getErrorMessage(error, "Không thể đánh dấu hữu ích"));
    }
  };

  if (loading) return <div className="p-4">Đang tải...</div>;
  if (!product) return <div className="p-4">Không tìm thấy sản phẩm</div>;

  const displayPrice =
    product.salePrice && product.salePrice > 0
      ? product.salePrice
      : product.price;

  const averageRating = Number(product.ratingAverage || 0);

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

  return (
    <div className="max-w-6xl mx-auto p-4 pb-10">
      <div className="text-sm text-gray-600 mb-3">
        <Link to="/" className="hover:underline">
          Trang chủ
        </Link>{" "}
        /{" "}
        <Link to="/products" className="hover:underline">
          Danh mục
        </Link>{" "}
        / <span className="font-semibold text-gray-900">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div>
          <ProductZoomSimple product={product} />
        </div>

        <div className="lg:pl-4">
          <div className="text-xl font-extrabold mb-2">{product.name}</div>

          <div className="mb-3">
            {product.salePrice && product.salePrice > 0 ? (
              <div className="flex items-end gap-3">
                <div className="text-2xl font-extrabold text-orange-600">
                  {product.salePrice.toLocaleString()}₫
                </div>
                <div className="line-through text-gray-500">
                  {product.price.toLocaleString()}₫
                </div>
              </div>
            ) : (
              <div className="text-2xl font-extrabold">
                {product.price.toLocaleString()}₫
              </div>
            )}

            <div className="mt-2 text-sm text-gray-600">
              {(product.stock ?? 0) > 0
                ? `Còn hàng: ${product.stock}`
                : "Hết hàng"}
            </div>

            <div className="mt-3 flex items-center gap-3 text-sm">
              <div className="font-bold text-yellow-500">
                {Number(product.ratingAverage || 0).toFixed(1)} / 5
              </div>
              <div className="text-gray-700">
                {renderStars(Math.round(Number(product.ratingAverage || 0)))}
              </div>
              <div className="text-gray-500">
                ({product.ratingCount || 0} đánh giá, {product.reviewCount || 0}{" "}
                nhận xét)
              </div>
            </div>
          </div>

          {(colors.length > 0 || sizes.length > 0) && (
            <div className="mt-4 space-y-4">
              {colors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold">Màu</div>
                    <div className="text-sm text-gray-600">
                      {selectedColor ? `Đang chọn: ${selectedColor}` : ""}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {colors.map((c) => {
                      const active = c === selectedColor;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSelectedColor(c)}
                          className={`px-3 py-2 rounded-lg border font-semibold transition ${
                            active
                              ? "border-black border-2"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {sizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold">Size</div>
                    <div className="text-sm text-gray-600">
                      {selectedSize ? `Đang chọn: ${selectedSize}` : ""}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => {
                      const active = s === selectedSize;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={`min-w-[52px] px-3 py-2 rounded-lg border font-bold transition ${
                            active
                              ? "border-black border-2"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 mt-5">
            <div className="font-bold">Số lượng</div>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-2 hover:bg-gray-50"
              >
                -
              </button>

              <input
                value={qty}
                onChange={(e) =>
                  setQty(Math.max(1, Number(e.target.value) || 1))
                }
                className="w-14 text-center outline-none"
                inputMode="numeric"
              />

              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="px-3 py-2 hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onAddToCart}
            disabled={!canBuy}
            className="mt-4 w-full py-3 rounded-xl font-extrabold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            THÊM VÀO GIỎ
          </button>

          <div className="mt-4 text-sm text-gray-700">
            📞 Tư vấn miễn phí: <span className="font-bold">1900 6750</span>
          </div>

          <div className="mt-3 text-sm text-gray-700 space-y-1">
            <div>✔ Giao hàng nhanh 2-4 ngày</div>
            <div>✔ Đổi trả 7 ngày</div>
            <div>✔ Thanh toán khi nhận hàng</div>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t">
        <div className="flex gap-0">
          <TabButton active={tab === "info"} onClick={() => setTab("info")}>
            Thông tin sản phẩm
          </TabButton>
          <TabButton active={tab === "how"} onClick={() => setTab("how")}>
            Cách mua hàng
          </TabButton>
          <TabButton
            active={tab === "policy"}
            onClick={() => setTab("policy")}
          >
            Điều khoản
          </TabButton>
        </div>

        <div className="border border-t-0 p-4 rounded-b-xl">
          {tab === "info" && (
            <div className="space-y-3 leading-7">
              <div className="font-bold text-lg">{product.name}</div>
              <div className="text-gray-700">
                {product.description?.trim()
                  ? product.description
                  : "Chưa có mô tả. Bạn có thể cập nhật mô tả trong trang quản trị."}
              </div>
            </div>
          )}

          {tab === "how" && (
            <div className="space-y-2 leading-7">
              <div className="font-bold text-lg">Cách mua hàng</div>
              <ol className="list-decimal pl-5 text-gray-700">
                <li>Chọn màu và size (nếu có).</li>
                <li>Chọn số lượng và nhấn “THÊM VÀO GIỎ”.</li>
                <li>Vào giỏ hàng, điền thông tin nhận hàng.</li>
                <li>Xác nhận đơn hàng và chờ giao.</li>
              </ol>
            </div>
          )}

          {tab === "policy" && (
            <div className="space-y-2 leading-7">
              <div className="font-bold text-lg">Điều khoản</div>
              <ul className="list-disc pl-5 text-gray-700">
                <li>Đổi trả trong 7 ngày nếu sản phẩm lỗi do nhà sản xuất.</li>
                <li>Sản phẩm phải còn tem/mác, chưa sử dụng.</li>
                <li>Thời gian giao hàng 2-4 ngày tuỳ khu vực.</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10">
        <div className="text-2xl font-extrabold mb-4 uppercase">
          Đánh giá sản phẩm
        </div>

        <div className="border rounded-2xl p-6 bg-[#fffaf8] mb-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
            <div className="min-w-[220px]">
              <div className="text-5xl font-light text-orange-500">
                {averageRating.toFixed(1)}{" "}
                <span className="text-2xl">trên 5</span>
              </div>
              <div className="mt-3 text-orange-500 text-4xl leading-none">
                {renderStars(Math.round(averageRating))}
              </div>
            </div>

            <div className="flex-1 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedRatingFilter("all");
                  setOnlyHasComment(false);
                  setOnlyHasMedia(false);
                }}
                className={`px-6 py-3 border rounded ${
                  selectedRatingFilter === "all" &&
                  !onlyHasComment &&
                  !onlyHasMedia
                    ? "border-orange-500 text-orange-500 bg-white"
                    : "border-gray-300 bg-white hover:bg-gray-50"
                }`}
              >
                Tất Cả
              </button>

              {[5, 4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    setSelectedRatingFilter(star);
                    setOnlyHasComment(false);
                    setOnlyHasMedia(false);
                  }}
                  className={`px-6 py-3 border rounded ${
                    selectedRatingFilter === star
                      ? "border-orange-500 text-orange-500 bg-white"
                      : "border-gray-300 bg-white hover:bg-gray-50"
                  }`}
                >
                  {star} Sao ({reviewStats[star as 1 | 2 | 3 | 4 | 5]})
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  setSelectedRatingFilter("all");
                  setOnlyHasComment(true);
                  setOnlyHasMedia(false);
                }}
                className={`px-6 py-3 border rounded ${
                  onlyHasComment
                    ? "border-orange-500 text-orange-500 bg-white"
                    : "border-gray-300 bg-white hover:bg-gray-50"
                }`}
              >
                Có Bình Luận ({reviews.filter((r) => r.comment?.trim()).length})
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRatingFilter("all");
                  setOnlyHasComment(false);
                  setOnlyHasMedia(true);
                }}
                className={`px-6 py-3 border rounded ${
                  onlyHasMedia
                    ? "border-orange-500 text-orange-500 bg-white"
                    : "border-gray-300 bg-white hover:bg-gray-50"
                }`}
              >
                Có Hình Ảnh / Video ({reviews.filter((r) => r.images?.length).length})
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4 mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <div className="font-bold mb-2">Chấm sao</div>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = reviewRating === star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      disabled={!token}
                      className={`px-3 py-2 rounded-lg border font-bold ${
                        active
                          ? "bg-yellow-400 border-yellow-400 text-white"
                          : "border-gray-200 hover:bg-gray-50"
                      } disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`}
                    >
                      {star} ★
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="font-bold mb-2">Nội dung đánh giá</div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                disabled={!token}
                placeholder={
                  token
                    ? "Nhập cảm nhận của bạn về sản phẩm..."
                    : "Vui lòng đăng nhập để đánh giá sản phẩm"
                }
                className="w-full min-h-[110px] border rounded-xl p-3 outline-none focus:border-orange-400 disabled:bg-gray-100"
              />
            </div>

            <div>
              <div className="font-bold mb-2">Ảnh đánh giá (tối đa 5 ảnh)</div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                disabled={!token}
                onChange={onChangeReviewImages}
                className="block w-full text-sm"
              />
              {reviewImages.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  Đã chọn {reviewImages.length} ảnh
                </div>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={submitReview}
                disabled={!token || submittingReview}
                className="px-5 py-3 rounded-xl font-extrabold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </div>

            {!token && (
              <div className="text-sm text-red-500">
                Bạn cần đăng nhập để bình luận và đánh giá sản phẩm.
              </div>
            )}
          </div>
        </div>

        <div className="mb-4 text-gray-700 font-semibold">
          {filteredReviews.length} nhận xét
        </div>

        {reviewLoading ? (
          <div className="text-gray-500">Đang tải đánh giá...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="border rounded-2xl p-4 text-gray-500">
            Chưa có đánh giá nào phù hợp bộ lọc.
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <div key={review._id} className="border-b pb-6 bg-white">
                <div className="flex items-start gap-4">
                  {review.avatar ? (
                    <img
                      src={getImageUrl(review.avatar)}
                      alt={review.displayName}
                      className="w-14 h-14 rounded-full object-cover border border-gray-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 text-xl font-bold shadow-sm">
                      {review.displayName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="font-extrabold text-lg">
                      {review.displayName}
                    </div>

                    {review.rating ? (
                      <div className="text-orange-500 text-xl mt-1">
                        {renderStars(review.rating)}
                      </div>
                    ) : null}

                    <div className="text-sm text-gray-500 mt-1">
                      {formatDate(review.createdAt)}
                    </div>

                    <div className="mt-3 text-gray-800 whitespace-pre-line leading-8 text-[18px]">
                      {review.comment}
                    </div>

                    {review.images?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-3">
                        {review.images.map((img, index) => (
                          <a
                            key={`${review._id}-${index}`}
                            href={getImageUrl(img)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img
                              src={getImageUrl(img)}
                              alt={`review-${index}`}
                              className="w-28 h-28 object-cover rounded border"
                            />
                          </a>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-4 flex-wrap">
                      <button
                        type="button"
                        onClick={() => onMarkHelpful(review._id)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-200 bg-orange-50 text-orange-600 font-semibold hover:bg-orange-100 hover:border-orange-300 transition"
                      >
                        <span>👍</span>
                        <span>Hữu ích</span>
                        {typeof review.helpfulCount === "number" &&
                          review.helpfulCount > 0 && (
                            <span className="px-2 py-[2px] rounded-full bg-white border border-orange-200 text-sm">
                              {review.helpfulCount}
                            </span>
                          )}
                      </button>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() =>
                            setOpenReplyBoxId((prev) =>
                              prev === review._id ? null : review._id,
                            )
                          }
                          className="text-sm font-bold text-orange-600 hover:underline"
                        >
                          Phản hồi với tư cách Admin
                        </button>
                      )}
                    </div>

                    {isAdmin && openReplyBoxId === review._id && (
                      <div className="mt-4 p-3 rounded-xl bg-gray-50 border">
                        <textarea
                          value={replyTextMap[review._id] || ""}
                          onChange={(e) =>
                            setReplyTextMap((prev) => ({
                              ...prev,
                              [review._id]: e.target.value,
                            }))
                          }
                          placeholder="Nhập nội dung phản hồi của admin..."
                          className="w-full min-h-[90px] border rounded-xl p-3 outline-none focus:border-orange-400"
                        />

                        <div className="mt-3">
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            multiple
                            onChange={(e) => onChangeReplyImages(review._id, e)}
                            className="block w-full text-sm"
                          />
                          {(replyImagesMap[review._id] || []).length > 0 && (
                            <div className="mt-2 text-sm text-gray-600">
                              Đã chọn {(replyImagesMap[review._id] || []).length} ảnh
                            </div>
                          )}
                        </div>

                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => submitReply(review._id)}
                            disabled={submittingReplyId === review._id}
                            className="px-4 py-2 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            {submittingReplyId === review._id
                              ? "Đang gửi..."
                              : "Gửi phản hồi"}
                          </button>
                        </div>
                      </div>
                    )}

                    {review.replies?.length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-3">
                        {review.replies.map((reply) => (
                          <div
                            key={reply._id}
                            className="bg-gray-50 rounded-xl p-3"
                          >
                            <div className="flex items-start gap-3">
                              {reply.avatar ? (
                                <img
                                  src={getImageUrl(reply.avatar)}
                                  alt={reply.displayName}
                                  className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-sm font-bold text-orange-600 shadow-sm">
                                  {reply.displayName?.charAt(0)?.toUpperCase() || "A"}
                                </div>
                              )}

                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-1">
                                  <div className="font-bold text-sm text-orange-600">
                                    {reply.displayName}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {formatDate(reply.createdAt)}
                                  </div>
                                </div>

                                <div className="text-gray-800 whitespace-pre-line">
                                  {reply.comment}
                                </div>

                                {reply.images?.length > 0 && (
                                  <div className="mt-3 flex flex-wrap gap-3">
                                    {reply.images.map((img, index) => (
                                      <a
                                        key={`${reply._id}-${index}`}
                                        href={getImageUrl(img)}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        <img
                                          src={getImageUrl(img)}
                                          alt={`reply-${index}`}
                                          className="w-20 h-20 object-cover rounded-xl border"
                                        />
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="hidden">{displayPrice}</div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 border font-extrabold ${
        active ? "bg-white border-b-white" : "bg-gray-50 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}