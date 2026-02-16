export type TInventoryLog = {
  _id: string;

  productId:
    | string
    | {
        _id: string;
        name: string;
        sku?: string;
        slug: string;
        stock?: number;
        warehouseStock?: number;
      };

  type: "IN" | "OUT" | "ADJUST";
  qty: number;

  beforeWarehouse: number;
  afterWarehouse: number;

  beforeShop: number;
  afterShop: number;

  note?: string;

  createdBy?: any;

  createdAt: string;
  updatedAt?: string;
};
