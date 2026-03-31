import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import banner from "../../assets/images/banner_1.png";
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
  gender?: string;
  targetGender?: string;
};

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

function normalizeText(value?: string) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isMaleProduct(product: ProductWithExtra) {
  const categoryName = normalizeText(product.category?.name);
  const categorySlug = normalizeText(product.category?.slug);
  const rawCategoryName = normalizeText(product.categoryName);
  const rawCategorySlug = normalizeText(product.categorySlug);
  const gender = normalizeText(product.gender || product.targetGender);

  const haystack = [
    categoryName,
    categorySlug,
    rawCategoryName,
    rawCategorySlug,
    gender,
  ].join(" ");

  return (
    haystack.includes("nam") ||
    haystack.includes("male") ||
    haystack.includes("men") ||
    haystack.includes("thoi trang nam")
  );
}

function isFemaleProduct(product: ProductWithExtra) {
  const categoryName = normalizeText(product.category?.name);
  const categorySlug = normalizeText(product.category?.slug);
  const rawCategoryName = normalizeText(product.categoryName);
  const rawCategorySlug = normalizeText(product.categorySlug);
  const gender = normalizeText(product.gender || product.targetGender);

  const haystack = [
    categoryName,
    categorySlug,
    rawCategoryName,
    rawCategorySlug,
    gender,
  ].join(" ");

  return (
    haystack.includes("nu") ||
    haystack.includes("female") ||
    haystack.includes("women") ||
    haystack.includes("thoi trang nu")
  );
}

export default function CategoryProductSection() {
  const [active, setActive] = useState<"male" | "female">("male");
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
        console.error("Lỗi lấy danh mục sản phẩm:", error);
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

  const maleProducts = useMemo(() => {
    return products.filter(isMaleProduct).slice(0, 8);
  }, [products]);

  const femaleProducts = useMemo(() => {
    return products.filter(isFemaleProduct).slice(0, 8);
  }, [products]);

  const displayProducts = active === "male" ? maleProducts : femaleProducts;

  return (
    <section className="bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-semibold border-l-4 border-orange-600 pl-3">
              DANH MỤC SẢN PHẨM
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Các sản phẩm thời trang nam, nữ phù hợp với nhiều lứa tuổi
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setActive("male")}
              className={`px-6 py-2 border transition ${
                active === "male"
                  ? "bg-orange-600 text-white border-orange-600"
                  : "border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
              }`}
            >
              Nam
            </button>

            <button
              onClick={() => setActive("female")}
              className={`px-6 py-2 border transition ${
                active === "female"
                  ? "bg-orange-600 text-white border-orange-600"
                  : "border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
              }`}
            >
              Nữ
            </button>
          </div>
        </div>

        <div className="mb-8">
          <img
            src={banner}
            alt="banner"
            className="w-full h-[180px] object-cover"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white p-4 animate-pulse">
                <div className="w-full h-[250px] bg-gray-200" />
                <div className="mt-4">
                  <div className="h-4 bg-gray-200 rounded mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="bg-white p-8 text-center text-gray-500">
            Chưa có sản phẩm {active === "male" ? "nam" : "nữ"} để hiển thị
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                  className="bg-white p-4 hover:shadow-lg transition duration-300 group block"
                >
                  <div className="relative overflow-hidden">
                    {discount !== null && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold w-10 h-10 flex items-center justify-center rounded-full">
                        -{discount}%
                      </div>
                    )}

                    <img
                      src={image}
                      alt={item.name}
                      className="w-full h-[250px] object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>

                  <div className="mt-4 text-center">
                    <h3 className="text-sm font-medium mb-2 min-h-[40px] line-clamp-2">
                      {item.name}
                    </h3>

                    {displayPrice > 0 ? (
                      <div>
                        <span className="text-orange-600 font-semibold">
                          {formatPrice(displayPrice)}
                        </span>

                        {oldPrice && (
                          <span className="text-gray-400 line-through text-sm ml-2">
                            {formatPrice(oldPrice)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-orange-600 font-semibold">Liên hệ</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to={active === "male" ? "/products?gender=male" : "/products?gender=female"}
            className="inline-block border border-gray-400 px-6 py-2 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition"
          >
            XEM THÊM
          </Link>
        </div>
      </div>
    </section>
  );
}