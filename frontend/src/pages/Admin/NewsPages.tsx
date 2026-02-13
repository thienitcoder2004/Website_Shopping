import { useEffect, useState } from "react";
import { getNews, deleteNews } from "../../api/news.api";
import { Link } from "react-router-dom";

export default function NewsPages() {
  const [news, setNews] = useState<any[]>([]);

  const fetchNews = async () => {
    const res = await getNews();
    setNews(res.data.data);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa tin này?")) {
      await deleteNews(id);
      fetchNews();
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
              {news.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 transition">
                  {/* Thumbnail */}
                  <td className="px-6 py-4">
                    {item.thumbnail ? (
                      <img
                        src={`http://localhost:5000${item.thumbnail}`}
                        alt="thumbnail"
                        className="w-16 h-16 object-cover rounded-lg border"
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
                    {item.content.slice(0, 100)}...
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
