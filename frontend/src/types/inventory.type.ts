export type TCreatedBy =
  | string
  | {
      _id: string;
      name?: string;
      email?: string;
      avatar?: string;
      role?: string;
    };

export type TInventoryProductRef =
  | string
  | {
      _id: string;
      name: string;
      sku?: string;
      slug: string;
      stock?: number;
      warehouseStock?: number;
    };

export type TInventoryLog = {
  _id: string;

  productId: TInventoryProductRef;

  type: "IN" | "OUT" | "ADJUST";
  qty: number;

  beforeWarehouse: number;
  afterWarehouse: number;

  beforeShop: number;
  afterShop: number;

  note?: string;

  createdBy?: TCreatedBy;

  createdAt: string;
  updatedAt?: string;
};
