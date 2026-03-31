type Props = {
  selectedItemsCount: number;
  totalQuantitySelected: number;
  totalSelected: number;
  savedCouponCode: string;
  someChecked: boolean;
  handleCheckout: () => void;
  formatPrice: (value: number) => string;
};

export default function CartSummaryCard({
  selectedItemsCount,
  totalQuantitySelected,
  totalSelected,
  savedCouponCode,
  someChecked,
  handleCheckout,
  formatPrice,
}: Props) {
  return (
    <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-[0_12px_35px_rgba(0,0,0,0.06)]">
      <div className="text-sm text-gray-600">
        Đã chọn{" "}
        <span className="font-bold text-gray-900">{selectedItemsCount}</span>{" "}
        sản phẩm
      </div>

      <div className="mt-1 text-sm text-gray-600">
        Tổng số lượng:{" "}
        <span className="font-bold text-gray-900">{totalQuantitySelected}</span>
      </div>

      <div className="mt-4 border-t border-dashed border-gray-200 pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Tạm tính</span>
          <span className="font-semibold text-gray-900">
            {formatPrice(totalSelected)}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-gray-600">Mã giảm giá</span>
          <span className="font-semibold text-orange-600">
            {savedCouponCode || "Chưa áp dụng"}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="font-semibold text-gray-700">Tổng thanh toán</span>
          <span className="text-2xl font-extrabold text-orange-600">
            {formatPrice(totalSelected)}
          </span>
        </div>

        <p className="mt-2 text-xs text-gray-500">
          Số tiền giảm thực tế sẽ được kiểm tra và áp dụng chính xác ở bước
          thanh toán.
        </p>
      </div>

      <button
        type="button"
        disabled={!someChecked}
        onClick={handleCheckout}
        className="mt-5 w-full rounded-2xl bg-orange-600 px-6 py-3 font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700 disabled:opacity-50 disabled:hover:bg-orange-600"
      >
        Mua hàng
      </button>
    </div>
  );
}