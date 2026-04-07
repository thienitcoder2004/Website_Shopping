import { useEffect, useState } from "react";
import { productApi } from "../../../api/product.api";
import { Link } from "react-router-dom";
import { apiFile } from "../../../utils/apiFile";
import banner_sales from "../../../assets/images/banner-sales.png";

export default function SalePage() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const res = await productApi.list({
          hasSale: true,
          limit: 20,
        });
        setProducts(res.data.data.items || []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchSale();
  }, []);

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 🔥 BANNER */}
        <div className="mb-6">
          <img
            src={banner_sales}
            className="w-full h-48 object-cover rounded-2xl shadow"
          />
        </div>

        {/* 🔥 TITLE */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-red-500 flex items-center gap-2">
            🔥 FLASH SALE
          </h1>

          <span className="text-sm text-gray-500">Đang giảm giá cực sốc</span>
        </div>

        {/* 🔥 GRID */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {products.map((p) => {
            const discount = Math.round(
              ((p.price - p.salePrice) / p.price) * 100,
            );

            return (
              <Link
                key={p._id}
                to={`/products/${p.slug}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition group"
              >
                {/* IMAGE */}
                <div className="relative">
                  <img
                    src={apiFile(p.primaryImage || p.images?.[0])}
                    className="w-full h-48 object-cover group-hover:scale-105 transition"
                  />

                  {/* 🔥 DISCOUNT BADGE */}
                  <div className="absolute top-0 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded-br-lg font-bold">
                    -{discount}%
                  </div>

                  {/* 🔥 SALE ICON */}
                  {p.sale?.image && (
                    <img
                      src={apiFile(p.sale.image)}
                      className="absolute top-2 right-2 w-10 h-10"
                    />
                  )}
                </div>

                {/* INFO */}
                <div className="p-3">
                  <p className="text-sm line-clamp-2 h-10">{p.name}</p>

                  {/* PRICE */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-red-500 font-bold text-lg">
                      {p.salePrice?.toLocaleString()}đ
                    </span>
                  </div>

                  <span className="text-gray-400 line-through text-xs">
                    {p.price?.toLocaleString()}đ
                  </span>

                  {/* 🔥 PROGRESS BAR */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-red-500 h-2"
                        style={{
                          width: `${Math.min(
                            (p.sold / (p.stock + p.sold)) * 100,
                            100,
                          )}%`,
                        }}
                      ></div>
                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                      Đã bán {p.sold}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
