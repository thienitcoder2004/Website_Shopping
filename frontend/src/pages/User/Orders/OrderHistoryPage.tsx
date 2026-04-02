import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  CreditCard,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";
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

function isOrderPaid(order: OrderHistoryItem) {
  if (order.paymentStatus === "PAID") {
    return true;
  }

  // Hỗ trợ dữ liệu cũ:
  // COD có thể chưa được cập nhật paymentStatus = PAID
  // nhưng nếu đơn đã SUCCESS thì xem như đã thanh toán khi nhận hàng
  if (order.paymentMethod === "COD" && order.orderStatus === "SUCCESS") {
    return true;
  }

  return false;
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
      return "border border-amber-200 bg-amber-50 text-amber-700";
    case "SHIPPING":
      return "border border-sky-200 bg-sky-50 text-sky-700";
    case "SUCCESS":
      return "border border-emerald-200 bg-emerald-50 text-emerald-700";
    case "CANCELLED":
      return "border border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border border-slate-200 bg-slate-50 text-slate-700";
  }
}

function getPaymentMethodLabel(method: OrderHistoryItem["paymentMethod"]) {
  return method === "MOMO" ? "MoMo" : "COD";
}

function getPaymentStatusLabel(order: OrderHistoryItem) {
  return isOrderPaid(order) ? "Đã thanh toán" : "Chưa thanh toán";
}

function getPaymentStatusClass(order: OrderHistoryItem) {
  if (isOrderPaid(order)) {
    return "border border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (order.orderStatus === "CANCELLED") {
    return "border border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border border-orange-200 bg-orange-50 text-orange-700";
}

function getDisplayPaymentNote(order: OrderHistoryItem) {
  const rawNote = String(order.paymentNote || "").trim();

  if (order.paymentMethod === "COD") {
    if (isOrderPaid(order)) {
      return "Đã thanh toán khi nhận hàng";
    }

    if (order.orderStatus === "CANCELLED") {
      return "Đơn đã hủy, chưa thanh toán";
    }

    return "Thanh toán khi nhận hàng";
  }

  if (order.paymentMethod === "MOMO") {
    if (isOrderPaid(order)) {
      return "Đã thanh toán qua MoMo";
    }

    if (order.orderStatus === "CANCELLED") {
      return "Thanh toán MoMo chưa hoàn tất";
    }

    return rawNote || "Chờ MoMo xác nhận thanh toán";
  }

  return rawNote || "Chưa có ghi chú";
}

function formatDate(value?: string) {
  if (!value) return "---";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "---";

  return (
    date.toLocaleDateString("vi-VN") +
    " • " +
    date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
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
    return orders.reduce(
      (sum, order) => sum + Number(order.totalAmount || 0),
      0,
    );
  }, [orders]);

  const totalPaidOrders = useMemo(() => {
    return orders.filter((order) => isOrderPaid(order)).length;
  }, [orders]);

  const totalCompletedOrders = useMemo(() => {
    return orders.filter((order) => order.orderStatus === "SUCCESS").length;
  }, [orders]);

  return (
    <section className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-slate-50 px-4 py-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="font-medium transition hover:text-orange-600">
            Trang chủ
          </Link>
          <ChevronRight size={15} />
          <span className="font-semibold text-orange-600">
            Lịch sử đơn hàng
          </span>
        </div>

        <div className="mb-6 overflow-hidden rounded-[28px] border border-orange-100 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="grid gap-5 px-5 py-6 md:grid-cols-[1.3fr_1fr] md:px-7 md:py-7">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
                <ClipboardList size={14} />
                Tài khoản của tôi
              </div>

              <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-4xl">
                Lịch sử đơn hàng
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
                Theo dõi trạng thái xử lý đơn hàng, thanh toán COD hoặc MoMo và
                xem lại toàn bộ các đơn bạn đã đặt.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                  <CheckCircle2 size={16} />
                  Cập nhật trạng thái nhanh
                </div>

                <div className="inline-flex items-center gap-2 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
                  <CreditCard size={16} />
                  Theo dõi thanh toán rõ ràng
                </div>

                <div className="inline-flex items-center gap-2 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700">
                  <ShoppingBag size={16} />
                  Xem lại đơn mọi lúc
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tổng đơn hàng
                </p>
                <p className="mt-2 text-3xl font-black text-slate-900">
                  {orders.length}
                </p>
              </div>

              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Đã thanh toán
                </p>
                <p className="mt-2 text-3xl font-black text-emerald-700">
                  {totalPaidOrders}
                </p>
              </div>

              <div className="rounded-3xl border border-orange-100 bg-orange-50 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                  Tổng giá trị đơn
                </p>
                <p className="mt-2 text-3xl font-black text-orange-600">
                  {formatPrice(totalSpent)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">
            Bạn có{" "}
            <span className="font-bold text-slate-800">
              {totalCompletedOrders}
            </span>{" "}
            đơn hàng đã hoàn thành.
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-2xl border border-orange-200 bg-white px-4 py-2.5 font-semibold text-orange-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-50"
          >
            ← Tiếp tục mua sắm
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            Đang tải đơn hàng...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-14 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-2xl">
              🛍️
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Chưa có đơn hàng nào
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Hãy mua sắm và quay lại đây để theo dõi đơn hàng của bạn.
            </p>

            <Link
              to="/"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order._id}
                className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition hover:shadow-[0_20px_70px_rgba(15,23,42,0.1)]"
              >
                <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:p-6">
                  <div className="min-w-0">
                    <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Mã đơn hàng</p>
                        <h2 className="mt-1 break-all text-2xl font-black tracking-tight text-slate-900">
                          {order.orderCode}
                        </h2>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`inline-flex rounded-full px-3.5 py-1.5 text-sm font-semibold shadow-sm ${getOrderStatusClass(
                            order.orderStatus,
                          )}`}
                        >
                          {getOrderStatusLabel(order.orderStatus)}
                        </span>

                        <span
                          className={`inline-flex rounded-full px-3.5 py-1.5 text-sm font-semibold shadow-sm ${getPaymentStatusClass(
                            order,
                          )}`}
                        >
                          {getPaymentStatusLabel(order)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Banknote size={16} />
                          <span>Phương thức thanh toán</span>
                        </div>
                        <p className="mt-2 text-lg font-bold text-slate-900">
                          {getPaymentMethodLabel(order.paymentMethod)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <PackageCheck size={16} />
                          <span>Ghi chú thanh toán</span>
                        </div>
                        <p className="mt-2 text-base font-semibold leading-6 text-slate-900">
                          {getDisplayPaymentNote(order)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <CalendarDays size={16} />
                          <span>Ngày tạo đơn</span>
                        </div>
                        <p className="mt-2 text-base font-semibold text-slate-900">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full shrink-0 lg:w-[260px]">
                    <div className="rounded-[24px] border border-orange-100 bg-gradient-to-b from-orange-50 to-amber-50 p-4 lg:h-full">
                      <p className="text-sm text-slate-500">Tổng thanh toán</p>

                      <p className="mt-2 text-3xl font-black tracking-tight text-orange-600">
                        {formatPrice(order.totalAmount)}
                      </p>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Kiểm tra chi tiết sản phẩm, trạng thái xử lý và thanh
                        toán của đơn hàng này.
                      </p>

                      <Link
                        to={`/account/orders/${order._id}`}
                        className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-orange-600 px-4 py-3.5 font-semibold text-white transition hover:bg-orange-700"
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
