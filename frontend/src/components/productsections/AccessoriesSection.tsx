import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import saleImg from "../../assets/images/banner_1.png";
import { productApi, type TProduct } from "../../api/product.api";

const API_BASE = "http://localhost:5000";

type ProductWithExtra = TProduct & {
  category?: {
    _id?: string;
    name?: string;
    slug?: string;
  };
  categoryName?: string;
  categorySlug?: string;
};

function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + " đ";
}

function getImageUrl(image?: string) {
  if (!image) return "/placeholder.png";
  if (image.startsWith("http")) return image;
  return `${API_BASE}${image.startsWith("/") ? image : `/${image}`}`;
}

function normalizeText(value?: string) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isAccessoryProduct(product: ProductWithExtra) {
  const categoryName = normalizeText(product.category?.name);
  const categorySlug = normalizeText(product.category?.slug);
  const rawCategoryName = normalizeText(product.categoryName);
  const rawCategorySlug = normalizeText(product.categorySlug);
  const productName = normalizeText(product.name);

  const haystack = [
    categoryName,
    categorySlug,
    rawCategoryName,
    rawCategorySlug,
    productName,
  ].join(" ");

  return (
    haystack.includes("phu kien") ||
    haystack.includes("accessories") ||
    haystack.includes("accessory") ||
    haystack.includes("kinh") ||
    haystack.includes("mu") ||
    haystack.includes("that lung") ||
    haystack.includes("vi") ||
    haystack.includes("dong ho") ||
    haystack.includes("vong") ||
    haystack.includes("day deo") ||
    haystack.includes("khan")
  );
}

function getDisplayPrice(product: TProduct) {
  if (typeof product.salePrice === "number" && product.salePrice > 0) {
    return product.salePrice;
  }
  return product.price;
}

export default function AccessoriesSection() {
  const [products, setProducts] = useState<ProductWithExtra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      try {
        setLoading(true);

        const res = await productApi.list({
          page: 1,
          limit: 50,
          isActive: true,
          sort: "newest",
        });

        const items = res.data?.data?.items ?? [];

        if (isMounted) {
          setProducts(Array.isArray(items) ? (items as ProductWithExtra[]) : []);
        }
      } catch (error) {
        console.error("Lỗi lấy phụ kiện:", error);
        if (isMounted) {
          setProducts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const accessories = useMemo(() => {
    return products.filter(isAccessoryProduct).slice(0, 6);
  }, [products]);

  return (
    <section className="bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-semibold border-l-4 border-orange-600 pl-3">
              PHỤ KIỆN
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Các loại phụ kiện đi cùng với những trang phục của bạn
            </p>
          </div>

          <Link
            to="/products?category=accessories"
            className="border border-orange-600 text-orange-600 px-5 py-2 hover:bg-orange-600 hover:text-white transition"
          >
            XEM THÊM
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="relative overflow-hidden group min-h-[260px]">
            <img
              src={saleImg}
              alt="sale"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
              <p className="text-lg">SALE OFF</p>
              <h3 className="text-5xl font-bold">50%</h3>
              <p>tất cả phụ kiện</p>
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex gap-4 animate-pulse bg-white p-3">
                  <div className="w-20 h-20 bg-gray-200 shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                  </div>
                </div>
              ))
            ) : accessories.length === 0 ? (
              <div className="sm:col-span-2 bg-white p-8 text-center text-gray-500">
                Chưa có phụ kiện để hiển thị
              </div>
            ) : (
              accessories.map((item) => {
                const image =
                  item.images && item.images.length > 0
                    ? getImageUrl(item.images[0])
                    : "/placeholder.png";

                return (
                  <Link
                    key={item._id}
                    to={`/product/${item.slug || item._id}`}
                    className="flex gap-4 bg-white p-3 hover:shadow-md transition"
                  >
                    <img
                      src={image}
                      alt={item.name}
                      className="w-20 h-20 object-cover shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-medium mb-1 line-clamp-2">
                        {item.name}
                      </h4>
                      <p className="text-orange-600 font-semibold text-sm">
                        {formatPrice(getDisplayPrice(item))}
                      </p>
                      <span className="text-xs text-gray-500 hover:text-orange-600">
                        Xem chi tiết
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}