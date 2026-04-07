export type TObjectId = string;

export type TProduct = {
  _id: string;
  name: string;
  slug: string;
  sku?: string;

  description?: string;

  price: number;
  salePrice?: number;
  gender?: string;
  images: string[];

  categoryId?: TObjectId;
  brandId?: TObjectId;

  warehouseStock?: number;
  stock?: number;

  isActive: boolean;

  colors?: string[];
  sizes?: string[];
  primaryImage?: string;

  ratingAverage?: number;
  ratingCount?: number;
  reviewCount?: number;

  createdAt: string;
  updatedAt: string;
};

export type TPagination<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};