import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { productApi, type TProduct } from "../../api/product.api";

const API_BASE = "http://localhost:5000";

function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + " đ";
}

function getImageUrl(image?: string) {
  if (!image) return "/placeholder.png";
  if (image.startsWith("http")) return image;
  return `${API_BASE}${image.startsWith("/") ? image : `/${image}`}`;
}

function getDisplayPrice(product: TProduct) {
  if (typeof product.salePrice === "number" && product.salePrice > 0) {
    return product.salePrice;
  }
  return product.price;
}

function getOldPrice(product: TProduct) {
  if (
    typeof product.salePrice === "number" &&
    product.salePrice > 0 &&
    product.salePrice < product.price
  ) {
    return product.price;
  }
  return undefined;
}

function getDiscountPercent(product: TProduct) {
  if (
    typeof product.salePrice !== "number" ||
    product.salePrice <= 0 ||
    product.salePrice >= product.price
  ) {
    return null;
  }

  return Math.round(((product.price - product.salePrice) / product.price) * 100);
}

export default function BestSellerSection() {
  const [products, setProducts] = useState<TProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      try {
        setLoading(true);

        const res = await productApi.list({
          page: 1,
          limit: 8,
          isActive: true,
          sort: "newest",
        });

        const items = res.data?.data?.items ?? [];

        if (isMounted) {
          setProducts(Array.isArray(items) ? items : []);
        }
      } catch (error) {
        console.error("Lỗi lấy sản phẩm bán chạy:", error);
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

  const displayProducts = useMemo(() => {
    return products.slice(0, 8);
  }, [products]);

  return (
    <section className="bg-gray-100 py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="border-l-4 border-orange-600 pl-3 text-2xl font-semibold">
              SẢN PHẨM BÁN CHẠY
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Chào thu với những mẫu sản phẩm mới nhất
            </p>
          </div>

          <Link
            to="/products"
            className="border border-orange-600 px-5 py-2 text-orange-600 transition hover:bg-orange-600 hover:text-white"
          >
            XEM THÊM
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse bg-white p-4">
                <div className="h-[250px] w-full bg-gray-200" />
                <div className="mt-4">
                  <div className="mb-3 h-4 rounded bg-gray-200" />
                  <div className="mx-auto h-4 w-2/3 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="bg-white p-8 text-center text-gray-500">
            Chưa có sản phẩm để hiển thị
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {displayProducts.map((item) => {
              const image =
                item.images && item.images.length > 0
                  ? getImageUrl(item.images[0])
                  : "/placeholder.png";

              const displayPrice = getDisplayPrice(item);
              const oldPrice = getOldPrice(item);
              const discount = getDiscountPercent(item);

              return (
                <Link
                  to={`/product/${item.slug || item._id}`}
                  key={item._id}
                  className="block bg-white p-4 transition duration-300 hover:shadow-lg group"
                >
                  <div className="relative overflow-hidden">
                    {discount !== null && (
                      <div className="absolute left-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        -{discount}%
                      </div>
                    )}

                    <img
                      src={image}
                      alt={item.name}
                      className="h-[250px] w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="mt-4 text-center">
                    <h3 className="mb-2 min-h-[40px] line-clamp-2 text-sm font-medium">
                      {item.name}
                    </h3>

                    {displayPrice > 0 ? (
                      <div className="space-x-2">
                        <span className="font-semibold text-orange-600">
                          {formatPrice(displayPrice)}
                        </span>

                        {oldPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(oldPrice)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="font-semibold text-orange-600">Liên hệ</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}