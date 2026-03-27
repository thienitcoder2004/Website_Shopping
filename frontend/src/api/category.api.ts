import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

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
}) => API.get<CategoriesResponse>("/categories", { params });

export const createCategory = (data: CategoryPayload) =>
  API.post<CategoryDetailResponse>("/categories", data);

export const updateCategory = (id: string, data: CategoryPayload) =>
  API.put<CategoryDetailResponse>(`/categories/${id}`, data);

export const deleteCategory = (id: string) =>
  API.delete<{ ok?: boolean; message: string }>(`/categories/${id}`);