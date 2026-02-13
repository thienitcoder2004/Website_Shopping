import axios from "./axios.config";

export const getCoupons = () => axios.get("/coupons");
export const createCoupon = (data: any) => axios.post("/coupons", data);
export const updateCoupon = (id: string, data: any) =>
  axios.put(`/coupons/${id}`, data);
export const deleteCoupon = (id: string) =>
  axios.delete(`/coupons/${id}`);
