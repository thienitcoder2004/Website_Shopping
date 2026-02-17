import { useEffect, useState } from "react";
import { getNews, deleteNews } from "../../api/news.api";
import { Link } from "react-router-dom";
import axios from "axios";

type TNews = {
  _id: string;
  title: string;
  slug?: string;
  thumbnail?: string;
  author?: string;
  createdAt: string;
  content: string;
};

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").trim();
}

function getAxiosErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const msg = (err.response?.data as { message?: unknown } | undefined)
      ?.message;
    if (typeof msg === "string" && msg.trim()) return msg;
    if (typeof err.message === "string" && err.message.trim())
      return err.message;
  }
  if (err instanceof Error && err.message.trim()) return err.message;
  return fallback;
}

export default function NewsPages() {
  const [news, setNews] = useState<TNews[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const fetchNews = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getNews();
      const items = (res.data?.data ?? []) as TNews[];
      setNews(items);
    } catch (err: unknown) {
      setError(getAxiosErrorMessage(err, "Không tải được tin tức"));
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
    <div className="max-w-7xl mx-auto p-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Quản lý Tin Tức</h2>
          <p className="text-gray-500 text-sm mt-1">
            Danh sách tất cả bài viết trong hệ thống
          </p>
        </div>

        <Link
          to="/admin/news/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow transition"
        >
          + Thêm Tin
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* TABLE CARD */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            {/* HEAD */}
            <thead className="bg-gray-50 border-b text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Ảnh</th>
                <th className="px-6 py-4">Tiêu đề</th>
                <th className="px-6 py-4">Mô tả</th>
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4 text-center">Hành động</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="divide-y">
              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-48 bg-gray-100 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-[520px] bg-gray-100 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 bg-gray-100 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 bg-gray-100 rounded mx-auto" />
                    </td>
                  </tr>
                ))}

              {!loading &&
                news.map((item) => {
                  const preview = stripHtml(item.content).slice(0, 100);

                  return (
                    <tr key={item._id} className="hover:bg-gray-50 transition">
                      {/* Thumbnail */}
                      <td className="px-6 py-4">
                        {item.thumbnail ? (
                          <img
                            src={`http://localhost:5000${item.thumbnail}`}
                            alt={item.title}
                            className="w-16 h-16 object-cover rounded-lg border"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </td>

                      {/* Title */}
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {item.title}
                      </td>

                      {/* Des */}
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {preview}
                        {preview.length >= 100 ? "..." : ""}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center space-x-4">
                        <Link
                          to={`/admin/news/edit/${item._id}`}
                          className="text-yellow-600 hover:text-yellow-700 font-medium"
                        >
                          Sửa
                        </Link>

                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Xóa
                        </button>
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
