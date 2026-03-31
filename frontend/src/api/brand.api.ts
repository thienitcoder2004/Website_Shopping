import axiosInstance from "./axios.config";

export type Brand = {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type BrandCreatePayload = {
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  isActive?: boolean;
};

export type BrandUpdatePayload = Partial<BrandCreatePayload>;

export type BrandsResponse = {
  ok?: boolean;
  brands: Brand[];
};

export type BrandDetailResponse = {
  ok?: boolean;
  message?: string;
  brand: Brand;
};

export const getBrands = () => axiosInstance.get<BrandsResponse>("/brands");

export const createBrand = (data: BrandCreatePayload) =>
  axiosInstance.post<BrandDetailResponse>("/brands", data);

export const updateBrand = (id: string, data: BrandUpdatePayload) =>
  axiosInstance.put<BrandDetailResponse>(`/brands/${id}`, data);

export const deleteBrand = (id: string) =>
  axiosInstance.delete<{ ok?: boolean; message?: string }>(`/brands/${id}`);