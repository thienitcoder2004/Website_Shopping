import type { TInventoryLog } from "../types/inventory.type";
import type { TPagination } from "../types/product.type";
import axiosClient from "./axios.config";

export const inventoryApi = {
  adjust(payload: { productId: string; type: "IN" | "OUT" | "ADJUST"; qty: number; note?: string }) {
    return axiosClient.post<{ ok: boolean; data: { productId: string; before: number; after: number } }>(
      "/inventory/adjust",
      payload
    );
  },
  history(params?: { productId?: string; page?: number; limit?: number }) {
    return axiosClient.get<{ ok: boolean; data: TPagination<TInventoryLog> }>("/inventory/history", { params });
  },
};
