import axiosClient from "./axios.config";

export type PromotionType = "percentage" | "fixed";

export type PromotionProduct = {
  _id: string;
  name: string;
  slug?: string;
  price: number;
  salePrice?: number;
  primaryImage?: string;
  images?: string[];
  originalPrice?: number;
  promotionPrice?: number;
};

export type Promotion = {
  _id: string;
  name: string;
  type: PromotionType;
  value: number;
  maxDiscount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  productIds: string[] | PromotionProduct[];
  saleStock: number;
  soldCount: number;
  perUserLimit: number;
  priority: number;
  createdAt?: string;
  updatedAt?: string;
  products?: PromotionProduct[];
};

export type PromotionPayload = {
  name: string;
  type: PromotionType;
  value: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  productIds: string[];
  saleStock?: number;
  perUserLimit?: number;
  priority?: number;
};

export type GetPromotionsParams = {
  status?: string;
  q?: string;
};

export const promotionApi = {
  getPromotions(params?: GetPromotionsParams) {
    return axiosClient.get("/promotions", { params });
  },

  getActivePromotions() {
    return axiosClient.get("/promotions/active/list");
  },

  getPromotion(id: string) {
    return axiosClient.get(`/promotions/${id}`);
  },

  createPromotion(payload: PromotionPayload) {
    return axiosClient.post("/promotions", payload);
  },

  updatePromotion(id: string, payload: PromotionPayload) {
    return axiosClient.put(`/promotions/${id}`, payload);
  },

  deletePromotion(id: string) {
    return axiosClient.delete(`/promotions/${id}`);
  },

  togglePromotionActive(id: string) {
    return axiosClient.patch(`/promotions/${id}/toggle-active`);
  },
};