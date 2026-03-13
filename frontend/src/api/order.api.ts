import axiosClient from "./axios.config";

export type CheckoutItemPayload = {
  productId: string;
  quantity: number;
  color?: string;
  size?: string;
};

export type CreateOrderPayload = {
  items: CheckoutItemPayload[];
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  note?: string;
};

export const orderApi = {
  createCashOrder(payload: CreateOrderPayload) {
    return axiosClient.post("/orders/cash", payload);
  },

  createMomoOrder(payload: CreateOrderPayload) {
    return axiosClient.post("/orders/momo", payload);
  },

  getMyOrders() {
    return axiosClient.get("/orders/my-orders");
  },

  getMyOrderDetail(id: string) {
    return axiosClient.get(`/orders/my-orders/${id}`);
  },

  getAdminOrders(params?: { status?: string; q?: string }) {
    return axiosClient.get("/orders/admin", { params });
  },

  updateAdminOrderStatus(id: string, orderStatus: string) {
    return axiosClient.patch(`/orders/admin/${id}/status`, { orderStatus });
  },
};