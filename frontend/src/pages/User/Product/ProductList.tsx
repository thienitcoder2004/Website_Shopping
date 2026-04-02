import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom"; // 🔥 thêm useParams
import { productApi } from "../../../api/product.api";
import type { TProduct } from "../../../types/product.type";
import { apiFile } from "../../../utils/apiFile";

type ProductPromotion = {
  _id?: string;
  name?: string;
  type?: string;
  value?: number;
  maxDiscount?: number;
  startDate?: string;
  endDate?: string;
  saleStock?: number;
  soldCount?: number;
  perUserLimit?: number;
  priority?: number;
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
  const { gender } = useParams(); // 🔥 lấy từ URL

  const [items, setItems] = useState<ProductWithPricing[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);

        const res = await productApi.list({
          page: 1,
          limit: 60,
          isActive: true,
          gender, // 🔥 thêm dòng này
        });

        setItems((res.data.data.items ?? []) as ProductWithPricing[]);
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [gender]); // 🔥 thêm dependency

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* 🔥 title dynamic */}
      <h2 className="text-xl font-bold mb-4">
        Sản phẩm{" "}
        {gender === "nam"
          ? "Nam"
          : gender === "nu"
            ? "Nữ"
            : gender === "unisex"
              ? "Unisex"
              : ""}
      </h2>

      {loading ? (
        <div className="text-gray-500">Đang tải sản phẩm...</div>
      ) : items.length === 0 ? (
        <div className="text-gray-500">Chưa có sản phẩm nào</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((p) => {
            const thumb = p.primaryImage || p.images?.[0] || "";
            const stock = p.stock ?? 0;

            const hasPromotion = !!p.activePromotion;

            const currentPrice = Number(
              p.finalPrice ??
                (p.salePrice && p.salePrice > 0 ? p.salePrice : p.price) ??
                0,
            );

            const comparePrice = Number(
              p.originalPrice ??
                (p.salePrice && p.salePrice > 0 ? p.price : 0) ??
                0,
            );

            return (
              <Link
                key={p._id}
                to={`/products/${p.slug}`}
                className="border rounded-xl overflow-hidden bg-white hover:shadow-sm transition group"
              >
                <div className="relative h-[240px] bg-gray-50 overflow-hidden">
                  {thumb ? (
                    <img
                      src={apiFile(thumb)}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}

                  {hasPromotion && (
                    <div className="absolute top-2 left-2">
                      <span className="inline-block px-2 py-1 rounded-md bg-red-500 text-white text-xs font-bold shadow">
                        {p.activePromotion?.type === "percentage"
                          ? `-${p.activePromotion?.value || 0}%`
                          : p.activePromotion?.name || "Flash Sale"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <div className="font-bold line-clamp-2 min-h-[44px]">
                    {p.name}
                  </div>

                  <div className="mt-2">
                    {(hasPromotion ||
                      (p.salePrice && p.salePrice > 0 && comparePrice > 0)) &&
                    comparePrice > currentPrice ? (
                      <div className="space-y-1">
                        <div className="font-extrabold text-orange-600">
                          {formatPrice(currentPrice)}
                        </div>
                        <div className="text-sm text-gray-500 line-through">
                          {formatPrice(comparePrice)}
                        </div>
                      </div>
                    ) : (
                      <div className="font-extrabold">
                        {formatPrice(currentPrice)}
                      </div>
                    )}
                  </div>

                  {hasPromotion && p.activePromotion?.name && (
                    <div className="mt-1 text-xs text-red-500 font-semibold line-clamp-1">
                      {p.activePromotion.name}
                    </div>
                  )}

                  <div className="mt-1 text-xs text-gray-600">
                    {stock > 0 ? `Còn hàng: ${stock}` : "Hết hàng"}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
