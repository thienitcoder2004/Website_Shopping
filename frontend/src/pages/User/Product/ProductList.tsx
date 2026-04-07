import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { productApi, type ProductListParams } from "../../../api/product.api";
import type { TProduct } from "../../../types/product.type";
import { apiFile } from "../../../utils/apiFile";

type ProductPromotion = {
  _id?: string;
  name?: string;
  type?: string;
  value?: number;
};

type ProductWithPricing = TProduct & {
  finalPrice?: number;
  originalPrice?: number;
  activePromotion?: ProductPromotion | null;
  primaryImage?: string;
};

function formatPrice(value: number) {
  return value.toLocaleString("vi-VN") + "₫";
}

export default function ProductList() {
  const { gender } = useParams();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [items, setItems] = useState<ProductWithPricing[]>([]);
  const [filtered, setFiltered] = useState<ProductWithPricing[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState(query);
  const [priceFilter, setPriceFilter] = useState<string[]>([]);

  // 🔥 Sync keyword khi query param thay đổi
  useEffect(() => {
    setKeyword(query);
  }, [query]);

  // 🔥 LOAD PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: ProductListParams = {
          page: 1,
          limit: 60,
          gender,
          isActive: true,
          q: keyword || undefined, // filter API theo từ khóa
        };
        const res = await productApi.list(params);
        const data = (res.data.data.items ?? []) as ProductWithPricing[];
        setItems(data);
      } finally {
        setLoading(false);
      }
    };
    void fetchProducts();
  }, [gender, keyword]);

  // 🔥 CLIENT FILTER
  useEffect(() => {
    let result = [...items];

    if (keyword) {
      result = result.filter((p) =>
        p.name?.toLowerCase().includes(keyword.toLowerCase()),
      );
    }

    if (priceFilter.length > 0) {
      result = result.filter((p) => {
        const price =
          p.finalPrice ??
          (p.salePrice && p.salePrice > 0 ? p.salePrice : p.price) ??
          0;

        return priceFilter.some((range) => {
          if (range === "100") return price < 100000;
          if (range === "200") return price >= 100000 && price < 200000;
          if (range === "500") return price >= 200000 && price < 500000;
          if (range === "1000") return price >= 500000;
          return false;
        });
      });
    }

    setFiltered(result);
  }, [keyword, priceFilter, items]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params: ProductListParams = {
        page: 1,
        limit: 60,
        gender,
        isActive: true,
        q: keyword,
      };
      const res = await productApi.list(params);
      setItems(res.data.data.items ?? []);
    } finally {
      setLoading(false);
    }
  };

  const togglePrice = (value: string) => {
    setPriceFilter((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value],
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Sản phẩm</h2>

      <div className="flex gap-6">
        {/* FILTER LEFT */}
        <div className="w-[250px] hidden md:block">
          <div className="bg-white p-4 rounded-xl border space-y-4">
            <h3 className="font-bold">Bộ lọc</h3>

            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />

            <div>
              <div className="font-semibold mb-2">Khoảng giá</div>
              <div className="space-y-2 text-sm">
                <label className="flex gap-2">
                  <input type="checkbox" onChange={() => togglePrice("100")} />
                  Dưới 100.000
                </label>
                <label className="flex gap-2">
                  <input type="checkbox" onChange={() => togglePrice("200")} />
                  100.000 - 200.000
                </label>
                <label className="flex gap-2">
                  <input type="checkbox" onChange={() => togglePrice("500")} />
                  200.000 - 500.000
                </label>
                <label className="flex gap-2">
                  <input type="checkbox" onChange={() => togglePrice("1000")} />
                  Trên 500.000
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* PRODUCT GRID */}
        <div className="flex-1">
          {loading ? (
            <div>Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div>Không có sản phẩm</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((p, idx) => {
                const thumb = p.primaryImage || p.images?.[0] || "";
                const stock = p.stock ?? 0;
                const currentPrice =
                  p.finalPrice ??
                  (p.salePrice && p.salePrice > 0 ? p.salePrice : p.price) ??
                  0;
                const comparePrice =
                  p.originalPrice ??
                  (p.salePrice && p.salePrice > 0 ? p.price : 0) ??
                  0;

                return (
                  <Link
                    key={p._id || `${p.name}-${idx}`}
                    to={`/products/${p.slug}`}
                    className="border rounded-xl overflow-hidden bg-white hover:shadow-md"
                  >
                    <div className="h-[220px] bg-gray-100">
                      <img
                        src={apiFile(thumb)}
                        className="w-full h-full object-cover"
                        alt={p.name}
                      />
                    </div>
                    <div className="p-3">
                      <div className="font-semibold line-clamp-2">{p.name}</div>
                      <div className="mt-2">
                        {comparePrice > currentPrice ? (
                          <>
                            <div className="text-orange-600 font-bold">
                              {formatPrice(currentPrice)}
                            </div>
                            <div className="text-sm line-through text-gray-400">
                              {formatPrice(comparePrice)}
                            </div>
                          </>
                        ) : (
                          <div className="font-bold">
                            {formatPrice(currentPrice)}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {stock > 0 ? `Còn ${stock}` : "Hết hàng"}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
