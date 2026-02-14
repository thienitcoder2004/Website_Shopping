import axiosInstance from "./axios.config";

export const getBrands = () => axiosInstance.get("/brands");

export const createBrand = (data: any) =>
  axiosInstance.post("/brands", data);

export const updateBrand = (id: string, data: any) =>
  axiosInstance.put(`/brands/${id}`, data);

export const deleteBrand = (id: string) =>
  axiosInstance.delete(`/brands/${id}`);
