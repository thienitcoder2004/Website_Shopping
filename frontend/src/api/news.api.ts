import axios from "axios";

const API = "http://localhost:5000/api/news";

export const getNews = (page = 1) =>
  axios.get(`${API}?page=${page}`);

export const getNewsById = (id: string) =>
  axios.get(`${API}/${id}`);

export const createNews = (data: FormData) =>
  axios.post(API, data);

export const updateNews = (id: string, data: FormData) =>
  axios.put(`${API}/${id}`, data);

export const deleteNews = (id: string) =>
  axios.delete(`${API}/${id}`);
