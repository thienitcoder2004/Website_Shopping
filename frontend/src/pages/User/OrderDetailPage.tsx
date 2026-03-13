import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { orderApi } from "../../api/order.api";

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

export default function OrderDetailPage() {
  const { id = "" } = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const res = await orderApi.getMyOrderDetail(id);
        setOrder(res.data.order as OrderDetail);
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Không tải được chi tiết đơn hàng"));
      }
    };

    if (id) {
      void loadOrder();
    }
  }, [id]);

  if (!order) {
    return <div className="max-w-5xl mx-auto px-4 py-8">Đang tải...</div>;
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Chi tiết đơn hàng</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6 space-y-2">
        <div>
          <strong>Mã đơn:</strong> {order.orderCode}
        </div>
        <div>
          <strong>Trạng thái:</strong> {order.orderStatus}
        </div>
        <div>
          <strong>Thanh toán:</strong> {order.paymentMethod}
        </div>
        <div>
          <strong>Ghi chú thanh toán:</strong> {order.paymentNote}
        </div>
        <div>
          <strong>Người nhận:</strong> {order.customerName}
        </div>
        <div>
          <strong>Số điện thoại:</strong> {order.customerPhone}
        </div>
        <div>
          <strong>Địa chỉ:</strong> {order.customerAddress}
        </div>
        <div>
          <strong>Ghi chú:</strong> {order.note || "Không có"}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Sản phẩm</h2>

        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div key={`${item.productId}-${index}`} className="flex justify-between border-b pb-3">
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-gray-500">
                  SL: {item.quantity}
                  {item.color ? ` | Màu: ${item.color}` : ""}
                  {item.size ? ` | Size: ${item.size}` : ""}
                </div>
              </div>
              <div className="font-semibold">{formatPrice(item.lineTotal)}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-right text-xl font-bold text-orange-600">
          Tổng tiền: {formatPrice(order.totalAmount)}
        </div>
      </div>
    </section>
  );
}