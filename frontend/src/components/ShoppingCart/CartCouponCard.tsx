type Props = {
  couponCode: string;
  savedCouponCode: string;
  setCouponCode: React.Dispatch<React.SetStateAction<string>>;
  handleSaveCoupon: () => void;
  handleRemoveCoupon: () => void;
  handleQuickSelectCoupon: (code: string) => void;
};

export default function CartCouponCard({
  couponCode,
  savedCouponCode,
  setCouponCode,
  handleSaveCoupon,
  handleRemoveCoupon,
  handleQuickSelectCoupon,
}: Props) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_12px_35px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Mã giảm giá</h3>
        {savedCouponCode && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
            Đã lưu
          </span>
        )}
      </div>

      <p className="mt-2 text-sm text-gray-500">
        Nhập mã tại đây, mã sẽ được tự áp ở bước thanh toán.
      </p>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          placeholder="Nhập mã giảm giá"
          className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-400"
        />
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleSaveCoupon}
          className="flex-1 rounded-2xl bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-700"
        >
          Áp dụng
        </button>

        <button
          type="button"
          onClick={handleRemoveCoupon}
          className="rounded-2xl border border-gray-200 px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Bỏ mã
        </button>
      </div>

      {savedCouponCode && (
        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
          <div className="text-sm text-green-700">
            Mã đang chọn: <span className="font-bold">{savedCouponCode}</span>
          </div>
        </div>
      )}

      <div className="mt-4">
        <div className="mb-2 text-sm font-semibold text-gray-800">Mã gợi ý</div>
        <div className="flex flex-wrap gap-2">
          {["WELCOME10", "GIAM50K", "FREESHIP"].map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => handleQuickSelectCoupon(code)}
              className="rounded-full border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-100"
            >
              {code}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}