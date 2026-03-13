import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { CartItem } from "../types/cart.type";
import { useCart } from "../context/cart.context";
import { apiFile } from "../utils/apiFile";

function formatPrice(v: number) {
  return v.toLocaleString("vi-VN") + "₫";
}

function lineKey(it: CartItem) {
  return `${it.id}-${it.variant?.color ?? ""}-${it.variant?.size ?? ""}`;
}

export default function ShoppingCart() {
  const navigate = useNavigate();
  const { items, increase, decrease, removeItem } = useCart();

  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const allKeys = useMemo(() => items.map(lineKey), [items]);

  const allChecked = useMemo(() => {
    if (!allKeys.length) return false;
    return allKeys.every((k) => selected[k] ?? true);
  }, [allKeys, selected]);

  const someChecked = useMemo(() => {
    return allKeys.some((k) => selected[k] ?? true);
  }, [allKeys, selected]);

  const toggleAll = (value: boolean) => {
    const next: Record<string, boolean> = {};
    for (const k of allKeys) next[k] = value;
    setSelected(next);
  };

  const toggleOne = (key: string, value: boolean) => {
    setSelected((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const selectedItems = useMemo(() => {
    return items.filter((it) => selected[lineKey(it)] ?? true);
  }, [items, selected]);

  const totalSelected = useMemo(() => {
    return selectedItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
  }, [selectedItems]);

  const removeSelected = () => {
    if (!someChecked) return;
    if (!window.confirm("Xóa các sản phẩm đã chọn?")) return;

    for (const it of selectedItems) {
      removeItem(it.id, it.variant);
    }
  };

  const handleCheckout = () => {
    if (!someChecked) return;

    const checkoutItems = selectedItems.map((it) => ({
      id: it.id,
      name: it.name,
      price: it.price,
      quantity: it.quantity,
      image: it.image,
      variant: {
        color: it.variant?.color || "",
        size: it.variant?.size || "",
      },
    }));

    localStorage.setItem("checkout_items", JSON.stringify(checkoutItems));
    navigate("/checkout");
  };

  return (
    <section className="bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-sm text-gray-600 mb-5">
          <Link to="/" className="hover:underline">
            Trang chủ
          </Link>{" "}
          / <span className="text-orange-600">Giỏ hàng</span>
        </div>

        <h2 className="text-2xl font-semibold mb-5">Giỏ hàng của bạn</h2>

        {items.length === 0 ? (
          <div className="bg-white p-8 text-gray-600 rounded-lg">
            Không có sản phẩm nào.{" "}
            <Link to="/" className="text-orange-600 underline">
              Quay lại cửa hàng
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="hidden md:grid grid-cols-[44px_1fr_140px_160px_140px_140px] items-center gap-3 px-4 py-4 text-sm text-gray-600 border-b">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={(e) => toggleAll(e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
                <div className="font-medium text-gray-800">Sản Phẩm</div>
                <div className="text-center">Đơn Giá</div>
                <div className="text-center">Số Lượng</div>
                <div className="text-center">Số Tiền</div>
                <div className="text-center">Thao Tác</div>
              </div>

              <div className="divide-y">
                {items.map((it) => {
                  const k = lineKey(it);
                  const img = it.image ? apiFile(it.image) : "";
                  const amount = it.price * it.quantity;

                  const variantText = [
                    it.variant?.color ? `Màu: ${it.variant.color}` : "",
                    it.variant?.size ? `Size: ${it.variant.size}` : "",
                  ]
                    .filter(Boolean)
                    .join(" | ");

                  return (
                    <div
                      key={k}
                      className="px-4 py-4 hover:bg-gray-50/70 transition"
                    >
                      <div className="hidden md:grid grid-cols-[44px_1fr_140px_160px_140px_140px] items-center gap-3">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={selected[k] ?? true}
                            onChange={(e) => toggleOne(k, e.target.checked)}
                            className="h-4 w-4"
                          />
                        </div>

                        <div className="flex gap-3">
                          <div className="w-20 h-20 bg-gray-50 border rounded-md overflow-hidden flex items-center justify-center">
                            {img ? (
                              <img
                                src={img}
                                alt={it.name}
                                className="w-full h-full object-cover"
                                draggable={false}
                              />
                            ) : (
                              <div className="text-xs text-gray-400">
                                No image
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 line-clamp-2">
                              {it.name}
                            </div>
                            {variantText && (
                              <div className="text-xs text-gray-500 mt-1">
                                Phân loại hàng:{" "}
                                <span className="text-gray-700">
                                  {variantText}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-center text-gray-800">
                          {formatPrice(it.price)}
                        </div>

                        <div className="flex justify-center">
                          <div className="inline-flex items-center border rounded-md overflow-hidden bg-white">
                            <button
                              type="button"
                              onClick={() => decrease(it.id, it.variant)}
                              className="px-3 py-2 hover:bg-gray-50 border-r"
                            >
                              -
                            </button>
                            <div className="w-10 text-center font-medium">
                              {it.quantity}
                            </div>
                            <button
                              type="button"
                              onClick={() => increase(it.id, it.variant)}
                              className="px-3 py-2 hover:bg-gray-50 border-l"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="text-center font-semibold text-orange-600">
                          {formatPrice(amount)}
                        </div>

                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(it.id, it.variant)}
                            className="text-gray-700 hover:text-red-600 font-medium"
                          >
                            Xóa
                          </button>
                          <div className="mt-1 text-xs text-orange-600 cursor-pointer select-none">
                            Tìm sản phẩm tương tự ▾
                          </div>
                        </div>
                      </div>

                      <div className="md:hidden">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selected[k] ?? true}
                            onChange={(e) => toggleOne(k, e.target.checked)}
                            className="h-4 w-4 mt-1"
                          />

                          <div className="w-20 h-20 bg-gray-50 border rounded-md overflow-hidden flex items-center justify-center">
                            {img ? (
                              <img
                                src={img}
                                alt={it.name}
                                className="w-full h-full object-cover"
                                draggable={false}
                              />
                            ) : (
                              <div className="text-xs text-gray-400">
                                No image
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 line-clamp-2">
                              {it.name}
                            </div>

                            {variantText && (
                              <div className="text-xs text-gray-500 mt-1">
                                Phân loại:{" "}
                                <span className="text-gray-700">
                                  {variantText}
                                </span>
                              </div>
                            )}

                            <div className="mt-2 flex items-center justify-between">
                              <div className="text-orange-600 font-semibold">
                                {formatPrice(it.price)}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeItem(it.id, it.variant)}
                                className="text-sm text-red-600"
                              >
                                Xóa
                              </button>
                            </div>

                            <div className="mt-2 flex items-center justify-between">
                              <div className="inline-flex items-center border rounded-md overflow-hidden bg-white">
                                <button
                                  type="button"
                                  onClick={() => decrease(it.id, it.variant)}
                                  className="px-3 py-2 hover:bg-gray-50 border-r"
                                >
                                  -
                                </button>
                                <div className="w-10 text-center font-medium">
                                  {it.quantity}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => increase(it.id, it.variant)}
                                  className="px-3 py-2 hover:bg-gray-50 border-l"
                                >
                                  +
                                </button>
                              </div>

                              <div className="text-orange-600 font-semibold">
                                {formatPrice(amount)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 text-xs text-orange-600 cursor-pointer select-none ml-7">
                          Tìm sản phẩm tương tự ▾
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 bg-white rounded-lg shadow-sm p-4 flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={(e) => toggleAll(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm text-gray-700">
                  Chọn tất cả ({items.length})
                </span>

                <button
                  type="button"
                  onClick={removeSelected}
                  disabled={!someChecked}
                  className="text-sm text-gray-700 hover:text-red-600 disabled:opacity-50 disabled:hover:text-gray-700"
                >
                  Xóa
                </button>
              </div>

              <div className="md:ml-auto flex items-center justify-between md:justify-end gap-4">
                <div className="text-sm text-gray-700">
                  Tổng thanh toán ({selectedItems.length} sản phẩm):{" "}
                  <span className="text-xl font-extrabold text-orange-600">
                    {formatPrice(totalSelected)}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={!someChecked}
                  onClick={handleCheckout}
                  className="px-6 py-3 rounded-md bg-orange-600 text-white font-bold hover:bg-orange-700 disabled:opacity-50 disabled:hover:bg-orange-600"
                >
                  Mua Hàng
                </button>
              </div>
            </div>

            <div className="mt-4">
              <Link
                to="/"
                className="inline-block bg-gray-200 px-6 py-3 hover:bg-gray-300 rounded-md"
              >
                TIẾP TỤC MUA HÀNG
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}