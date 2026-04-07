import type { Dispatch, SetStateAction } from "react";

type PaymentMethod = "COD" | "MOMO";

type SavedAddressItem = {
  id: string;
  label: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  createdAt: string;
};

type FormErrors = {
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
};

type CheckoutFormProps = {
  customerName: string;
  setCustomerName: (value: string) => void;
  customerPhone: string;
  setCustomerPhone: (value: string) => void;
  customerAddress: string;
  setCustomerAddress: (value: string) => void;
  note: string;
  setNote: Dispatch<SetStateAction<string>>;
  paymentMethod: PaymentMethod;
  setPaymentMethod: Dispatch<SetStateAction<PaymentMethod>>;
  onUseAccountInfo: () => void;
  saveForNextTime: boolean;
  setSaveForNextTime: Dispatch<SetStateAction<boolean>>;
  saveAddressBook: boolean;
  setSaveAddressBook: Dispatch<SetStateAction<boolean>>;
  updateAccountInfo: boolean;
  setUpdateAccountInfo: Dispatch<SetStateAction<boolean>>;
  hasAccountInfo: boolean;
  formErrors: FormErrors;
  savedAddresses: SavedAddressItem[];
  selectedSavedAddressId: string;
  onSelectSavedAddress: (id: string) => void;
};

function getInputClass(hasError?: string) {
  return hasError
    ? "w-full rounded-xl border border-red-400 bg-red-50 px-4 py-3 outline-none transition focus:border-red-500"
    : "w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500";
}

export default function CheckoutForm({
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerAddress,
  setCustomerAddress,
  note,
  setNote,
  paymentMethod,
  setPaymentMethod,
  onUseAccountInfo,
  saveForNextTime,
  setSaveForNextTime,
  saveAddressBook,
  setSaveAddressBook,
  updateAccountInfo,
  setUpdateAccountInfo,
  hasAccountInfo,
  formErrors,
  savedAddresses,
  selectedSavedAddressId,
  onSelectSavedAddress,
}: CheckoutFormProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Thông tin nhận hàng</h2>
          <p className="mt-1 text-sm text-slate-500">
            Bạn có thể dùng thông tin tài khoản hoặc nhập thông tin giao hàng khác
          </p>
        </div>

        {hasAccountInfo && (
          <button
            type="button"
            onClick={onUseAccountInfo}
            className="inline-flex items-center justify-center rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-600 transition hover:bg-orange-100"
          >
            Dùng thông tin tài khoản
          </button>
        )}
      </div>

      <div className="space-y-4">
        {savedAddresses.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Chọn nhanh địa chỉ đã lưu
            </label>
            <select
              value={selectedSavedAddressId}
              onChange={(e) => onSelectSavedAddress(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500"
            >
              <option value="">-- Chọn địa chỉ đã lưu --</option>
              {savedAddresses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <input
            type="text"
            placeholder="Họ và tên"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className={getInputClass(formErrors.customerName)}
          />
          {formErrors.customerName && (
            <p className="mt-1 text-sm text-red-500">{formErrors.customerName}</p>
          )}
        </div>

        <div>
          <input
            type="tel"
            placeholder="Số điện thoại"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className={getInputClass(formErrors.customerPhone)}
          />
          {formErrors.customerPhone && (
            <p className="mt-1 text-sm text-red-500">{formErrors.customerPhone}</p>
          )}
        </div>

        <div>
          <textarea
            placeholder="Địa chỉ nhận hàng"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            rows={4}
            className={getInputClass(formErrors.customerAddress)}
          />
          {formErrors.customerAddress && (
            <p className="mt-1 text-sm text-red-500">{formErrors.customerAddress}</p>
          )}
        </div>

        <div>
          <textarea
            placeholder="Ghi chú"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500"
          />
        </div>

        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              type="checkbox"
              checked={saveForNextTime}
              onChange={(e) => setSaveForNextTime(e.target.checked)}
              className="mt-1 h-4 w-4 accent-orange-600"
            />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Lưu thông tin này cho lần thanh toán sau
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Tự động điền lại tên, số điện thoại và địa chỉ ở lần mua tiếp theo
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              type="checkbox"
              checked={saveAddressBook}
              onChange={(e) => setSaveAddressBook(e.target.checked)}
              className="mt-1 h-4 w-4 accent-orange-600"
            />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Lưu vào danh sách địa chỉ đã dùng
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Bạn có thể chọn nhanh nhiều địa chỉ giao hàng khác nhau ở những lần sau
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              type="checkbox"
              checked={updateAccountInfo}
              onChange={(e) => setUpdateAccountInfo(e.target.checked)}
              className="mt-1 h-4 w-4 accent-orange-600"
            />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Cập nhật luôn vào tài khoản
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Đồng bộ họ tên, số điện thoại và địa chỉ hiện tại sang trang tài khoản
              </p>
            </div>
          </label>
        </div>

        <div className="pt-2">
          <h3 className="mb-3 text-xl font-bold text-slate-900">
            Phương thức thanh toán
          </h3>

          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3 text-base text-slate-800">
              <input
                type="radio"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
                className="h-4 w-4 accent-orange-600"
              />
              <span>Tiền mặt khi nhận hàng</span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 text-base text-slate-800">
              <input
                type="radio"
                checked={paymentMethod === "MOMO"}
                onChange={() => setPaymentMethod("MOMO")}
                className="h-4 w-4 accent-orange-600"
              />
              <span>Ví MoMo</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}