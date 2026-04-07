import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getNews, getNewsBySlug, type TNews } from "../../../api/news.api";

const API_BASE = "http://localhost:5000";

function getImageUrl(image?: string) {
  if (!image) return "/placeholder.png";
  if (image.startsWith("http")) return image;
  return `${API_BASE}${image.startsWith("/") ? image : `/${image}`}`;
}

function stripHtml(html?: string) {
  return (html || "").replace(/<[^>]+>/g, "").trim();
}

function getHtmlContent(item: TNews) {
  return (
    item.content ||
    item.description ||
    item.desc ||
    item.summary ||
    item.excerpt ||
    ""
  );
}

function getShortText(item: TNews) {
  return stripHtml(
    item.description ||
      item.desc ||
      item.summary ||
      item.excerpt ||
      item.content ||
      "",
  );
}

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const [news, setNews] = useState<TNews | null>(null);
  const [latestNews, setLatestNews] = useState<TNews[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchDetail() {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [detailRes, latestRes] = await Promise.all([
          getNewsBySlug(slug),
          getNews(1, { isPublished: true }),
        ]);

        const detail = detailRes.data?.data ?? null;
        const latestItems = latestRes.data?.data ?? [];

        if (!isMounted) return;

        setNews(detail);
        setLatestNews(Array.isArray(latestItems) ? latestItems.slice(0, 5) : []);
      } catch (error) {
        console.error("Lỗi lấy chi tiết tin tức:", error);

        if (!isMounted) return;

        setNews(null);
        setLatestNews([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const relatedNews = useMemo(() => {
    if (!news) return latestNews;
    return latestNews.filter((item) => item.slug && item.slug !== news.slug);
  }, [latestNews, news]);

  if (loading) {
    return (
      <section className="min-h-screen bg-white py-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="animate-pulse">
            <div className="mb-6 h-4 w-40 rounded bg-gray-200" />
            <div className="mb-4 h-8 w-2/3 rounded bg-gray-200" />
            <div className="mb-6 h-4 w-1/3 rounded bg-gray-200" />
            <div className="mb-8 h-[360px] w-full rounded bg-gray-200" />
            <div className="space-y-3">
              <div className="h-4 rounded bg-gray-200" />
              <div className="h-4 rounded bg-gray-200" />
              <div className="h-4 w-5/6 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!news) {
    return (
      <section className="min-h-screen bg-white py-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6 text-sm text-gray-500">
            <Link to="/" className="hover:text-orange-600">
              Trang chủ
            </Link>{" "}
            /{" "}
            <Link to="/new" className="hover:text-orange-600">
              Tin tức
            </Link>{" "}
            / <span className="font-medium text-orange-600">Chi tiết</span>
          </div>

          <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
            Không tìm thấy bài viết.
          </div>
        </div>
      </section>
    );
  }

  const title = news.title || "Chi tiết tin tức";
  const image = getImageUrl(news.thumbnail || news.image);
  const htmlContent = getHtmlContent(news);
  const plainText = getShortText(news);

  return (
    <section className="min-h-screen bg-white py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 text-sm text-gray-500">
          <Link to="/" className="hover:text-orange-600">
            Trang chủ
          </Link>{" "}
          /{" "}
          <Link to="/new" className="hover:text-orange-600">
            Tin tức
          </Link>{" "}
          / <span className="font-medium text-orange-600">Chi tiết</span>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">
          <aside className="space-y-8 lg:col-span-1">
            <div>
              <h3 className="mb-4 border-l-4 border-orange-600 pl-3 font-semibold">
                TIN TỨC MỚI NHẤT
              </h3>

              {relatedNews.length === 0 ? (
                <div className="text-sm text-gray-500">Chưa có tin mới.</div>
              ) : (
                relatedNews.map((item, index) => (
                  <div
                    key={item._id || item.id || item.slug || index}
                    className="mb-4 flex gap-3"
                  >
                    <img
                      src={getImageUrl(item.thumbnail || item.image)}
                      alt={item.title || "news"}
                      className="h-16 w-16 rounded-md object-cover"
                      loading="lazy"
                    />

                    {item.slug ? (
                      <Link
                        to={`/new/${item.slug}`}
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
                ))
              )}
            </div>
          </aside>

          <article className="lg:col-span-3">
            <h1 className="mb-3 text-3xl font-bold text-gray-900">{title}</h1>

            <p className="mb-6 text-sm text-gray-500">
              {news.createdAt
                ? new Date(news.createdAt).toLocaleDateString("vi-VN")
                : "Đang cập nhật"}
              {news.author ? ` | ${news.author}` : ""}
            </p>

            <img
              src={image}
              alt={title}
              className="mb-8 max-h-[500px] w-full rounded-xl object-cover"
            />

            {htmlContent ? (
              <div
                className="prose max-w-none prose-img:rounded-lg prose-p:leading-7"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            ) : (
              <div className="text-base leading-7 text-gray-700">
                {plainText || "Đang cập nhật nội dung..."}
              </div>
            )}

            <div className="mt-10">
              <Link
                to="/new"
                className="inline-flex items-center border px-4 py-2 text-sm transition hover:bg-orange-600 hover:text-white"
              >
                ← Quay lại danh sách tin tức
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}