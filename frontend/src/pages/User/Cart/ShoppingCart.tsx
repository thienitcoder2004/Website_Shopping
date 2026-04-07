import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  CreditCard,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import type { CartItem } from "../../../types/cart.type";
import { useCart } from "../../../context/cart.context";
import CartItemsTable from "../../../components/ShoppingCart/CartItemsTable";
import CartSummaryCard from "../../../components/ShoppingCart/CartSummaryCard";

function formatPrice(v: number) {
  return v.toLocaleString("vi-VN") + "₫";
}

function lineKey(it: CartItem) {
  return `${it.id}-${it.variant?.color ?? ""}-${it.variant?.size ?? ""}`;
}

const DEFAULT_VISIBLE_ITEMS = 5;

export default function ShoppingCart() {
  const navigate = useNavigate();
  const { items, increase, decrease, removeItem } = useCart();

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState(false);

  const allKeys = useMemo(() => items.map(lineKey), [items]);

  const visibleItems = useMemo(() => {
    return showAll ? items : items.slice(0, DEFAULT_VISIBLE_ITEMS);
  }, [items, showAll]);

  const hiddenCount =
    items.length > DEFAULT_VISIBLE_ITEMS
      ? items.length - DEFAULT_VISIBLE_ITEMS
      : 0;

  const isChecked = (key: string) => selected[key] ?? true;

  const allChecked = allKeys.length > 0 && allKeys.every((k) => isChecked(k));
  const someChecked = allKeys.some((k) => isChecked(k));

  const selectedItems = items.filter((it) => isChecked(lineKey(it)));

  const totalSelected = selectedItems.reduce(
    (sum, it) => sum + it.price * it.quantity,
    0,
  );

  const totalQuantitySelected = selectedItems.reduce(
    (sum, it) => sum + it.quantity,
    0,
  );

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
    <section className="relative min-h-[80vh] overflow-hidden bg-gradient-to-b from-orange-50 via-white to-slate-50 py-8 md:py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-orange-100/60 blur-3xl" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-amber-100/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-rose-100/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="font-medium transition hover:text-orange-600">
            Trang chủ
          </Link>
          <ChevronRight size={15} />
          <span className="font-semibold text-orange-600">Giỏ hàng</span>
        </div>

        <div className="mb-6 overflow-hidden rounded-[28px] border border-orange-100 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="grid gap-5 px-5 py-6 md:grid-cols-[1.35fr_0.9fr] md:px-7 md:py-7">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
                <ShoppingBag size={14} />
                Mua sắm của bạn
              </div>

              <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-4xl">
                Giỏ hàng của bạn
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
                Kiểm tra lại sản phẩm, số lượng và lựa chọn các món hàng muốn
                thanh toán ngay. Mã giảm giá sẽ được nhập ở bước thanh toán để
                hệ thống kiểm tra chính xác.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                  <ShieldCheck size={16} />
                  Bảo mật thông tin đơn hàng
                </div>

                <div className="inline-flex items-center gap-2 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
                  <Truck size={16} />
                  Giao hàng toàn quốc
                </div>

                <div className="inline-flex items-center gap-2 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700">
                  <CreditCard size={16} />
                  Hỗ trợ COD và MoMo
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 self-start md:gap-4">
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tổng sản phẩm
                </p>
                <p className="mt-2 text-3xl font-black text-slate-900">
                  {items.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Tổng số dòng sản phẩm trong giỏ
                </p>
              </div>

              <div className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                  Đang chọn
                </p>
                <p className="mt-2 text-3xl font-black text-orange-600">
                  {selectedItems.length}
                </p>
                <p className="mt-1 text-xs text-orange-500">
                  Sản phẩm được chọn để thanh toán
                </p>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tổng số lượng
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {totalQuantitySelected}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Số lượng của các sản phẩm đang chọn
                </p>
              </div>

              <div className="rounded-3xl border border-orange-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tạm tính
                </p>
                <p className="mt-2 text-2xl font-black text-orange-600">
                  {formatPrice(totalSelected)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Chưa bao gồm giảm giá ở bước thanh toán
                </p>
              </div>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
            <div className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 px-6 py-10 text-center text-white">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-4xl backdrop-blur-sm">
                🛒
              </div>
              <h2 className="mt-5 text-2xl font-black md:text-3xl">
                Giỏ hàng của bạn đang trống
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/90 md:text-base">
                Hãy thêm những sản phẩm bạn yêu thích vào giỏ hàng để tiếp tục
                mua sắm và thanh toán nhanh chóng.
              </p>
            </div>

            <div className="px-6 py-8 text-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-700"
              >
                <ArrowLeft size={18} />
                Quay lại cửa hàng
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-5">
                <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_12px_35px_rgba(15,23,42,0.05)] md:p-5">
                  <div className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 md:text-xl">
                        Danh sách sản phẩm trong giỏ
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Chọn sản phẩm, thay đổi số lượng hoặc xóa sản phẩm không
                        cần thiết trước khi thanh toán.
                      </p>
                    </div>

                    <div className="inline-flex items-center rounded-2xl bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                      Hiển thị {visibleItems.length}/{items.length} sản phẩm
                    </div>
                  </div>

                  <CartItemsTable
                    items={items}
                    visibleItems={visibleItems}
                    showAll={showAll}
                    hiddenCount={hiddenCount}
                    defaultVisibleItems={DEFAULT_VISIBLE_ITEMS}
                    allChecked={allChecked}
                    isChecked={isChecked}
                    lineKey={lineKey}
                    toggleAll={toggleAll}
                    toggleOne={toggleOne}
                    increase={increase}
                    decrease={decrease}
                    removeItem={removeItem}
                    setShowAll={setShowAll}
                    formatPrice={formatPrice}
                  />
                </div>
              </div>

              <div className="xl:sticky xl:top-24 xl:self-start">
                <CartSummaryCard
                  selectedItemsCount={selectedItems.length}
                  totalQuantitySelected={totalQuantitySelected}
                  totalSelected={totalSelected}
                  someChecked={someChecked}
                  handleCheckout={handleCheckout}
                  formatPrice={formatPrice}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-white px-5 py-3 font-semibold text-orange-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-50"
              >
                <ArrowLeft size={18} />
                Tiếp tục mua hàng
              </Link>

              <div className="text-sm text-slate-500">
                Chọn sản phẩm trước, sau đó bấm{" "}
                <span className="font-semibold text-slate-700">Mua hàng</span>{" "}
                để chuyển sang bước thanh toán.
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
