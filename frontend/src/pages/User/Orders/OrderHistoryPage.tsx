import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { orderApi } from "../../../api/order.api";

type OrderHistoryItem = {
  _id: string;
  orderCode: string;
  orderStatus: "PENDING" | "CANCELLED" | "SUCCESS" | "SHIPPING";
  paymentMethod: "COD" | "MOMO";
  paymentStatus: "UNPAID" | "PAID";
  paymentNote: string;
  totalAmount: number;
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

function getOrderStatusLabel(status: OrderHistoryItem["orderStatus"]) {
  switch (status) {
    case "PENDING":
      return "Chờ xác nhận";
    case "SHIPPING":
      return "Đang giao hàng";
    case "SUCCESS":
      return "Hoàn thành";
    case "CANCELLED":
      return "Đã hủy";
    default:
      return status;
  }
}

function getOrderStatusClass(status: OrderHistoryItem["orderStatus"]) {
  switch (status) {
    case "PENDING":
      return "bg-amber-200 text-amber-900 border border-amber-300";
    case "SHIPPING":
      return "bg-sky-200 text-sky-900 border border-sky-300";
    case "SUCCESS":
      return "bg-emerald-200 text-emerald-900 border border-emerald-300";
    case "CANCELLED":
      return "bg-red-200 text-red-900 border border-red-300";
    default:
      return "bg-gray-100 text-gray-700 border border-gray-200";
  }
}

function getPaymentMethodLabel(method: OrderHistoryItem["paymentMethod"]) {
  return method === "MOMO" ? "MoMo" : "COD";
}

function getPaymentStatusLabel(order: OrderHistoryItem) {
  if (order.paymentMethod === "MOMO" && order.paymentStatus === "PAID") {
    return "Đã thanh toán";
  }
  return "Chưa thanh toán";
}

function getPaymentStatusClass(order: OrderHistoryItem) {
  if (order.paymentMethod === "MOMO" && order.paymentStatus === "PAID") {
    return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  }
  return "bg-orange-100 text-orange-700 border border-orange-200";
}

function formatDate(value?: string) {
  if (!value) return "---";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "---";

  return date.toLocaleDateString("vi-VN") + " • " +
    date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const res = await orderApi.getMyOrders();
        const nextOrders = Array.isArray(res.data?.orders)
          ? (res.data.orders as OrderHistoryItem[])
          : [];
        setOrders(nextOrders);
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Không tải được đơn hàng"));
      } finally {
        setLoading(false);
      }
    };

    void loadOrders();
  }, []);

  const totalSpent = useMemo(() => {
    return orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  }, [orders]);

  const totalPaidOrders = useMemo(() => {
    return orders.filter(
      (order) => order.paymentMethod === "MOMO" && order.paymentStatus === "PAID"
    ).length;
  }, [orders]);

  return (
    <section className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-orange-600">Tài khoản của tôi</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Lịch sử đơn hàng
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Theo dõi tất cả đơn hàng và trạng thái thanh toán của bạn
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl border border-orange-200 bg-white px-4 py-2.5 font-semibold text-orange-700 shadow-sm transition hover:bg-orange-50"
          >
            ← Tiếp tục mua sắm
          </Link>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
            <p className="text-sm text-gray-500">Tổng đơn hàng</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{orders.length}</p>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
            <p className="text-sm text-gray-500">Đơn đã thanh toán</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{totalPaidOrders}</p>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
            <p className="text-sm text-gray-500">Tổng giá trị đơn</p>
            <p className="mt-2 text-3xl font-bold text-orange-600">
              {formatPrice(totalSpent)}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            Đang tải đơn hàng...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white px-6 py-14 text-center shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-2xl">
              🛍️
            </div>
            <h2 className="text-xl font-bold text-gray-900">Chưa có đơn hàng nào</h2>
            <p className="mt-2 text-sm text-gray-500">
              Hãy mua sắm và quay lại đây để theo dõi đơn hàng của bạn
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] transition hover:shadow-[0_20px_70px_rgba(0,0,0,0.09)]"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Mã đơn hàng</p>
                        <h2 className="text-xl font-bold text-gray-900">
                          {order.orderCode}
                        </h2>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold shadow-sm ${getOrderStatusClass(
                            order.orderStatus
                          )}`}
                        >
                          {getOrderStatusLabel(order.orderStatus)}
                        </span>

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold shadow-sm ${getPaymentStatusClass(
                            order
                          )}`}
                        >
                          {getPaymentStatusLabel(order)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl bg-gray-50 p-4">
                        <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {getPaymentMethodLabel(order.paymentMethod)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-gray-50 p-4">
                        <p className="text-sm text-gray-500">Ghi chú thanh toán</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {order.paymentNote || getPaymentStatusLabel(order)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-gray-50 p-4">
                        <p className="text-sm text-gray-500">Ngày tạo đơn</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full shrink-0 lg:w-64">
                    <div className="rounded-2xl bg-orange-50 p-4">
                      <p className="text-sm text-gray-500">Tổng thanh toán</p>
                      <p className="mt-2 text-2xl font-bold text-orange-600">
                        {formatPrice(order.totalAmount)}
                      </p>

                      <Link
                        to={`/account/orders/${order._id}`}
                        className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-700"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}