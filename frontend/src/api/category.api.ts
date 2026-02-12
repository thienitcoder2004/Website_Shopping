import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getCategories = () => API.get("/categories");

export const createCategory = (data: any) =>
  API.post("/categories", data);

export const updateCategory = (id: string, data: any) =>
  API.put(`/categories/${id}`, data);

export const deleteCategory = (id: string) =>
  API.delete(`/categories/${id}`);
