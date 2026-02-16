import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productApi } from "../../api/product.api";
import type { TProduct } from "../../types/product.type";
import { apiFile } from "../../utils/apiFile";

export default function ProductList() {
  const [items, setItems] = useState<TProduct[]>([]);

  useEffect(() => {
    const run = async () => {
      const res = await productApi.list({ page: 1, limit: 60, isActive: true });
      setItems(res.data.data.items);
    };
    run();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Sản phẩm</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((p: any) => {
          const thumb = p.primaryImage || p.images?.[0] || "";
          return (
            <Link
              key={p._id}
              to={`/products/${p.slug}`}
              className="border rounded-xl overflow-hidden bg-white hover:shadow-sm transition"
            >
              <div className="h-[240px] bg-gray-50">
                {thumb ? (
                  <img
                    src={apiFile(thumb)}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>

              <div className="p-3">
                <div className="font-bold line-clamp-2 min-h-[44px]">
                  {p.name}
                </div>
                <div className="mt-2 font-extrabold">
                  {(p.salePrice && p.salePrice > 0
                    ? p.salePrice
                    : p.price
                  ).toLocaleString()}
                  ₫
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  {p.stock > 0 ? `Còn hàng: ${p.stock}` : "Hết hàng"}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
