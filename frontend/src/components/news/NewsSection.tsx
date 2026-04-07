import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNews } from "../../api/news.api";

const API_BASE = "http://localhost:5000";

type TNews = {
  _id?: string;
  id?: string;
  title: string;
  slug?: string;
  content?: string;
  desc?: string;
  description?: string;
  summary?: string;
  excerpt?: string;
  image?: string;
  thumbnail?: string;
  createdAt?: string;
};

function getImageUrl(image?: string) {
  if (!image) return "/placeholder.png";
  if (image.startsWith("http")) return image;
  return `${API_BASE}${image.startsWith("/") ? image : `/${image}`}`;
}

function stripHtml(value?: string) {
  return (value || "").replace(/<[^>]+>/g, "").trim();
}

function getDescription(item: TNews) {
  return stripHtml(
    item.desc ||
      item.description ||
      item.summary ||
      item.excerpt ||
      item.content ||
      "",
  );
}

function getNewsId(item: TNews) {
  return item.slug || item._id || item.id || "";
}

export default function NewsSection() {
  const [newsList, setNewsList] = useState<TNews[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchNews() {
      try {
        setLoading(true);

        const res = await getNews(1);

        const items =
          res.data?.data?.items ||
          res.data?.data?.docs ||
          res.data?.data ||
          res.data?.items ||
          res.data?.docs ||
          res.data?.news ||
          [];

        if (isMounted) {
          setNewsList(Array.isArray(items) ? items.slice(0, 3) : []);
        }
      } catch (error) {
        console.error("Lỗi lấy tin tức:", error);
        if (isMounted) {
          setNewsList([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchNews();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-semibold border-l-4 border-orange-600 pl-3">
              TIN TỨC THỜI TRANG
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Tin tức mới nhất về thời trang trong nước và thế giới
            </p>
          </div>

          <Link
            to="/new"
            className="border border-orange-600 text-orange-600 px-5 py-2 hover:bg-orange-600 hover:text-white transition"
          >
            XEM THÊM
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-white overflow-hidden animate-pulse"
              >
                <div className="w-full h-[200px] bg-gray-200" />
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-3" />
                  <div className="h-3 bg-gray-200 rounded mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : newsList.length === 0 ? (
          <div className="bg-white p-8 text-center text-gray-500">
            Chưa có tin tức để hiển thị
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newsList.map((item, index) => {
              const newsId = getNewsId(item);
              const image = getImageUrl(item.thumbnail || item.image);
              const desc = getDescription(item);

              const content = (
                <>
                  <img
                    src={image}
                    alt={item.title}
                    className="w-full h-[200px] object-cover"
                  />

                  <div className="p-4">
                    <h3 className="text-sm font-semibold mb-2 line-clamp-2 min-h-[40px]">
                      {item.title}
                    </h3>

                    <p className="text-xs text-gray-500 line-clamp-3">
                      {desc || "Đang cập nhật nội dung..."}
                    </p>
                  </div>
                </>
              );

              if (!newsId) {
                return (
                  <div
                    key={item._id || item.id || index}
                    className="bg-white overflow-hidden"
                  >
                    {content}
                  </div>
                );
              }

              return (
                <Link
                  key={item._id || item.id || index}
                  to={`/new/${newsId}`}
                  className="block bg-white overflow-hidden transition duration-300 hover:shadow-lg"
                >
                  {content}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}