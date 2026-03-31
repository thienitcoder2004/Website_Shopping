import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getNews, type TNews } from "../../../api/news.api";
import Pagination from "../../../components/common/Pagination";

const API_BASE = "http://localhost:5000";

function stripHtml(html?: string) {
  return (html || "").replace(/<[^>]+>/g, "").trim();
}

function getImageUrl(image?: string) {
  if (!image) return "/placeholder.png";
  if (image.startsWith("http")) return image;
  return `${API_BASE}${image.startsWith("/") ? image : `/${image}`}`;
}

function getNewsDescription(item: TNews) {
  return stripHtml(
    item.description ||
      item.desc ||
      item.summary ||
      item.excerpt ||
      item.content ||
      "",
  );
}

function getNewsSlug(item: TNews) {
  return item.slug || "";
}

export default function NewsPage() {
  const [newsData, setNewsData] = useState<TNews[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const latestNews = useMemo(() => newsData.slice(0, 4), [newsData]);

  useEffect(() => {
    let isMounted = true;

    async function run() {
      setLoading(true);

      try {
        const res = await getNews(currentPage, { isPublished: true });

        const items = res.data?.data ?? [];
        const nextTotalPages = res.data?.totalPages ?? 1;

        if (!isMounted) return;

        setNewsData(Array.isArray(items) ? items : []);
        setTotalPages(Number(nextTotalPages) || 1);
      } catch (err) {
        console.error("Lỗi lấy danh sách tin tức:", err);

        if (!isMounted) return;

        setNewsData([]);
        setTotalPages(1);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void run();

    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  return (
    <section className="min-h-screen bg-white py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 text-sm text-gray-500">
          <Link to="/" className="hover:text-orange-600">
            Trang chủ
          </Link>{" "}
          / <span className="font-medium text-orange-600">Tin tức</span>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">
          <aside className="space-y-8 lg:col-span-1">
            <div>
              <h3 className="mb-4 border-l-4 border-orange-600 pl-3 font-semibold">
                DANH MỤC TIN TỨC
              </h3>

              <ul className="space-y-2 text-sm text-gray-700">
                <li>
                  <Link to="/" className="hover:text-orange-600">
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products?gender=male"
                    className="hover:text-orange-600"
                  >
                    Nam
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products?gender=female"
                    className="hover:text-orange-600"
                  >
                    Nữ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products?category=accessories"
                    className="hover:text-orange-600"
                  >
                    Phụ kiện
                  </Link>
                </li>
                <li>
                  <Link to="/promotions" className="hover:text-orange-600">
                    Khuyến mãi
                  </Link>
                </li>
                <li className="font-medium text-orange-600">Tin tức</li>
                <li>
                  <Link to="/contact" className="hover:text-orange-600">
                    Liên hệ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 border-l-4 border-orange-600 pl-3 font-semibold">
                TIN TỨC MỚI NHẤT
              </h3>

              {latestNews.map((item, index) => {
                const newsSlug = getNewsSlug(item);

                return (
                  <div
                    key={item._id || item.id || item.slug || index}
                    className="mb-4 flex gap-3"
                  >
                    <img
                      src={getImageUrl(item.thumbnail || item.image)}
                      alt={item.title}
                      className="h-16 w-16 rounded-md object-cover"
                      loading="lazy"
                    />

                    {newsSlug ? (
                      <Link
                        to={`/new/${newsSlug}`}
                        className="line-clamp-3 text-xs hover:text-orange-600"
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <div className="line-clamp-3 text-xs text-gray-700">
                        {item.title}
                      </div>
                    )}
                  </div>
                );
              })}

              {!loading && latestNews.length === 0 && (
                <div className="text-sm text-gray-500">Chưa có tin mới.</div>
              )}
            </div>
          </aside>

          <div className="lg:col-span-3">
            {loading && (
              <div className="mb-4 text-gray-500">Đang tải tin tức...</div>
            )}

            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              {!loading &&
                newsData.map((item, index) => {
                  const newsSlug = getNewsSlug(item);
                  const desc = getNewsDescription(item);

                  return (
                    <div key={item._id || item.id || item.slug || index}>
                      <img
                        src={getImageUrl(item.thumbnail || item.image)}
                        alt={item.title}
                        className="mb-4 h-64 w-full rounded-lg object-cover"
                        loading="lazy"
                      />

                      <h3 className="mb-2 text-lg font-semibold hover:text-orange-600">
                        {newsSlug ? (
                          <Link to={`/new/${newsSlug}`}>{item.title}</Link>
                        ) : (
                          item.title
                        )}
                      </h3>

                      <p className="mb-3 text-xs text-gray-500">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                          : "Đang cập nhật"}{" "}
                        {item.author ? `| ${item.author}` : ""}
                      </p>

                      <p className="mb-4 text-sm leading-6 text-gray-600">
                        {desc
                          ? `${desc.slice(0, 150)}...`
                          : "Đang cập nhật nội dung..."}
                      </p>

                      {newsSlug && (
                        <Link
                          to={`/new/${newsSlug}`}
                          className="inline-flex items-center border px-4 py-2 text-sm transition hover:bg-orange-600 hover:text-white"
                        >
                          XEM CHI TIẾT
                        </Link>
                      )}
                    </div>
                  );
                })}
            </div>

            {!loading && newsData.length === 0 && (
              <div className="mt-4 text-gray-500">Chưa có bài viết.</div>
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