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

export type ApiListResponse<T> =
  | { data: T }
  | { data: { items: T } }
  | T;

  export const getBrands = () =>
  axiosInstance.get<ApiListResponse<Brand[]>>("/brands");

export const createBrand = (data: BrandCreatePayload) =>
  axiosInstance.post<{ data: Brand } | Brand>("/brands", data);

export const updateBrand = (id: string, data: BrandUpdatePayload) =>
  axiosInstance.put<{ data: Brand } | Brand>(`/brands/${id}`, data);

export const deleteBrand = (id: string) =>
  axiosInstance.delete<{ success: boolean; message?: string } | void>(
    `/brands/${id}`,
  );
