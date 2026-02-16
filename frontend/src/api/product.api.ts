import type { TPagination, TProduct } from "../types/product.type";
import axiosClient from "./axios.config";

export const productApi = {
  list(params?: { q?: string; page?: number; limit?: number; isActive?: boolean | string }) {
    return axiosClient.get<{ ok: boolean; data: TPagination<TProduct> }>("/products", { params });
  },
  getById(id: string) {
    return axiosClient.get<{ ok: boolean; data: TProduct }>(`/products/${id}`);
  },
  create(payload: Partial<TProduct>) {
    return axiosClient.post<{ ok: boolean; data: TProduct }>("/products", payload);
  },
  update(id: string, payload: Partial<TProduct>) {
    return axiosClient.put<{ ok: boolean; data: TProduct }>(`/products/${id}`, payload);
  },
  remove(id: string) {
    return axiosClient.delete<{ ok: boolean; data: TProduct }>(`/products/${id}`);
  },
  getBySlug(slug: string) {
    return axiosClient.get<{ ok: boolean; data: TProduct }>(`/products/slug/${slug}`);
  },
};
