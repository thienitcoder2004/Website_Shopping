import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function NewsDetailPage() {
  const { slug } = useParams();
  const [news, setNews] = useState<any>(null);
  const [latestNews, setLatestNews] = useState<any[]>([]);

  useEffect(() => {
    if (slug) {
      axios
        .get(`http://localhost:5000/api/news/slug/${slug}`)
        .then((res) => setNews(res.data));
    }

    axios
      .get(`http://localhost:5000/api/news?page=1`)
      .then((res) => setLatestNews(res.data.data.slice(0, 4)));
  }, [slug]);

  if (!news) return <div className="text-center py-20">Đang tải...</div>;

  return (
    <section className="bg-white py-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-orange-600">
            Trang chủ
          </Link>{" "}
          /{" "}
          <Link to="/news" className="hover:text-orange-600">
            Tin tức
          </Link>{" "}
          / <span className="text-orange-600">{news.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* ================= SIDEBAR ================= */}
          <aside className="lg:col-span-1 space-y-8">
            {/* Danh mục */}
            <div>
              <h3 className="font-semibold border-l-4 border-orange-600 pl-3 mb-4">
                DANH MỤC TIN TỨC
              </h3>

              <ul className="space-y-2 text-sm text-gray-700">
                <li>
                  <Link to="/">Trang chủ</Link>
                </li>
                <li>Nam</li>
                <li>Nữ</li>
                <li>Phụ kiện</li>
                <li>Khuyến mãi</li>
                <li className="text-orange-600 font-semibold">Tin tức</li>
                <li>Liên hệ</li>
              </ul>
            </div>

            {/* Tin mới nhất */}
            <div>
              <h3 className="font-semibold border-l-4 border-orange-600 pl-3 mb-4">
                TIN TỨC MỚI NHẤT
              </h3>

              {latestNews.map((item) => (
                <div key={item._id} className="flex gap-3 mb-4">
                  <img
                    src={`http://localhost:5000${item.thumbnail}`}
                    className="w-16 h-16 object-cover rounded"
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

            {/* Bán chạy (fake demo) */}
            <div>
              <h3 className="font-semibold border-l-4 border-orange-600 pl-3 mb-4">
                BÁN CHẠY
              </h3>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium">Váy bèo bó dáng</p>
                  <p className="text-orange-600 font-semibold">320.000 đ</p>
                </div>

                <div>
                  <p className="font-medium">Váy hoa</p>
                  <p className="text-orange-600 font-semibold">350.000 đ</p>
                </div>
              </div>
            </div>
          </aside>

          {/* ================= MAIN CONTENT ================= */}
          <div className="lg:col-span-3">
            <h1 className="text-3xl font-semibold mb-4">{news.title}</h1>

            <p className="text-sm text-gray-500 mb-6">
              Ngày đăng: {new Date(news.createdAt).toLocaleDateString()} | Người
              đăng: <span className="text-orange-600">{news.author}</span>
            </p>

            {/* Ảnh lớn đầu bài */}
            {news.thumbnail && (
              <img
                src={`http://localhost:5000${news.thumbnail}`}
                alt={news.title}
                className="w-full rounded-lg mb-6 object-cover"
              />
            )}

            {/* Nội dung HTML */}
            <div
              className="prose max-w-none text-gray-700 leading-7"
              dangerouslySetInnerHTML={{ __html: news.content }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
