import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  productApi,
  type TAdminReviewItem,
} from "../../api/product.api";

type ReviewUserInfo = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  role?: string;
};

type ReviewProductInfo = {
  _id: string;
  name: string;
  slug: string;
  primaryImage?: string;
  images?: string[];
  ratingAverage?: number;
  ratingCount?: number;
  reviewCount?: number;
};

function getImageUrl(path?: string) {
  if (!path) return "/placeholder-image.png";
  if (path.startsWith("http")) return path;
  return `http://localhost:5000${path}`;
}

function formatDate(input?: string) {
  if (!input) return "-";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN");
}

function getReviewUser(
  user: TAdminReviewItem["userId"],
): ReviewUserInfo | null {
  if (!user || typeof user === "string") return null;
  return user as ReviewUserInfo;
}

function getReviewProduct(
  product: TAdminReviewItem["productId"],
): ReviewProductInfo | null {
  if (!product || typeof product === "string") return null;
  return product as ReviewProductInfo;
}

function getDisplayName(user: TAdminReviewItem["userId"]) {
  const userObj = getReviewUser(user);
  if (!userObj) return "Người dùng";

  const fullName = `${userObj.firstName || ""} ${userObj.lastName || ""}`.trim();
  return fullName || userObj.email || "Người dùng";
}

function getProductName(product: TAdminReviewItem["productId"]) {
  const productObj = getReviewProduct(product);
  if (!productObj) return "Sản phẩm";
  return productObj.name || "Sản phẩm";
}

export default function ReviewsPage() {
  const [items, setItems] = useState<TAdminReviewItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [rating, setRating] = useState<number | "all">("all");
  const [unreplied, setUnreplied] = useState(false);
  const [isActive, setIsActive] = useState<"all" | "true" | "false">("all");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [replyImagesMap, setReplyImagesMap] = useState<Record<string, File[]>>(
    {},
  );
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);

      const params: Record<string, string | number | boolean> = {
        page,
        limit,
      };

      if (keyword.trim()) params.keyword = keyword.trim();
      if (rating !== "all") params.rating = rating;
      if (unreplied) params.unreplied = true;
      if (isActive !== "all") params.isActive = isActive;

      const res = await productApi.getAdminReviews(params);
      setItems(res.data.data.items || []);
      setTotalPages(res.data.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error(error);
      toast.error("Không tải được danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  }, [page, limit, keyword, rating, unreplied, isActive]);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  const filteredCountText = useMemo(() => {
    return `${items.length} đánh giá trên trang này`;
  }, [items.length]);

  const onSearch = async () => {
    setPage(1);
    if (page === 1) {
      await fetchReviews();
    }
  };

  const onResetFilter = () => {
    setKeyword("");
    setRating("all");
    setUnreplied(false);
    setIsActive("all");
    setPage(1);
  };

  const onChangeReplyImages = (
    reviewId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []).slice(0, 3);
    setReplyImagesMap((prev) => ({
      ...prev,
      [reviewId]: files,
    }));
  };

  const submitReply = async (review: TAdminReviewItem) => {
  try {
    const productObj = getReviewProduct(review.productId);
    const productId =
      typeof review.productId === "string"
        ? review.productId
        : productObj?._id || "";

    if (!productId) {
      toast.error("Không tìm thấy sản phẩm của đánh giá này");
      return;
    }

    const text = (replyTextMap[review._id] || "").trim();
    if (!text) {
      toast.warning("Vui lòng nhập nội dung phản hồi");
      return;
    }

    const formData = new FormData();
    formData.append("comment", text);

    (replyImagesMap[review._id] || []).forEach((file) => {
      formData.append("images", file);
    });

    setSubmittingReplyId(review._id);
    await productApi.createReply(productId, review._id, formData);

    toast.success("Phản hồi thành công");
    setReplyTextMap((prev) => ({ ...prev, [review._id]: "" }));
    setReplyImagesMap((prev) => ({ ...prev, [review._id]: [] }));
    await fetchReviews();
  } catch (error) {
    console.error(error);
    toast.error("Không thể phản hồi đánh giá");
  } finally {
    setSubmittingReplyId(null);
  }
};

  const onToggleActive = async (reviewId: string) => {
    try {
      await productApi.toggleReviewActive(reviewId);
      toast.success("Đã cập nhật trạng thái đánh giá");
      await fetchReviews();
    } catch (error) {
      console.error(error);
      toast.error("Không thể cập nhật trạng thái đánh giá");
    }
  };

  const onDelete = async (reviewId: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa đánh giá này?")) return;

    try {
      await productApi.deleteReview(reviewId);
      toast.success("Đã xóa đánh giá");
      await fetchReviews();
    } catch (error) {
      console.error(error);
      toast.error("Không thể xóa đánh giá");
    }
  };

  return (
    <div className="mx-auto max-w-[1280px] p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý đánh giá</h1>
          <p className="text-sm text-slate-600">
            Staff/Admin theo dõi, phản hồi, ẩn hiện và quản lý đánh giá sản phẩm.
          </p>
        </div>

        <div className="text-sm font-medium text-slate-600 md:ml-auto">
          {filteredCountText}
        </div>
      </div>

      <div className="mb-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo tên người dùng hoặc nội dung..."
            className="rounded-2xl border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500"
          />

          <select
            value={rating}
            onChange={(e) =>
              setRating(e.target.value === "all" ? "all" : Number(e.target.value))
            }
            className="rounded-2xl border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500"
          >
            <option value="all">Tất cả số sao</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>

          <select
            value={isActive}
            onChange={(e) => setIsActive(e.target.value as "all" | "true" | "false")}
            className="rounded-2xl border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="true">Đang hiển thị</option>
            <option value="false">Đã ẩn</option>
          </select>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-300 px-4 py-2.5">
            <input
              type="checkbox"
              checked={unreplied}
              onChange={(e) => setUnreplied(e.target.checked)}
            />
            <span>Chưa phản hồi</span>
          </label>

          <div className="flex gap-2">
            <button
              onClick={() => void onSearch()}
              className="flex-1 rounded-2xl bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700"
            >
              Lọc
            </button>
            <button
              onClick={onResetFilter}
              className="rounded-2xl border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-2xl border bg-white p-6 text-slate-500 shadow-sm">
            Đang tải đánh giá...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border bg-white p-6 text-slate-500 shadow-sm">
            Không có đánh giá nào phù hợp.
          </div>
        ) : (
          items.map((review) => {
            const product = getReviewProduct(review.productId);
            const user = getReviewUser(review.userId);

            return (
              <div
                key={review._id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                        {getProductName(review.productId)}
                      </span>

                      {typeof review.rating === "number" && (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          {review.rating}★
                        </span>
                      )}

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          review.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {review.isActive ? "Đang hiển thị" : "Đã ẩn"}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          review.hasStaffReply
                            ? "bg-sky-50 text-sky-700"
                            : "bg-orange-50 text-orange-700"
                        }`}
                      >
                        {review.hasStaffReply ? "Đã phản hồi" : "Chưa phản hồi"}
                      </span>
                    </div>

                    <div className="mb-1 text-lg font-bold text-slate-900">
                      {review.displayName || getDisplayName(review.userId)}
                    </div>

                    <div className="mb-3 text-sm text-slate-500">
                      {user?.email || "-"} • {formatDate(review.createdAt)}
                    </div>

                    <div className="whitespace-pre-line text-slate-800">
                      {review.comment}
                    </div>

                    {review.images?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-3">
                        {review.images.map((img, index) => (
                          <img
                            key={`${review._id}-${index}`}
                            src={getImageUrl(img)}
                            alt={`review-${index}`}
                            className="h-24 w-24 rounded-xl border object-cover"
                          />
                        ))}
                      </div>
                    )}

                    {product && (
                      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                        <img
                          src={getImageUrl(product.primaryImage || product.images?.[0])}
                          alt={product.name}
                          className="h-14 w-14 rounded-xl border object-cover"
                        />
                        <div>
                          <div className="font-semibold text-slate-900">
                            {product.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            slug: {product.slug}
                          </div>
                          <div className="text-xs text-slate-500">
                            Rating TB: {product.ratingAverage || 0} • Tổng review:{" "}
                            {product.reviewCount || 0}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 rounded-2xl border bg-slate-50 p-3">
                      <textarea
                        value={replyTextMap[review._id] || ""}
                        onChange={(e) =>
                          setReplyTextMap((prev) => ({
                            ...prev,
                            [review._id]: e.target.value,
                          }))
                        }
                        placeholder="Nhập phản hồi cho đánh giá này..."
                        className="min-h-[96px] w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-indigo-500"
                      />

                      <div className="mt-3">
                        <input
                          type="file"
                          multiple
                          accept="image/png,image/jpeg,image/webp"
                          onChange={(e) => onChangeReplyImages(review._id, e)}
                          className="block w-full text-sm"
                        />
                        {(replyImagesMap[review._id] || []).length > 0 && (
                          <div className="mt-2 text-sm text-slate-600">
                            Đã chọn {(replyImagesMap[review._id] || []).length} ảnh
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => void submitReply(review)}
                          disabled={submittingReplyId === review._id}
                          className="rounded-2xl bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          {submittingReplyId === review._id
                            ? "Đang gửi..."
                            : "Gửi phản hồi"}
                        </button>

                        <button
                          onClick={() => void onToggleActive(review._id)}
                          className="rounded-2xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {review.isActive ? "Ẩn đánh giá" : "Hiện đánh giá"}
                        </button>

                        <button
                          onClick={() => void onDelete(review._id)}
                          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 font-semibold text-rose-700 hover:bg-rose-100"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          disabled={page <= 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="rounded-2xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Trước
        </button>

        <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
          Trang {page} / {totalPages}
        </div>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className="rounded-2xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Sau
        </button>
      </div>
    </div>
  );
}