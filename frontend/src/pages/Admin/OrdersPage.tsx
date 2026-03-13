import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { orderApi } from "../../api/order.api";

const STATUS_OPTIONS = ["ALL", "PENDING", "CANCELLED", "SUCCESS", "SHIPPING"] as const;

type OrderStatus = "PENDING" | "CANCELLED" | "SUCCESS" | "SHIPPING";
type OrderFilterStatus = "ALL" | OrderStatus;
type PaymentMethod = "COD" | "MOMO";
type PaymentStatus = "UNPAID" | "PAID";

type AdminOrder = {
  _id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentNote: string;
  orderStatus: OrderStatus;
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [status, setStatus] = useState<OrderFilterStatus>("ALL");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await orderApi.getAdminOrders({ status, q });
      const nextOrders = Array.isArray(res.data?.orders) ? (res.data.orders as AdminOrder[]) : [];
      setOrders(nextOrders);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Không tải được đơn hàng"));
    } finally {
      setLoading(false);
    }
  }, [status, q]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const handleUpdateStatus = async (id: string, nextStatus: OrderStatus) => {
    try {
      await orderApi.updateAdminOrderStatus(id, nextStatus);
      toast.success("Cập nhật trạng thái thành công");
      await loadOrders();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Cập nhật thất bại"));
    }
  };

  return (
    <section className="p-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý đơn hàng</h1>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderFilterStatus)}
          className="border rounded px-3 py-2"
        >
          {STATUS_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo mã đơn hàng"
          className="border rounded px-3 py-2"
        />

        <button
          onClick={() => void loadOrders()}
          className="bg-orange-600 text-white px-4 py-2 rounded"
        >
          Tìm kiếm
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Mã đơn</th>
              <th className="p-3">Khách hàng</th>
              <th className="p-3">Tổng tiền</th>
              <th className="p-3">Thanh toán</th>
              <th className="p-3">Ghi chú</th>
              <th className="p-3">Trạng thái</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-t">
                <td className="p-3">{order.orderCode}</td>
                <td className="p-3">
                  <div>{order.customerName}</div>
                  <div className="text-xs text-gray-500">{order.customerPhone}</div>
                </td>
                <td className="p-3">{formatPrice(order.totalAmount)}</td>
                <td className="p-3">
                  {order.paymentMethod} / {order.paymentStatus}
                </td>
                <td className="p-3">{order.paymentNote}</td>
                <td className="p-3">
                  <select
                    value={order.orderStatus}
                    onChange={(e) =>
                      void handleUpdateStatus(order._id, e.target.value as OrderStatus)
                    }
                    className="border rounded px-2 py-1"
                  >
                    <option value="PENDING">Đang chờ</option>
                    <option value="CANCELLED">Đã hủy</option>
                    <option value="SUCCESS">Thành công</option>
                    <option value="SHIPPING">Đang giao hàng</option>
                  </select>
                </td>
              </tr>
            ))}

            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  Không có đơn hàng nào
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  Đang tải đơn hàng...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}