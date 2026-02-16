import { useEffect, useMemo, useState } from "react";
import { productApi } from "../../api/product.api";
import { Link } from "react-router-dom";
import type { TProduct } from "../../types/product.type";

export default function ProductListAdmin() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<TProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await productApi.list({ q, page: 1, limit: 100 });
      setItems(res.data.data.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalStock = useMemo(
    () => items.reduce((sum, p) => sum + (p.stock || 0), 0),
    [items],
  );

  const onDelete = async (id: string) => {
    if (!confirm("Xóa sản phẩm này?")) return;
    await productApi.remove(id);
    await fetchData();
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4 mb-4">
        <div>
          <h2 className="text-xl font-extrabold">Quản lý sản phẩm</h2>
          <div className="text-sm text-gray-600 mt-1">
            Tổng tồn:{" "}
            <span className="font-bold text-gray-900">{totalStock}</span>
          </div>
        </div>

        <div className="md:ml-auto flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm tên / SKU / slug"
              className="w-full sm:w-72 rounded-xl border border-gray-200 bg-white px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-orange-200"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              ⌕
            </span>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 font-semibold hover:bg-gray-50 disabled:opacity-60"
          >
            {loading ? "Đang tải..." : "Tìm"}
          </button>

          <Link to="/admin/products/new">
            <button className="rounded-xl bg-orange-500 px-4 py-2 font-extrabold text-white hover:bg-orange-600">
              + Thêm
            </button>
          </Link>

          <Link to="/admin/inventory">
            <button className="rounded-xl border border-gray-200 bg-white px-4 py-2 font-semibold hover:bg-gray-50">
              Kho tồn
            </button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-[980px] w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-700">
                <th className="p-3 font-bold">Tên</th>
                <th className="p-3 font-bold text-right">Giá</th>
                <th className="p-3 font-bold text-right">Tồn</th>
                <th className="p-3 font-bold">Màu</th>
                <th className="p-3 font-bold">Size</th>
                <th className="p-3 font-bold text-right">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {items.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50/60">
                  <td className="p-3">
                    <div className="font-extrabold text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{p.slug}</div>
                  </td>

                  <td className="p-3 text-right font-extrabold text-gray-900">
                    {(p.salePrice && p.salePrice > 0
                      ? p.salePrice
                      : p.price
                    ).toLocaleString()}
                    ₫
                    {p.salePrice && p.salePrice > 0 && (
                      <div className="text-xs font-semibold text-gray-400 line-through">
                        {p.price.toLocaleString()}₫
                      </div>
                    )}
                  </td>

                  <td className="p-3 text-right">
                    <span
                      className={`inline-flex rounded-lg px-2 py-1 text-xs font-bold ${
                        (p.stock || 0) > 0
                          ? "bg-green-50 text-green-700 border border-green-100"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {p.stock || 0}
                    </span>
                  </td>

                  <td className="p-3">
                    {p.colors?.length ? (
                      <div className="max-w-[220px] truncate text-gray-800">
                        {p.colors.join(", ")}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  <td className="p-3">
                    {p.sizes?.length ? (
                      <div className="max-w-[220px] truncate text-gray-800">
                        {p.sizes.join(", ")}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/products/${p._id}`}>
                        <button className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-extrabold hover:bg-gray-50">
                          Sửa
                        </button>
                      </Link>

                      <button
                        onClick={() => onDelete(p._id)}
                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-extrabold text-red-600 hover:bg-red-100"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!items.length && !loading && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        <div className="px-4 py-3 text-xs text-gray-500 border-t bg-white">
          Tip: Bạn có thể tìm theo <b>name</b>, <b>sku</b> hoặc <b>slug</b>.
        </div>
      </div>
    </div>
  );
}
