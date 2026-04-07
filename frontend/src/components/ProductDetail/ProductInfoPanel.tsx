import { Link } from "react-router-dom";
import type { TProduct } from "../../types/product.type";

type ProductPromotion = {
  _id?: string;
  name?: string;
  type?: string;
  value?: number;
  maxDiscount?: number;
  startDate?: string;
  endDate?: string;
  saleStock?: number;
  soldCount?: number;
  perUserLimit?: number;
  priority?: number;
};

type ProductWithPricing = TProduct & {
  finalPrice?: number;
  originalPrice?: number;
  activePromotion?: ProductPromotion | null;
};

type Props = {
  product: ProductWithPricing;
  token: string | null;
  canBuy: boolean;
  qty: number;
  setQty: React.Dispatch<React.SetStateAction<number>>;
  colors: string[];
  sizes: string[];
  selectedColor: string;
  setSelectedColor: React.Dispatch<React.SetStateAction<string>>;
  selectedSize: string;
  setSelectedSize: React.Dispatch<React.SetStateAction<string>>;
  onAddToCart: () => void;
  renderStars: (rating: number) => string;
};

function formatPrice(value: number) {
  return value.toLocaleString("vi-VN") + "₫";
}

export default function ProductInfoPanel({
  product,
  token,
  canBuy,
  qty,
  setQty,
  colors,
  sizes,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  onAddToCart,
  renderStars,
}: Props) {
  const hasPromotion = !!product.activePromotion;
  const hasSalePrice = Number(product.salePrice || 0) > 0;

  const currentPrice = Number(
    product.finalPrice ??
      (hasSalePrice ? product.salePrice : product.price) ??
      0,
  );

  const comparePrice = Number(
    product.originalPrice ??
      (hasSalePrice ? product.price : 0) ??
      0,
  );

  return (
    <div className="lg:pl-4">
      <div className="text-xl font-extrabold mb-2">{product.name}</div>

      <div className="mb-3">
        {(hasPromotion || hasSalePrice) && comparePrice > currentPrice ? (
          <div className="space-y-2">
            <div className="flex items-end gap-3 flex-wrap">
              <div className="text-2xl font-extrabold text-orange-600">
                {formatPrice(currentPrice)}
              </div>

              <div className="line-through text-gray-500">
                {formatPrice(comparePrice)}
              </div>

              {hasPromotion && (
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm font-bold">
                  {product.activePromotion?.name || "Flash Sale"}
                </span>
              )}
            </div>

            {hasPromotion && product.activePromotion?.type === "percentage" && (
              <div className="text-sm text-red-500 font-semibold">
                Giảm {product.activePromotion.value || 0}%
              </div>
            )}
          </div>
        ) : (
          <div className="text-2xl font-extrabold">
            {formatPrice(currentPrice)}
          </div>
        )}

        <div className="mt-2 text-sm text-gray-600">
          {(product.stock ?? 0) > 0
            ? `Còn hàng: ${product.stock}`
            : "Hết hàng"}
        </div>

        <div className="mt-3 flex items-center gap-3 text-sm flex-wrap">
          <div className="font-bold text-yellow-500">
            {Number(product.ratingAverage || 0).toFixed(1)} / 5
          </div>
          <div className="text-gray-700">
            {renderStars(Math.round(Number(product.ratingAverage || 0)))}
          </div>
          <div className="text-gray-500">
            ({product.ratingCount || 0} đánh giá, {product.reviewCount || 0}{" "}
            nhận xét)
          </div>
        </div>
      </div>

      {(colors.length > 0 || sizes.length > 0) && (
        <div className="mt-4 space-y-4">
          {colors.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold">Màu</div>
                <div className="text-sm text-gray-600">
                  {selectedColor ? `Đang chọn: ${selectedColor}` : ""}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {colors.map((c) => {
                  const active = c === selectedColor;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`px-3 py-2 rounded-lg border font-semibold transition ${
                        active
                          ? "border-black border-2"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold">Size</div>
                <div className="text-sm text-gray-600">
                  {selectedSize ? `Đang chọn: ${selectedSize}` : ""}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => {
                  const active = s === selectedSize;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-[52px] px-3 py-2 rounded-lg border font-bold transition ${
                        active
                          ? "border-black border-2"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 mt-5">
        <div className="font-bold">Số lượng</div>
        <div className="flex items-center border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3 py-2 hover:bg-gray-50"
          >
            -
          </button>

          <input
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
            className="w-14 text-center outline-none"
            inputMode="numeric"
          />

          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="px-3 py-2 hover:bg-gray-50"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onAddToCart}
        disabled={!canBuy || !token}
        className="mt-4 w-full py-3 rounded-xl font-extrabold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {!token ? "ĐĂNG NHẬP ĐỂ THÊM GIỎ HÀNG" : "THÊM VÀO GIỎ"}
      </button>

      {!token && (
        <div className="mt-2 text-sm text-red-500">
          Bạn cần đăng nhập mới có thể thêm sản phẩm vào giỏ hàng.
        </div>
      )}

      <div className="mt-4 text-sm text-gray-700">
        📞 Tư vấn miễn phí: <span className="font-bold">1900 6750</span>
      </div>

      <div className="mt-3 text-sm text-gray-700 space-y-1">
        <div>✔ Giao hàng nhanh 2-4 ngày</div>
        <div>✔ Đổi trả 7 ngày</div>
        <div>✔ Thanh toán khi nhận hàng</div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <Link to="/products" className="hover:underline">
          Xem thêm sản phẩm khác
        </Link>
      </div>
    </div>
  );
}