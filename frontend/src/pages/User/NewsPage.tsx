import { useEffect, useState } from "react";
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

export default function NewsPage() {
  const [newsData, setNewsData] = useState<News[]>([]);
  const [latestNews, setLatestNews] = useState<News[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNews(currentPage);
  }, [currentPage]);

  const fetchNews = async (page: number) => {
    const res = await axios.get(`http://localhost:5000/api/news?page=${page}`);

    setNewsData(res.data.data);
    setLatestNews(res.data.data.slice(0, 4));
    setTotalPages(res.data.totalPages);
  };

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
                    src={`http://localhost:5000${item.thumbnail}`}
                    className="w-16 h-16 object-cover"
                  />
                  <Link
                    to={`/news/${item.slug}`}
                    className="text-xs hover:text-orange-600"
                  >
                    {item.title}
                  </Link>
                </div>
              ))}
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {newsData.map((item) => (
                <div key={item._id}>
                  <img
                    src={`http://localhost:5000${item.thumbnail}`}
                    className="w-full h-64 object-cover mb-4"
                  />

                  <h3 className="font-semibold text-lg mb-2 hover:text-orange-600">
                    <Link to={`/news/${item.slug}`}>{item.title}</Link>
                  </h3>

                  <p className="text-xs text-gray-500 mb-3">
                    {new Date(item.createdAt).toLocaleDateString()} |{" "}
                    {item.author}
                  </p>

                  <p className="text-sm text-gray-600 mb-4 leading-6">
                    {item.content.replace(/<[^>]+>/g, "").slice(0, 150)}...
                  </p>

                  <Link
                    to={`/new/${item.slug}`}
                    className="border px-4 py-2 text-sm hover:bg-orange-600 hover:text-white transition"
                  >
                    XEM CHI TIẾT
                  </Link>
                </div>
              ))}
            </div>

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
