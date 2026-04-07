import axiosClient from "./axios.config";

export type CheckoutItemPayload = {
  productId: string;
  quantity: number;
  color?: string;
  size?: string;
  image?: string;
};

export type CreateOrderPayload = {
  items: CheckoutItemPayload[];
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  note?: string;
  couponCode?: string;
};

export type MomoReturnPayload = {
  partnerCode?: string;
  orderId?: string;
  requestId?: string;
  amount?: string;
  orderInfo?: string;
  orderType?: string;
  transId?: string;
  resultCode?: string | number;
  message?: string;
  payType?: string;
  responseTime?: string | number;
  extraData?: string;
  signature?: string;
};

export type AdminOrderStatus =
  | "PENDING"
  | "SHIPPING"
  | "SUCCESS"
  | "CANCELLED";

export type AdminOrder = {
  _id: string;
  orderCode: string;
  userId?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  items?: Array<{
    productId?: string;
    name?: string;
    slug?: string;
    image?: string;
    originalPrice?: number;
    price?: number;
    quantity?: number;
    color?: string;
    size?: string;
    lineTotal?: number;
  }>;
  subtotalAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  paymentMethod: "COD" | "MOMO";
  paymentStatus: "UNPAID" | "PAID";
  paymentNote?: string;
  orderStatus: AdminOrderStatus;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
  coupon?: {
    code?: string;
    type?: string;
    value?: number;
    discountAmount?: number;
  };
};

export type AdminOrdersResponse = {
  ok?: boolean;
  orders: AdminOrder[];
};

export type UpdateAdminOrderStatusPayload = {
  orderStatus: AdminOrderStatus;
};

export type UpdateAdminOrderStatusResponse = {
  ok?: boolean;
  message?: string;
  order: AdminOrder;
};

export const orderApi = {
  createCashOrder(payload: CreateOrderPayload) {
    return axiosClient.post("/orders/cash", payload);
  },

  createMomoOrder(payload: CreateOrderPayload) {
    return axiosClient.post("/orders/momo", payload);
  },

  confirmMomoReturn(payload: MomoReturnPayload) {
    return axiosClient.post("/orders/momo/return", payload);
  },

  getMyOrders() {
    return axiosClient.get("/orders/my-orders");
  },

  getMyOrderDetail(id: string) {
    return axiosClient.get(`/orders/my-orders/${id}`);
  },

  getAdminOrders(params?: { status?: string; q?: string }) {
    return axiosClient.get<AdminOrdersResponse>("/orders/admin", { params });
  },

  updateAdminOrderStatus(
    id: string,
    payload: UpdateAdminOrderStatusPayload,
  ) {
    return axiosClient.patch<UpdateAdminOrderStatusResponse>(
      `/orders/admin/${id}/status`,
      payload,
    );
  },
};