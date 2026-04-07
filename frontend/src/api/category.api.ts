import axiosInstance from "./axios.config";

export type CategoryItem = {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  parentId?: {
    _id?: string;
    name?: string;
    slug?: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CategoryPayload = {
  name: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  isActive?: boolean;
};

export type CategoriesResponse = {
  ok?: boolean;
  categories: CategoryItem[];
};

export type CategoryDetailResponse = {
  ok?: boolean;
  message?: string;
  category: CategoryItem;
};

export const getCategories = (params?: {
  isActive?: boolean;
  keyword?: string;
}) => axiosInstance.get<CategoriesResponse>("/categories", { params });

export const createCategory = (data: CategoryPayload) =>
  axiosInstance.post<CategoryDetailResponse>("/categories", data);

export const updateCategory = (id: string, data: CategoryPayload) =>
  axiosInstance.put<CategoryDetailResponse>(`/categories/${id}`, data);

export const deleteCategory = (id: string) =>
  axiosInstance.delete<{ ok?: boolean; message: string }>(`/categories/${id}`);