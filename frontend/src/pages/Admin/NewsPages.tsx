import { useEffect, useState } from "react";
import { getNews, deleteNews, type TNews } from "../../api/news.api";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:5000";

function stripHtml(html?: string) {
  return (html || "").replace(/<[^>]*>/g, "").trim();
}

function getAxiosErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const msg = (err.response?.data as { message?: unknown } | undefined)
      ?.message;

    if (typeof msg === "string" && msg.trim()) return msg;
    if (typeof err.message === "string" && err.message.trim()) {
      return err.message;
    }
  }

  if (err instanceof Error && err.message.trim()) return err.message;
  return fallback;
}

function getImageUrl(image?: string) {
  if (!image) return "";
  if (image.startsWith("http")) return image;
  return `${API_BASE}${image.startsWith("/") ? image : `/${image}`}`;
}

function getDescription(item: TNews) {
  return stripHtml(
    item.description ||
      item.desc ||
      item.summary ||
      item.excerpt ||
      item.content ||
      "",
  );
}

function getNewsId(item: TNews) {
  return item._id || item.id || "";
}

function getNewsImage(item: TNews) {
  const firstImage =
    Array.isArray((item as { images?: string[] }).images) &&
    (item as { images?: string[] }).images?.length
      ? (item as { images?: string[] }).images?.[0]
      : "";

  return item.thumbnail || item.image || firstImage || "";
}

export default function NewsPages() {
  const [news, setNews] = useState<TNews[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const fetchNews = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await getNews(1);
      const items = res.data?.data ?? [];
      setNews(Array.isArray(items) ? items : []);
    } catch (err: unknown) {
      setError(getAxiosErrorMessage(err, "Không tải được tin tức"));
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchNews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa tin này?")) return;

    try {
      await deleteNews(id);
      await fetchNews();
    } catch (err: unknown) {
      alert(getAxiosErrorMessage(err, "Xóa thất bại"));
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Quản lý Tin Tức</h2>
          <p className="mt-1 text-sm text-gray-500">
            Danh sách tất cả bài viết trong hệ thống
          </p>
        </div>

        <Link
          to="/admin/news/create"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-white shadow transition hover:bg-blue-700"
        >
          + Thêm Tin
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl bg-white shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
              <tr>
                <th className="px-6 py-4">Ảnh</th>
                <th className="px-6 py-4">Tiêu đề</th>
                <th className="px-6 py-4">Mô tả</th>
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4 text-center">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-16 w-16 rounded-lg bg-gray-100" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-48 rounded bg-gray-100" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-[520px] rounded bg-gray-100" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 rounded bg-gray-100" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="mx-auto h-4 w-24 rounded bg-gray-100" />
                    </td>
                  </tr>
                ))}

              {!loading &&
                news.map((item, index) => {
                  const newsId = getNewsId(item);
                  const preview = getDescription(item).slice(0, 100);
                  const imageUrl = getImageUrl(getNewsImage(item));

                  return (
                    <tr
                      key={item._id || item.id || index}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.title}
                            className="h-16 w-16 rounded-lg border object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                            No Image
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-800">
                        {item.title}
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-500">
                        {preview || "Chưa có mô tả"}
                        {preview.length >= 100 ? "..." : ""}
                      </td>

                      <td className="px-6 py-4 text-gray-500">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                          : "Đang cập nhật"}
                      </td>

                      <td className="space-x-4 px-6 py-4 text-center">
                        {newsId && (
                          <>
                            <Link
                              to={`/admin/news/edit/${newsId}`}
                              className="font-medium text-yellow-600 hover:text-yellow-700"
                            >
                              Sửa
                            </Link>

                            <button
                              onClick={() => handleDelete(newsId)}
                              className="font-medium text-red-600 hover:text-red-700"
                            >
                              Xóa
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}

              {!loading && !news.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Chưa có tin tức
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}