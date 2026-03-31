import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { orderApi } from "../../../api/order.api";

type OrderItem = {
  productId: string;
  name: string;
  slug?: string;
  image?: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
  lineTotal: number;
};

type OrderDetail = {
  _id: string;
  orderCode: string;
  orderStatus: "PENDING" | "CANCELLED" | "SUCCESS" | "SHIPPING";
  paymentMethod: "COD" | "MOMO";
  paymentStatus: "UNPAID" | "PAID";
  paymentNote: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  note?: string;
  totalAmount: number;
  items: OrderItem[];
  createdAt?: string;
};

const API_BASE = "http://localhost:5000";

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

function getOrderStatusLabel(status: OrderDetail["orderStatus"]) {
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

function getOrderStatusClass(status: OrderDetail["orderStatus"]) {
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

function getPaymentMethodLabel(method: OrderDetail["paymentMethod"]) {
  return method === "MOMO" ? "MoMo" : "Thanh toán khi nhận hàng";
}

function getPaymentStatusLabel(order: OrderDetail) {
  if (order.paymentMethod === "MOMO" && order.paymentStatus === "PAID") {
    return "Đã thanh toán";
  }
  return "Chưa thanh toán";
}

function getPaymentStatusClass(order: OrderDetail) {
  if (order.paymentMethod === "MOMO" && order.paymentStatus === "PAID") {
    return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  }
  return "bg-orange-100 text-orange-700 border border-orange-200";
}

function resolveImageUrl(image?: string) {
  if (!image) return "";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${API_BASE}${image.startsWith("/") ? image : `/${image}`}`;
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

export default function OrderDetailPage() {
  const { id = "" } = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        const res = await orderApi.getMyOrderDetail(id);
        setOrder(res.data.order as OrderDetail);
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Không tải được chi tiết đơn hàng"));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      void loadOrder();
    }
  }, [id]);

  const totalQuantity = useMemo(() => {
    if (!order) return 0;
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [order]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-3xl bg-white p-6 shadow-sm">Đang tải...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          Không tìm thấy đơn hàng.
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-orange-600">Đơn hàng của bạn</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Chi tiết đơn hàng
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Theo dõi trạng thái đơn, thanh toán và thông tin giao hàng
            </p>
          </div>

          <Link
            to="/account/orders"
            className="inline-flex items-center justify-center rounded-xl border border-orange-200 bg-white px-4 py-2.5 font-semibold text-orange-700 shadow-sm transition hover:bg-orange-50"
          >
            ← Quay lại danh sách đơn
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
              <div className="border-b border-gray-100 px-6 py-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Mã đơn hàng</p>
                    <h2 className="text-2xl font-bold text-gray-900">
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
              </div>

              <div className="grid gap-4 px-6 py-6 md:grid-cols-2 xl:grid-cols-4">
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
                  <p className="text-sm text-gray-500">Ngày đặt</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Số sản phẩm</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {totalQuantity} sản phẩm
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
              <div className="border-b border-gray-100 px-6 py-5">
                <h3 className="text-xl font-bold text-gray-900">Sản phẩm đã đặt</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Danh sách sản phẩm trong đơn hàng của bạn
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {order.items.map((item, index) => {
                  const imageUrl = resolveImageUrl(item.image);

                  return (
                    <div
                      key={`${item.productId}-${index}`}
                      className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-3xl bg-gray-100 shadow-sm transition hover:scale-[1.03]">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="line-clamp-2 text-base font-semibold text-gray-900">
                            {item.name}
                          </h4>

                          <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
                            <span className="rounded-full bg-gray-100 px-3 py-1">
                              SL: {item.quantity}
                            </span>

                            {item.color ? (
                              <span className="rounded-full bg-gray-100 px-3 py-1">
                                Màu: {item.color}
                              </span>
                            ) : null}

                            {item.size ? (
                              <span className="rounded-full bg-gray-100 px-3 py-1">
                                Size: {item.size}
                              </span>
                            ) : null}
                          </div>

                          <p className="mt-3 text-sm text-gray-500">
                            Đơn giá:{" "}
                            <span className="font-medium text-gray-800">
                              {formatPrice(item.price)}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-left sm:text-right">
                        <p className="text-sm text-gray-500">Thành tiền</p>
                        <p className="mt-1 text-lg font-bold text-orange-600">
                          {formatPrice(item.lineTotal)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
              <h3 className="text-xl font-bold text-gray-900">Thông tin nhận hàng</h3>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Người nhận</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {order.customerName}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Số điện thoại</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {order.customerPhone}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Địa chỉ giao hàng</p>
                  <p className="mt-1 font-semibold leading-6 text-gray-900">
                    {order.customerAddress}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Ghi chú</p>
                  <p className="mt-1 font-semibold leading-6 text-gray-900">
                    {order.note?.trim() ? order.note : "Không có ghi chú"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
              <h3 className="text-xl font-bold text-gray-900">Tóm tắt thanh toán</h3>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Tổng số lượng</span>
                  <span className="font-semibold text-gray-900">
                    {totalQuantity}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Phương thức</span>
                  <span className="font-semibold text-gray-900">
                    {getPaymentMethodLabel(order.paymentMethod)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Trạng thái thanh toán</span>
                  <span className="font-semibold text-gray-900">
                    {getPaymentStatusLabel(order)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold text-gray-900">0₫</span>
                </div>

                <div className="h-px bg-gray-100" />

                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-gray-800">
                    Tổng tiền
                  </span>
                  <span className="text-2xl font-bold text-orange-600">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}