type CheckoutCartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: {
    color?: string;
    size?: string;
  };
};

type Props = {
  items: CheckoutCartItem[];
  total: number;
  discountAmount: number;
  finalTotal: number;
  loading: boolean;
  handleCheckout: () => void;
  formatPrice: (value: number) => string;
  children?: React.ReactNode;
};

export default function CheckoutSummary({
  items,
  total,
  discountAmount,
  finalTotal,
  loading,
  handleCheckout,
  formatPrice,
  children,
}: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Đơn hàng của bạn</h2>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="flex justify-between gap-3 border-b pb-3"
          >
            <div>
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-gray-500">
                SL: {item.quantity}
                {item.variant?.color ? ` | Màu: ${item.variant.color}` : ""}
                {item.variant?.size ? ` | Size: ${item.variant.size}` : ""}
              </div>
            </div>

            <div className="font-semibold">
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      {children}

      <div className="mt-4 space-y-2 text-right">
        <div className="text-gray-600">Tạm tính: {formatPrice(total)}</div>
        <div className="text-green-600">
          Giảm giá: -{formatPrice(discountAmount)}
        </div>
        <div className="text-xl font-bold text-orange-600">
          Thành tiền: {formatPrice(finalTotal)}
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full mt-4 bg-orange-600 text-white py-3 rounded hover:bg-orange-700 disabled:opacity-50"
      >
        {loading ? "Đang xử lý..." : "Xác nhận thanh toán"}
      </button>
    </div>
  );
}