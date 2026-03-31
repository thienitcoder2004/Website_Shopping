type AppliedCoupon = {
  code: string;
  type: string;
  value: number;
  discountAmount: number;
};

type Props = {
  couponCode: string;
  setCouponCode: React.Dispatch<React.SetStateAction<string>>;
  applyingCoupon: boolean;
  loading: boolean;
  appliedCoupon: AppliedCoupon | null;
  handleApplyCoupon: () => void;
  handleRemoveCoupon: () => void;
  formatPrice: (value: number) => string;
};

export default function CheckoutCouponBox({
  couponCode,
  setCouponCode,
  applyingCoupon,
  loading,
  appliedCoupon,
  handleApplyCoupon,
  handleRemoveCoupon,
  formatPrice,
}: Props) {
  return (
    <div className="mt-5 border rounded-lg p-3 bg-gray-50">
      <div className="font-semibold mb-2">Mã giảm giá</div>

      <div className="flex gap-2">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          placeholder="Nhập mã giảm giá"
          className="flex-1 border rounded px-3 py-2"
        />

        <button
          onClick={handleApplyCoupon}
          disabled={applyingCoupon || loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {applyingCoupon ? "Đang áp..." : "Áp dụng"}
        </button>
      </div>

      {appliedCoupon && (
        <div className="mt-3 flex items-center justify-between rounded border border-green-200 bg-green-50 px-3 py-2">
          <div>
            <div className="text-sm font-medium text-green-700">
              Đã áp mã: {appliedCoupon.code}
            </div>
            <div className="text-xs text-green-600">
              Giảm: {formatPrice(appliedCoupon.discountAmount)}
            </div>
          </div>

          <button
            onClick={handleRemoveCoupon}
            type="button"
            className="text-sm text-red-600 hover:text-red-700"
          >
            Bỏ mã
          </button>
        </div>
      )}
    </div>
  );
}