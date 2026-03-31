import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { CartItem } from "../../../types/cart.type";
import { useCart } from "../../../context/cart.context";
import CartCouponCard from "../../../components/ShoppingCart/CartCouponCard";
import CartItemsTable from "../../../components/ShoppingCart/CartItemsTable";
import CartSummaryCard from "../../../components/ShoppingCart/CartSummaryCard";

function formatPrice(v: number) {
  return v.toLocaleString("vi-VN") + "₫";
}

function lineKey(it: CartItem) {
  return `${it.id}-${it.variant?.color ?? ""}-${it.variant?.size ?? ""}`;
}

const DEFAULT_VISIBLE_ITEMS = 5;
const COUPON_STORAGE_KEY = "checkout_coupon_code";

export default function ShoppingCart() {
  const navigate = useNavigate();
  const { items, increase, decrease, removeItem } = useCart();

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState(false);
  const [couponCode, setCouponCode] = useState(
    () => localStorage.getItem(COUPON_STORAGE_KEY) || "",
  );
  const [savedCouponCode, setSavedCouponCode] = useState(
    () => localStorage.getItem(COUPON_STORAGE_KEY) || "",
  );

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

  const handleSaveCoupon = () => {
    const normalized = couponCode.trim().toUpperCase();

    if (!normalized) {
      window.alert("Vui lòng nhập mã giảm giá");
      return;
    }

    localStorage.setItem(COUPON_STORAGE_KEY, normalized);
    setCouponCode(normalized);
    setSavedCouponCode(normalized);
  };

  const handleRemoveCoupon = () => {
    localStorage.removeItem(COUPON_STORAGE_KEY);
    setCouponCode("");
    setSavedCouponCode("");
  };

  const handleQuickSelectCoupon = (code: string) => {
    setCouponCode(code);
    localStorage.setItem(COUPON_STORAGE_KEY, code);
    setSavedCouponCode(code);
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

    if (couponCode.trim()) {
      localStorage.setItem(COUPON_STORAGE_KEY, couponCode.trim().toUpperCase());
    }

    navigate("/checkout");
  };

  return (
    <section className="min-h-[70vh] bg-gradient-to-b from-orange-50 via-white to-white py-6 md:py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-4 text-sm text-gray-500">
          <Link to="/" className="transition hover:text-orange-600">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <span className="font-semibold text-orange-600">Giỏ hàng</span>
        </div>

        <div className="mb-5 rounded-3xl border border-orange-100 bg-white px-5 py-5 shadow-[0_10px_35px_rgba(0,0,0,0.05)] md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                Mua sắm của bạn
              </p>
              <h1 className="mt-1 text-2xl font-bold text-gray-900 md:text-3xl">
                Giỏ hàng của bạn
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Chọn sản phẩm muốn thanh toán và tiếp tục đặt hàng
              </p>
            </div>

            {items.length > 0 && (
              <div className="grid grid-cols-2 gap-3 md:min-w-[260px]">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-xs text-gray-500">Tổng sản phẩm</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {items.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3">
                  <p className="text-xs text-gray-500">Đang chọn</p>
                  <p className="mt-1 text-xl font-bold text-orange-600">
                    {selectedItems.length}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white px-6 py-12 text-center shadow-[0_15px_40px_rgba(0,0,0,0.05)]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-2xl">
              🛒
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Giỏ hàng của bạn đang trống
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Hãy thêm sản phẩm yêu thích vào giỏ để tiếp tục mua sắm
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
            >
              Quay lại cửa hàng
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
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

              <div className="space-y-4">
                <CartCouponCard
                  couponCode={couponCode}
                  savedCouponCode={savedCouponCode}
                  setCouponCode={setCouponCode}
                  handleSaveCoupon={handleSaveCoupon}
                  handleRemoveCoupon={handleRemoveCoupon}
                  handleQuickSelectCoupon={handleQuickSelectCoupon}
                />

                <CartSummaryCard
                  selectedItemsCount={selectedItems.length}
                  totalQuantitySelected={totalQuantitySelected}
                  totalSelected={totalSelected}
                  savedCouponCode={savedCouponCode}
                  someChecked={someChecked}
                  handleCheckout={handleCheckout}
                  formatPrice={formatPrice}
                />
              </div>
            </div>

            <div className="mt-4">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-xl border border-orange-200 bg-white px-5 py-3 font-semibold text-orange-700 transition hover:bg-orange-50"
              >
                Tiếp tục mua hàng
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}