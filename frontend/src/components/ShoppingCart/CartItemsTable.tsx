import type { CartItem } from "../../types/cart.type";
import { apiFile } from "../../utils/apiFile";

type Props = {
  items: CartItem[];
  visibleItems: CartItem[];
  showAll: boolean;
  hiddenCount: number;
  defaultVisibleItems: number;
  allChecked: boolean;
  isChecked: (key: string) => boolean;
  lineKey: (item: CartItem) => string;
  toggleAll: (value: boolean) => void;
  toggleOne: (key: string, value: boolean) => void;
  increase: (productId: string, variant?: CartItem["variant"]) => void;
  decrease: (productId: string, variant?: CartItem["variant"]) => void;
  removeItem: (productId: string, variant?: CartItem["variant"]) => void;
  setShowAll: React.Dispatch<React.SetStateAction<boolean>>;
  formatPrice: (value: number) => string;
};

export default function CartItemsTable({
  items,
  visibleItems,
  showAll,
  hiddenCount,
  defaultVisibleItems,
  allChecked,
  isChecked,
  lineKey,
  toggleAll,
  toggleOne,
  increase,
  decrease,
  removeItem,
  setShowAll,
  formatPrice,
}: Props) {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_15px_45px_rgba(0,0,0,0.06)]">
      <div className="hidden md:grid grid-cols-[52px_1fr_130px_160px_150px_130px] items-center gap-3 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white px-5 py-4 text-sm text-gray-600">
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={(e) => toggleAll(e.target.checked)}
            className="h-4 w-4 accent-orange-600"
          />
        </div>
        <div className="font-semibold text-gray-800">Sản phẩm</div>
        <div className="text-center font-medium">Đơn giá</div>
        <div className="text-center font-medium">Số lượng</div>
        <div className="text-center font-medium">Thành tiền</div>
        <div className="text-center font-medium">Thao tác</div>
      </div>

      <div className="divide-y divide-gray-100">
        {visibleItems.map((it) => {
          const k = lineKey(it);
          const img = it.image ? apiFile(it.image) : "";
          const amount = it.price * it.quantity;

          const variantText = [
            it.variant?.color ? `Màu: ${it.variant.color}` : "",
            it.variant?.size ? `Size: ${it.variant.size}` : "",
          ]
            .filter(Boolean)
            .join(" • ");

          return (
            <div
              key={k}
              className="px-4 py-4 transition hover:bg-orange-50/40 md:px-5"
            >
              <div className="hidden md:grid grid-cols-[52px_1fr_130px_160px_150px_130px] items-center gap-3">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={isChecked(k)}
                    onChange={(e) => toggleOne(k, e.target.checked)}
                    className="h-4 w-4 accent-orange-600"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                    {img ? (
                      <img
                        src={img}
                        alt={it.name}
                        className="h-full w-full object-cover"
                        draggable={false}
                      />
                    ) : (
                      <div className="text-xs text-gray-400">No image</div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="line-clamp-2 text-[15px] font-semibold text-gray-900">
                      {it.name}
                    </div>

                    {variantText && (
                      <div className="mt-1 text-sm text-gray-500">
                        {variantText}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center font-medium text-gray-700">
                  {formatPrice(it.price)}
                </div>

                <div className="flex justify-center">
                  <div className="inline-flex items-center overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <button
                      type="button"
                      onClick={() => decrease(it.id, it.variant)}
                      className="px-3 py-2 text-base transition hover:bg-gray-50"
                    >
                      -
                    </button>
                    <div className="w-11 text-center font-semibold text-gray-800">
                      {it.quantity}
                    </div>
                    <button
                      type="button"
                      onClick={() => increase(it.id, it.variant)}
                      className="px-3 py-2 text-base transition hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-center text-lg font-bold text-orange-600">
                  {formatPrice(amount)}
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => removeItem(it.id, it.variant)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600"
                  >
                    Xóa
                  </button>
                </div>
              </div>

              <div className="md:hidden">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isChecked(k)}
                    onChange={(e) => toggleOne(k, e.target.checked)}
                    className="mt-1 h-4 w-4 accent-orange-600"
                  />

                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                    {img ? (
                      <img
                        src={img}
                        alt={it.name}
                        className="h-full w-full object-cover"
                        draggable={false}
                      />
                    ) : (
                      <div className="text-xs text-gray-400">No image</div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 font-semibold text-gray-900">
                      {it.name}
                    </div>

                    {variantText && (
                      <div className="mt-1 text-xs text-gray-500">
                        {variantText}
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between">
                      <div className="font-semibold text-orange-600">
                        {formatPrice(it.price)}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(it.id, it.variant)}
                        className="text-sm text-red-600"
                      >
                        Xóa
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center overflow-hidden rounded-xl border border-gray-200 bg-white">
                        <button
                          type="button"
                          onClick={() => decrease(it.id, it.variant)}
                          className="px-3 py-2 transition hover:bg-gray-50"
                        >
                          -
                        </button>
                        <div className="w-10 text-center font-semibold text-gray-800">
                          {it.quantity}
                        </div>
                        <button
                          type="button"
                          onClick={() => increase(it.id, it.variant)}
                          className="px-3 py-2 transition hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>

                      <div className="font-bold text-orange-600">
                        {formatPrice(amount)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {items.length > defaultVisibleItems && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 text-center md:px-5">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="inline-flex items-center rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
          >
            {showAll ? "Thu gọn" : `Xem tất cả ${items.length} sản phẩm`}
          </button>

          {!showAll && hiddenCount > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              Đang hiển thị {defaultVisibleItems}/{items.length} sản phẩm
            </p>
          )}
        </div>
      )}
    </div>
  );
}