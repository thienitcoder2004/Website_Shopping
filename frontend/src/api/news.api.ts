import axios from "axios";

const API = "http://localhost:5000/api/news";

export type TNewsComment = {
  _id?: string;
  name: string;
  message: string;
  createdAt?: string;
};

export type TNews = {
  _id?: string;
  id?: string;
  title: string;
  slug?: string;
  content?: string;
  desc?: string;
  description?: string;
  summary?: string;
  excerpt?: string;
  image?: string;
  thumbnail?: string;
  images?: string[];
  author?: string;
  views?: number;
  comments?: TNewsComment[];
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type TNewsListResponse = {
  ok?: boolean;
  data: TNews[];
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

export type TNewsDetailResponse = {
  ok?: boolean;
  message?: string;
  data: TNews;
};

function withAuthConfig() {
  const token = localStorage.getItem("token");

  return {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  };
}

export const getNews = (page = 1, params?: Record<string, unknown>) =>
  axios.get<TNewsListResponse>(API, {
    params: {
      page,
      ...params,
    },
  });

export const getNewsById = (id: string) =>
  axios.get<TNewsDetailResponse>(`${API}/${id}`);

export const getNewsBySlug = (slug: string) =>
  axios.get<TNewsDetailResponse>(`${API}/slug/${slug}`);

export const createNews = (data: FormData) =>
  axios.post<TNewsDetailResponse>(API, data, withAuthConfig());

export const updateNews = (id: string, data: FormData) =>
  axios.put<TNewsDetailResponse>(`${API}/${id}`, data, withAuthConfig());

export const deleteNews = (id: string) =>
  axios.delete<{ ok?: boolean; message: string }>(
    `${API}/${id}`,
    withAuthConfig(),
  );

export const addNewsComment = (
  id: string,
  payload: { name: string; message: string },
) =>
  axios.post<{
    ok?: boolean;
    message?: string;
    data: TNewsComment[];
  }>(`${API}/${id}/comments`, payload, withAuthConfig());