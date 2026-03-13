import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { orderApi } from "../../api/order.api";

type OrderHistoryItem = {
  _id: string;
  orderCode: string;
  orderStatus: "PENDING" | "CANCELLED" | "SUCCESS" | "SHIPPING";
  paymentMethod: "COD" | "MOMO";
  paymentStatus: "UNPAID" | "PAID";
  paymentNote: string;
  totalAmount: number;
};

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

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await orderApi.getMyOrders();
        const nextOrders = Array.isArray(res.data?.orders)
          ? (res.data.orders as OrderHistoryItem[])
          : [];
        setOrders(nextOrders);
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Không tải được đơn hàng"));
      }
    };

    void loadOrders();
  }, []);

  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Lịch sử đơn hàng</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="font-bold">{order.orderCode}</div>
                <div className="text-sm text-gray-500">
                  Trạng thái đơn hàng: {order.orderStatus}
                </div>
                <div className="text-sm text-gray-500">
                  Thanh toán: {order.paymentMethod} - {order.paymentNote}
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold text-orange-600">
                  {formatPrice(order.totalAmount)}
                </div>
                <Link
                  to={`/account/orders/${order._id}`}
                  className="text-sm text-blue-600 underline"
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            Chưa có đơn hàng nào
          </div>
        )}
      </div>
    </section>
  );
}