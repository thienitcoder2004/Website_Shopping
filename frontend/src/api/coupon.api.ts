import axiosClient from "./axios.config";

export const getCoupons = () => axiosClient.get("/coupons");
export const getCoupon = (id: string) => axiosClient.get(`/coupons/${id}`);
export const createCoupon = (data: unknown) => axiosClient.post("/coupons", data);
export const updateCoupon = (id: string, data: unknown) =>
  axiosClient.put(`/coupons/${id}`, data);
export const deleteCoupon = (id: string) => axiosClient.delete(`/coupons/${id}`);

export const validateCoupon = (data: { code: string; subtotal: number }) =>
  axiosClient.post("/coupons/validate/apply", data);