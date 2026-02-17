import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Pagination from "../../components/Pagination";

interface News {
  _id: string;
  title: string;
  slug: string;
  thumbnail: string;
  author: string;
  createdAt: string;
  content: string;
}

type NewsListResponse = {
  data: News[];
  totalPages: number;
  page?: number;
  total?: number;
};

const API_BASE = "http://localhost:5000";

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, "");
}

export default function NewsPage() {
  const [newsData, setNewsData] = useState<News[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const latestNews = useMemo(() => newsData.slice(0, 4), [newsData]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await axios.get<NewsListResponse>(`${API_BASE}/api/news`, {
          params: { page: currentPage },
        });

        setNewsData(res.data.data ?? []);
        setTotalPages(res.data.totalPages ?? 1);
      } catch (err) {
        console.error(err);
        setNewsData([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [currentPage]);

  return (
    <section className="bg-white py-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          Trang chủ /{" "}
          <span className="text-orange-600 font-medium">Tin tức</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* SIDEBAR */}
          <aside className="lg:col-span-1 space-y-8">
            <div>
              <h3 className="font-semibold border-l-4 border-orange-600 pl-3 mb-4">
                DANH MỤC TIN TỨC
              </h3>

              <ul className="space-y-2 text-sm text-gray-700">
                <li className="text-orange-600 font-medium">Trang chủ</li>
                <li>Nam</li>
                <li>Nữ</li>
                <li>Phụ kiện</li>
                <li>Khuyến mãi</li>
                <li>Tin tức</li>
                <li>Liên hệ</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold border-l-4 border-orange-600 pl-3 mb-4">
                TIN TỨC MỚI NHẤT
              </h3>

              {latestNews.map((item) => (
                <div key={item._id} className="flex gap-3 mb-4">
                  <img
                    src={`${API_BASE}${item.thumbnail}`}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-md"
                    loading="lazy"
                  />
                  <Link
                    to={`/news/${item.slug}`}
                    className="text-xs hover:text-orange-600 line-clamp-3"
                  >
                    {item.title}
                  </Link>
                </div>
              ))}

              {!loading && latestNews.length === 0 && (
                <div className="text-sm text-gray-500">Chưa có tin mới.</div>
              )}
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <div className="lg:col-span-3">
            {loading && (
              <div className="text-gray-500 mb-4">Đang tải tin tức...</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {!loading &&
                newsData.map((item) => (
                  <div key={item._id}>
                    <img
                      src={`${API_BASE}${item.thumbnail}`}
                      alt={item.title}
                      className="w-full h-64 object-cover mb-4 rounded-lg"
                      loading="lazy"
                    />

                    <h3 className="font-semibold text-lg mb-2 hover:text-orange-600">
                      <Link to={`/news/${item.slug}`}>{item.title}</Link>
                    </h3>

                    <p className="text-xs text-gray-500 mb-3">
                      {new Date(item.createdAt).toLocaleDateString("vi-VN")} |{" "}
                      {item.author}
                    </p>

                    <p className="text-sm text-gray-600 mb-4 leading-6">
                      {stripHtml(item.content ?? "").slice(0, 150)}...
                    </p>

                    {/* ✅ sửa link /new -> /news */}
                    <Link
                      to={`/news/${item.slug}`}
                      className="inline-flex items-center border px-4 py-2 text-sm hover:bg-orange-600 hover:text-white transition"
                    >
                      XEM CHI TIẾT
                    </Link>
                  </div>
                ))}
            </div>

            {!loading && newsData.length === 0 && (
              <div className="text-gray-500 mt-4">Chưa có bài viết.</div>
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
