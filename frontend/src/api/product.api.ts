import type { TPagination, TProduct } from "../types/product.type";
import axiosClient from "./axios.config";

export type { TProduct };

export type ProductListParams = {
  q?: string;
  page?: number;
  limit?: number;
  isActive?: boolean | "true" | "false";
  sort?: string;
  categoryId?: string;
  categorySlug?: string;
};

export type TProductReviewReply = {
  _id: string;
  productId: string;
  userId: string;
  parentId: string;
  rating: number | null;
  comment: string;
  images: string[];
  displayName: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TProductReview = {
  _id: string;
  productId: string;
  userId: string;
  parentId: null;
  rating: number | null;
  comment: string;
  images: string[];
  displayName: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  replies: TProductReviewReply[];
  helpfulCount?: number;
  replyCount?: number;
  hasStaffReply?: boolean;
};

export type TAdminReviewItem = TProductReview & {
  productId:
    | string
    | {
        _id: string;
        name: string;
        slug: string;
        primaryImage?: string;
        images?: string[];
        ratingAverage?: number;
        ratingCount?: number;
        reviewCount?: number;
      };
  userId:
    | string
    | {
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        avatar?: string;
        role?: string;
      };
};

export type AdminReviewQuery = {
  productId?: string;
  unreplied?: boolean | "true" | "false";
  rating?: number;
  keyword?: string;
  page?: number;
  limit?: number;
  isActive?: boolean | "true" | "false";
};

export type AdminReviewListResponse = {
  items: TAdminReviewItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const productApi = {
  list(params?: ProductListParams) {
    return axiosClient.get<{ ok: boolean; data: TPagination<TProduct> }>(
      "/products",
      { params },
    );
  },

  getById(id: string) {
    return axiosClient.get<{ ok: boolean; data: TProduct }>(`/products/${id}`);
  },

  create(payload: Partial<TProduct>) {
    return axiosClient.post<{ ok: boolean; data: TProduct }>(
      "/products",
      payload,
    );
  },

  update(id: string, payload: Partial<TProduct>) {
    return axiosClient.put<{ ok: boolean; data: TProduct }>(
      `/products/${id}`,
      payload,
    );
  },

  remove(id: string) {
    return axiosClient.delete<{ ok: boolean; data: TProduct }>(
      `/products/${id}`,
    );
  },

  getBySlug(slug: string) {
    return axiosClient.get<{ ok: boolean; data: TProduct }>(
      `/products/slug/${slug}`,
    );
  },

  getReviews(productId: string) {
    return axiosClient.get<{ ok: boolean; data: TProductReview[] }>(
      `/products/${productId}/reviews`,
    );
  },

  createReview(productId: string, formData: FormData) {
    return axiosClient.post<{ ok: boolean; data: TProductReview }>(
      `/products/${productId}/reviews`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  },

  createReply(productId: string, reviewId: string, formData: FormData) {
    return axiosClient.post<{ ok: boolean; data: TProductReviewReply }>(
      `/products/${productId}/reviews/${reviewId}/replies`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  },

  markReviewHelpful(reviewId: string) {
    return axiosClient.post<{
      ok: boolean;
      message?: string;
      data?: {
        reviewId: string;
        helpfulCount: number;
      };
    }>(`/products/reviews/${reviewId}/helpful`);
  },

  getAdminReviews(params?: AdminReviewQuery) {
    return axiosClient.get<{ ok: boolean; data: AdminReviewListResponse }>(
      "/admin/reviews",
      { params },
    );
  },

  toggleReviewActive(reviewId: string) {
    return axiosClient.patch<{ ok: boolean; message?: string; data?: TAdminReviewItem }>(
      `/admin/reviews/${reviewId}/toggle-active`,
    );
  },

  deleteReview(reviewId: string) {
    return axiosClient.delete<{ ok: boolean; message?: string; data?: { deleted: boolean } }>(
      `/admin/reviews/${reviewId}`,
    );
  },
};