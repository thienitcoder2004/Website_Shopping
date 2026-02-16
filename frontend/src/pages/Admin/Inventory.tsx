import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { productApi } from "../../api/product.api";
import { inventoryApi } from "../../api/inventory.api";
import type { TProduct } from "../../types/product.type";
import type { TInventoryLog } from "../../types/inventory.type";

function formatType(t: "IN" | "OUT" | "ADJUST") {
  if (t === "IN") return "Nhập kho";
  if (t === "OUT") return "Xuất ra web";
  return "Chỉnh kho";
}

export default function Inventory() {
  const [products, setProducts] = useState<TProduct[]>([]);
  const [selected, setSelected] = useState<string>("");

  const [logs, setLogs] = useState<TInventoryLog[]>([]);
  const [loading, setLoading] = useState(false);

  const [type, setType] = useState<"IN" | "OUT" | "ADJUST">("IN");
  const [qty, setQty] = useState<number>(1);
  const [note, setNote] = useState<string>("");

  const current = useMemo(
    () => products.find((p) => p._id === selected),
    [products, selected],
  );

  const loadProducts = async () => {
    const res = await productApi.list({ page: 1, limit: 500 });
    const items = res.data.data.items || [];
    setProducts(items);
    if (!selected && items[0]?._id) setSelected(items[0]._id);
  };

  const loadLogs = async (productId?: string) => {
    const res = await inventoryApi.history({ productId, page: 1, limit: 50 });
    setLogs(res.data.data.items || []);
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selected) loadLogs(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const onAdjust = async () => {
    if (!selected) return alert("Chọn sản phẩm");
    const n = Number(qty);
    if (!Number.isFinite(n) || n <= 0) return alert("Số lượng phải > 0");

    setLoading(true);
    try {
      await inventoryApi.adjust({ productId: selected, type, qty: n, note });
      await loadProducts();
      await loadLogs(selected);
      setQty(1);
      setNote("");
      alert("Cập nhật kho thành công");
    } catch (e: any) {
      alert(e?.response?.data?.message || "Lỗi cập nhật kho");
    } finally {
      setLoading(false);
    }
  };

  const shop = Number(current?.stock || 0);
  const wh = Number(current?.warehouseStock || 0);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center mb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">
            Quản lý kho tồn
          </h2>
          <div className="text-sm text-gray-600 mt-1">
            Nhập vào <b>Kho</b>, xuất ra <b>Web</b> (shop). Web chỉ hiển thị{" "}
            <b>stock (shop)</b>.
          </div>
        </div>

        <div className="md:ml-auto">
          <Link to="/admin/products">
            <button className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 font-semibold">
              ← Sản phẩm
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-4">
        {/* Left: action */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-extrabold text-gray-900">Thao tác kho</div>
            {current && (
              <div className="text-xs text-gray-500">
                SKU: <span className="font-semibold">{current.sku || "-"}</span>
              </div>
            )}
          </div>

          <label className="block text-sm font-semibold mb-1">Sản phẩm</label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white mb-3 outline-none focus:ring-2 focus:ring-orange-200"
          >
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} — Kho: {p.warehouseStock || 0} | Web: {p.stock || 0}
              </option>
            ))}
          </select>

          {/* Summary chips */}
          {current && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <div className="text-xs text-gray-600">Tồn kho</div>
                <div className="text-xl font-extrabold text-gray-900">{wh}</div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <div className="text-xs text-gray-600">Hiển thị web</div>
                <div className="text-xl font-extrabold text-gray-900">
                  {shop}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Loại</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="IN">Nhập kho (+ kho)</option>
                <option value="OUT">Xuất ra web (- kho, + web)</option>
                <option value="ADJUST">Chỉnh kho (set kho)</option>
              </select>

              <div className="mt-2 text-xs text-gray-500 leading-5">
                • IN: kho tăng, web không đổi
                <br />
                • OUT: kho giảm, web tăng
                <br />• ADJUST: set kho = qty, web giữ nguyên
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Số lượng
              </label>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>

          <label className="block text-sm font-semibold mb-1">Ghi chú</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-200"
            placeholder="VD: nhập lô mới, xuất trưng bày..."
          />

          <button
            onClick={onAdjust}
            disabled={loading}
            className="mt-3 w-full px-4 py-2 rounded-xl bg-orange-500 text-white font-extrabold hover:bg-orange-600 disabled:opacity-60"
          >
            {loading ? "Đang cập nhật..." : "Cập nhật"}
          </button>
        </div>

        {/* Right: history */}
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="p-4 border-b font-extrabold text-gray-900">
            Lịch sử kho {current ? `— ${current.name}` : ""}
          </div>

          <div className="overflow-auto">
            <table className="min-w-[1000px] w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-gray-700">
                  <th className="p-3 text-left font-bold">Thời gian</th>
                  <th className="p-3 text-left font-bold">Loại</th>
                  <th className="p-3 text-right font-bold">Qty</th>

                  <th className="p-3 text-right font-bold">Kho trước</th>
                  <th className="p-3 text-right font-bold">Kho sau</th>

                  <th className="p-3 text-right font-bold">Web trước</th>
                  <th className="p-3 text-right font-bold">Web sau</th>

                  <th className="p-3 text-left font-bold">Ghi chú</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {logs.map((l) => (
                  <tr key={l._id} className="hover:bg-gray-50/60">
                    <td className="p-3 whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleString()}
                    </td>

                    <td className="p-3">
                      <span className="font-extrabold">
                        {formatType(l.type)}
                      </span>
                      <div className="text-xs text-gray-500">{l.type}</div>
                    </td>

                    <td className="p-3 text-right font-extrabold">{l.qty}</td>

                    <td className="p-3 text-right">{l.beforeWarehouse}</td>
                    <td className="p-3 text-right font-extrabold">
                      {l.afterWarehouse}
                    </td>

                    <td className="p-3 text-right">{l.beforeShop}</td>
                    <td className="p-3 text-right font-extrabold">
                      {l.afterShop}
                    </td>

                    <td className="p-3">{l.note || "-"}</td>
                  </tr>
                ))}

                {!logs.length && (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-gray-500">
                      Chưa có lịch sử
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 text-xs text-gray-500 border-t bg-white">
            Web hiển thị theo <b>stock</b> (shop). Kho nội bộ là{" "}
            <b>warehouseStock</b>.
          </div>
        </div>
      </div>
    </div>
  );
}
