import type { ChangeEvent } from "react";
import type { TProductReview } from "../../api/product.api";

type Props = {
  token: string | null;
  isStaffOrAdmin: boolean;
  canReview?: boolean;
  reviewPermissionMessage?: string;
  reviewLoading: boolean;
  reviews: TProductReview[];
  filteredReviews: TProductReview[];
  selectedRatingFilter: number | "all";
  setSelectedRatingFilter: React.Dispatch<
    React.SetStateAction<number | "all">
  >;
  onlyHasComment: boolean;
  setOnlyHasComment: React.Dispatch<React.SetStateAction<boolean>>;
  onlyHasMedia: boolean;
  setOnlyHasMedia: React.Dispatch<React.SetStateAction<boolean>>;
  reviewStats: Record<1 | 2 | 3 | 4 | 5, number>;
  averageRating: number;
  reviewRating: number;
  setReviewRating: React.Dispatch<React.SetStateAction<number>>;
  reviewComment: string;
  setReviewComment: React.Dispatch<React.SetStateAction<string>>;
  reviewImages: File[];
  onChangeReviewImages: (e: ChangeEvent<HTMLInputElement>) => void;
  submittingReview: boolean;
  submitReview: () => Promise<void>;
  openReplyBoxId: string | null;
  setOpenReplyBoxId: React.Dispatch<React.SetStateAction<string | null>>;
  replyTextMap: Record<string, string>;
  setReplyTextMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  replyImagesMap: Record<string, File[]>;
  onChangeReplyImages: (
    reviewId: string,
    e: ChangeEvent<HTMLInputElement>,
  ) => void;
  submittingReplyId: string | null;
  submitReply: (reviewId: string) => Promise<void>;
  onMarkHelpful: (reviewId: string) => Promise<void>;
  renderStars: (rating: number) => string;
  formatDate: (input?: string) => string;
  getImageUrl: (path?: string) => string;
};

export default function ProductReviewsSection({
  token,
  isStaffOrAdmin,
  canReview = true,
  reviewPermissionMessage,
  reviewLoading,
  reviews,
  filteredReviews,
  selectedRatingFilter,
  setSelectedRatingFilter,
  onlyHasComment,
  setOnlyHasComment,
  onlyHasMedia,
  setOnlyHasMedia,
  reviewStats,
  averageRating,
  reviewRating,
  setReviewRating,
  reviewComment,
  setReviewComment,
  reviewImages,
  onChangeReviewImages,
  submittingReview,
  submitReview,
  openReplyBoxId,
  setOpenReplyBoxId,
  replyTextMap,
  setReplyTextMap,
  replyImagesMap,
  onChangeReplyImages,
  submittingReplyId,
  submitReply,
  onMarkHelpful,
  renderStars,
  formatDate,
  getImageUrl,
}: Props) {
  const reviewDisabled = !token || !canReview;

  return (
    <div className="mt-10">
      <div className="mb-4 text-2xl font-extrabold uppercase">
        Đánh giá sản phẩm
      </div>

      <div className="mb-6 rounded-2xl border bg-[#fffaf8] p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="min-w-[220px]">
            <div className="text-5xl font-light text-orange-500">
              {averageRating.toFixed(1)} <span className="text-2xl">trên 5</span>
            </div>
            <div className="mt-3 text-4xl leading-none text-orange-500">
              {renderStars(Math.round(averageRating))}
            </div>
            <div className="mt-3 text-sm text-gray-600">
              {reviews.length} đánh giá
            </div>
          </div>

          <div className="flex flex-1 flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedRatingFilter("all");
                setOnlyHasComment(false);
                setOnlyHasMedia(false);
              }}
              className={`rounded border px-6 py-3 ${
                selectedRatingFilter === "all" &&
                !onlyHasComment &&
                !onlyHasMedia
                  ? "border-orange-500 bg-white text-orange-500"
                  : "border-gray-300 bg-white hover:bg-gray-50"
              }`}
            >
              Tất cả ({reviews.length})
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
                className={`rounded border px-6 py-3 ${
                  selectedRatingFilter === star
                    ? "border-orange-500 bg-white text-orange-500"
                    : "border-gray-300 bg-white hover:bg-gray-50"
                }`}
              >
                {star} Sao ({reviewStats[star as 1 | 2 | 3 | 4 | 5] || 0})
              </button>
            ))}

            <button
              type="button"
              onClick={() => {
                setSelectedRatingFilter("all");
                setOnlyHasComment(true);
                setOnlyHasMedia(false);
              }}
              className={`rounded border px-6 py-3 ${
                onlyHasComment
                  ? "border-orange-500 bg-white text-orange-500"
                  : "border-gray-300 bg-white hover:bg-gray-50"
              }`}
            >
              Có bình luận
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRatingFilter("all");
                setOnlyHasComment(false);
                setOnlyHasMedia(true);
              }}
              className={`rounded border px-6 py-3 ${
                onlyHasMedia
                  ? "border-orange-500 bg-white text-orange-500"
                  : "border-gray-300 bg-white hover:bg-gray-50"
              }`}
            >
              Có hình ảnh
            </button>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 text-xl font-bold">Viết đánh giá của bạn</div>

        <div className="space-y-4">
          <div>
            <div className="mb-2 font-bold">Chấm điểm</div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  disabled={reviewDisabled}
                  className={`rounded-xl border px-4 py-2 text-lg font-bold ${
                    reviewRating === star
                      ? "border-orange-500 bg-orange-50 text-orange-500"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  } ${reviewDisabled ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  {star}★
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 font-bold">Nội dung đánh giá</div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              disabled={reviewDisabled}
              placeholder={
                !token
                  ? "Vui lòng đăng nhập để đánh giá sản phẩm"
                  : !canReview
                    ? reviewPermissionMessage ||
                      "Bạn chỉ có thể đánh giá sau khi đã mua sản phẩm này"
                    : "Nhập cảm nhận của bạn về sản phẩm..."
              }
              className="min-h-[110px] w-full rounded-xl border p-3 outline-none focus:border-orange-400 disabled:bg-gray-100"
            />
          </div>

          <div>
            <div className="mb-2 font-bold">Ảnh đánh giá (tối đa 5 ảnh)</div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              disabled={reviewDisabled}
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
              onClick={() => void submitReview()}
              disabled={reviewDisabled || submittingReview}
              className="rounded-xl bg-orange-500 px-5 py-3 font-extrabold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>

          {!token && (
            <div className="text-sm text-red-500">
              Bạn cần đăng nhập để bình luận và đánh giá sản phẩm.
            </div>
          )}

          {token && !canReview && (
            <div className="text-sm text-amber-600">
              {reviewPermissionMessage ||
                "Bạn chỉ có thể đánh giá sau khi đã mua sản phẩm này."}
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 font-semibold text-gray-700">
        {filteredReviews.length} nhận xét
      </div>

      {reviewLoading ? (
        <div className="text-gray-500">Đang tải đánh giá...</div>
      ) : filteredReviews.length === 0 ? (
        <div className="rounded-2xl border p-4 text-gray-500">
          Chưa có đánh giá nào phù hợp bộ lọc.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredReviews.map((review) => (
            <div key={review._id} className="border-b bg-white pb-6">
              <div className="flex items-start gap-4">
                {review.avatar ? (
                  <img
                    src={getImageUrl(review.avatar)}
                    alt={review.displayName}
                    className="h-14 w-14 rounded-full border border-gray-200 object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-orange-200 bg-orange-100 text-xl font-bold text-orange-600 shadow-sm">
                    {review.displayName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}

                <div className="flex-1">
                  <div className="text-lg font-extrabold">
                    {review.displayName}
                  </div>

                  {review.rating ? (
                    <div className="mt-1 text-xl text-orange-500">
                      {renderStars(review.rating)}
                    </div>
                  ) : null}

                  <div className="mt-1 text-sm text-gray-500">
                    {formatDate(review.createdAt)}
                  </div>

                  <div className="mt-3 whitespace-pre-line text-[18px] leading-8 text-gray-800">
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
                            className="h-28 w-28 rounded border object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => void onMarkHelpful(review._id)}
                      className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 font-semibold text-orange-600 transition hover:border-orange-300 hover:bg-orange-100"
                    >
                      <span>👍</span>
                      <span>Hữu ích</span>
                      {typeof review.helpfulCount === "number" &&
                        review.helpfulCount > 0 && (
                          <span className="rounded-full border border-orange-200 bg-white px-2 py-[2px] text-sm">
                            {review.helpfulCount}
                          </span>
                        )}
                    </button>

                    {isStaffOrAdmin && (
                      <button
                        type="button"
                        onClick={() =>
                          setOpenReplyBoxId((prev) =>
                            prev === review._id ? null : review._id,
                          )
                        }
                        className="text-sm font-bold text-orange-600 hover:underline"
                      >
                        {openReplyBoxId === review._id
                          ? "Đóng phản hồi"
                          : "Phản hồi với tư cách nhân viên/quản trị"}
                      </button>
                    )}

                    {review.replyCount ? (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {review.replyCount} phản hồi
                      </span>
                    ) : null}
                  </div>

                  {isStaffOrAdmin && openReplyBoxId === review._id && (
                    <div className="mt-4 rounded-xl border bg-gray-50 p-3">
                      <textarea
                        value={replyTextMap[review._id] || ""}
                        onChange={(e) =>
                          setReplyTextMap((prev) => ({
                            ...prev,
                            [review._id]: e.target.value,
                          }))
                        }
                        placeholder="Nhập nội dung phản hồi..."
                        className="min-h-[90px] w-full rounded-xl border p-3 outline-none focus:border-orange-400"
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
                          onClick={() => void submitReply(review._id)}
                          disabled={submittingReplyId === review._id}
                          className="rounded-xl bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          {submittingReplyId === review._id
                            ? "Đang gửi..."
                            : "Gửi phản hồi"}
                        </button>
                      </div>
                    </div>
                  )}

                  {review.replies?.length > 0 && (
                    <div className="mt-4 space-y-3 border-l-2 border-gray-200 pl-4">
                      {review.replies.map((reply) => (
                        <div key={reply._id} className="rounded-xl bg-gray-50 p-3">
                          <div className="flex items-start gap-3">
                            {reply.avatar ? (
                              <img
                                src={getImageUrl(reply.avatar)}
                                alt={reply.displayName}
                                className="h-10 w-10 rounded-full border border-gray-200 object-cover shadow-sm"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-200 bg-orange-100 text-sm font-bold text-orange-600 shadow-sm">
                                {reply.displayName?.charAt(0)?.toUpperCase() || "A"}
                              </div>
                            )}

                            <div className="flex-1">
                              <div className="mb-1 flex flex-wrap items-center gap-3">
                                <div className="text-sm font-bold text-orange-600">
                                  {reply.displayName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatDate(reply.createdAt)}
                                </div>
                              </div>

                              <div className="whitespace-pre-line text-gray-800">
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
                                        className="h-24 w-24 rounded border object-cover"
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
  );
}