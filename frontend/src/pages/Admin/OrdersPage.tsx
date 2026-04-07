import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { orderApi } from "../../api/order.api";

const STATUS_OPTIONS = [
  "ALL",
  "PENDING",
  "CANCELLED",
  "SUCCESS",
  "SHIPPING",
] as const;

type OrderStatus = "PENDING" | "CANCELLED" | "SUCCESS" | "SHIPPING";
type OrderFilterStatus = "ALL" | OrderStatus;
type PaymentMethod = "COD" | "MOMO";
type PaymentStatus = "UNPAID" | "PAID";

type AdminOrder = {
  _id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  subtotalAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentNote: string;
  orderStatus: OrderStatus;
  coupon?: {
    code?: string;
    type?: string;
    value?: number;
    discountAmount?: number;
  };
  createdAt?: string;
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

function getAllowedNextStatuses(current: OrderStatus): OrderStatus[] {
  switch (current) {
    case "PENDING":
      return ["PENDING", "SHIPPING", "CANCELLED"];
    case "SHIPPING":
      return ["SHIPPING", "SUCCESS"];
    case "SUCCESS":
      return ["SUCCESS"];
    case "CANCELLED":
      return ["CANCELLED"];
    default:
      return [current];
  }
}

function getStatusLabel(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return "Đang chờ";
    case "SHIPPING":
      return "Đang giao";
    case "SUCCESS":
      return "Thành công";
    case "CANCELLED":
      return "Đã hủy";
    default:
      return status;
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [status, setStatus] = useState<OrderFilterStatus>("ALL");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await orderApi.getAdminOrders();
      const nextOrders = Array.isArray(res.data?.orders)
        ? (res.data.orders as AdminOrder[])
        : [];
      setOrders(nextOrders);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Không tải được đơn hàng"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const keyword = q.trim().toLowerCase();

    return orders.filter((order) => {
      const matchStatus =
        status === "ALL" ? true : order.orderStatus === status;

      const matchKeyword = keyword
        ? [
            order.orderCode,
            order.customerName,
            order.customerPhone,
          ].some((value) => String(value || "").toLowerCase().includes(keyword))
        : true;

      return matchStatus && matchKeyword;
    });
  }, [orders, q, status]);

  const handleUpdateStatus = async (id: string, current: OrderStatus, next: OrderStatus) => {
    if (current === next) return;

    try {
      await orderApi.updateAdminOrderStatus(id, { orderStatus: next });
      toast.success("Cập nhật trạng thái thành công");
      await loadOrders();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Cập nhật thất bại"));
    }
  };

  return (
    <section className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Quản lý đơn hàng</h1>

      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderFilterStatus)}
          className="rounded border px-3 py-2"
        >
          {STATUS_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {item === "ALL" ? "Tất cả" : getStatusLabel(item as OrderStatus)}
            </option>
          ))}
        </select>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo mã đơn / tên / số điện thoại"
          className="rounded border px-3 py-2"
        />

        <button
          onClick={() => void loadOrders()}
          className="rounded bg-orange-600 px-4 py-2 text-white"
        >
          Tải lại
        </button>
      </div>

      <div className="overflow-auto rounded-lg bg-white shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Mã đơn</th>
              <th className="p-3">Khách hàng</th>
              <th className="p-3">Tiền hàng</th>
              <th className="p-3">Giảm giá</th>
              <th className="p-3">Thành tiền</th>
              <th className="p-3">Thanh toán</th>
              <th className="p-3">Ghi chú</th>
              <th className="p-3">Trạng thái</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map((order) => {
              const subtotal = Number(order.subtotalAmount || order.totalAmount || 0);
              const discount = Number(
                order.discountAmount || order.coupon?.discountAmount || 0,
              );
              const couponCode = order.coupon?.code || "";
              const allowedStatuses = getAllowedNextStatuses(order.orderStatus);

              return (
                <tr key={order._id} className="border-t align-top">
                  <td className="p-3 font-medium">{order.orderCode}</td>

                  <td className="p-3">
                    <div>{order.customerName}</div>
                    <div className="text-xs text-gray-500">{order.customerPhone}</div>
                  </td>

                  <td className="p-3">{formatPrice(subtotal)}</td>

                  <td className="p-3">
                    {discount > 0 ? (
                      <div>
                        <div className="font-medium text-green-600">
                          -{formatPrice(discount)}
                        </div>
                        {couponCode && (
                          <div className="text-xs text-gray-500">
                            Mã: {couponCode}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">Không có</span>
                    )}
                  </td>

                  <td className="p-3 font-semibold text-orange-600">
                    {formatPrice(order.totalAmount)}
                  </td>

                  <td className="p-3">
                    <div>
                      {order.paymentMethod} / {order.paymentStatus}
                    </div>
                  </td>

                  <td className="p-3">{order.paymentNote || "Chưa có"}</td>

                  <td className="p-3">
                    <select
                      value={order.orderStatus}
                      onChange={(e) =>
                        void handleUpdateStatus(
                          order._id,
                          order.orderStatus,
                          e.target.value as OrderStatus,
                        )
                      }
                      className="rounded border px-2 py-1"
                    >
                      {(["PENDING", "SHIPPING", "SUCCESS", "CANCELLED"] as OrderStatus[]).map(
                        (item) => (
                          <option
                            key={item}
                            value={item}
                            disabled={!allowedStatuses.includes(item)}
                          >
                            {getStatusLabel(item)}
                          </option>
                        ),
                      )}
                    </select>
                  </td>
                </tr>
              );
            })}

            {!loading && filteredOrders.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">
                  Không có đơn hàng nào
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">
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