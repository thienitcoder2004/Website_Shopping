import { useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { orderApi } from "../api/order.api";

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

type PaymentMethod = "COD" | "MOMO";

function formatPrice(value: number) {
  return value.toLocaleString("vi-VN") + "₫";
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
    if (typeof error.message === "string" && error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export default function CheckoutPage() {
  const navigate = useNavigate();

  const items = useMemo<CheckoutCartItem[]>(() => {
    const saved = localStorage.getItem("checkout_items");
    if (!saved) return [];

    try {
      const parsed: unknown = JSON.parse(saved);
      return Array.isArray(parsed) ? (parsed as CheckoutCartItem[]) : [];
    } catch {
      return [];
    }
  }, []);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [loading, setLoading] = useState(false);

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const handleCheckout = async () => {
    try {
      if (!items.length) {
        toast.error("Không có sản phẩm để thanh toán");
        return;
      }

      if (!customerName || !customerPhone || !customerAddress) {
        toast.error("Vui lòng nhập đầy đủ thông tin nhận hàng");
        return;
      }

      const payload = {
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          color: item.variant?.color || "",
          size: item.variant?.size || "",
        })),
        customerName,
        customerPhone,
        customerAddress,
        note,
      };

      setLoading(true);

      if (paymentMethod === "COD") {
        await orderApi.createCashOrder(payload);
        localStorage.removeItem("checkout_items");
        toast.success("Đặt hàng thành công");
        navigate("/account/orders");
        return;
      }

      const res = await orderApi.createMomoOrder(payload);
      const payUrl = res.data?.payUrl;

      if (!payUrl || typeof payUrl !== "string") {
        toast.error("Không lấy được link thanh toán MoMo");
        return;
      }

      window.location.href = payUrl;
    } catch (error: unknown) {
      console.error("CHECKOUT MOMO ERROR:", error);

      if (axios.isAxiosError(error)) {
        console.error("RESPONSE STATUS:", error.response?.status);
        console.error("RESPONSE DATA:", error.response?.data);
      }

      toast.error(getErrorMessage(error, "Thanh toán thất bại"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Họ và tên"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />

          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Số điện thoại"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />

          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="Địa chỉ nhận hàng"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
          />

          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="Ghi chú"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <div>
            <div className="font-semibold mb-2">Phương thức thanh toán</div>

            <label className="flex items-center gap-2 mb-2">
              <input
                type="radio"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
              />
              <span>Tiền mặt khi nhận hàng</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={paymentMethod === "MOMO"}
                onChange={() => setPaymentMethod("MOMO")}
              />
              <span>Ví MoMo</span>
            </label>
          </div>
        </div>

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

          <div className="mt-4 text-right text-xl font-bold text-orange-600">
            Tổng: {formatPrice(total)}
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full mt-4 bg-orange-600 text-white py-3 rounded hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Xác nhận thanh toán"}
          </button>
        </div>
      </div>
    </section>
  );
}