import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { productApi } from "../../api/product.api";
import type { TProduct } from "../../types/product.type";
import ProductZoomSimple from "../../components/ProductZoomSimple";

type TabKey = "info" | "how" | "policy";

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

function sortSizes(arr: string[]) {
  const map = new Map(SIZE_ORDER.map((s, i) => [s, i]));
  return [...arr].sort(
    (a, b) => (map.get(a) ?? 999) - (map.get(b) ?? 999) || a.localeCompare(b),
  );
}

export default function ProductDetail() {
  // ✅ type params để TS sạch
  const { slug } = useParams<{ slug: string }>();

  const [product, setProduct] = useState<TProduct | null>(null);
  const [loading, setLoading] = useState(false);

  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<TabKey>("info");

  const colors = useMemo(() => product?.colors ?? [], [product]);
  const sizes = useMemo(
    () => (product?.sizes?.length ? sortSizes(product.sizes) : []),
    [product],
  );

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    const run = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await productApi.getBySlug(slug);
        setProduct(res.data.data);
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    setSelectedColor(product.colors?.[0] ?? "");
    setSelectedSize(product.sizes?.length ? sortSizes(product.sizes)[0] : "");
  }, [product]);

  const canBuy = useMemo(() => {
    if (!product) return false;
    return (product.stock ?? 0) > 0 && product.isActive;
  }, [product]);

  const onAddToCart = () => {
    if (!product) return;
    if (!canBuy) return alert("Sản phẩm hiện không mua được");
    if (qty <= 0) return alert("Số lượng không hợp lệ");

    alert(
      `Đã thêm vào giỏ: ${product.name} - SL: ${qty}` +
        (selectedColor ? ` - Màu: ${selectedColor}` : "") +
        (selectedSize ? ` - Size: ${selectedSize}` : ""),
    );
  };

  if (loading) return <div className="p-4">Đang tải...</div>;
  if (!product) return <div className="p-4">Không tìm thấy sản phẩm</div>;

  const displayPrice =
    product.salePrice && product.salePrice > 0
      ? product.salePrice
      : product.price;

  return (
    <div className="max-w-6xl mx-auto p-4 pb-10">
      <div className="text-sm text-gray-600 mb-3">
        <Link to="/" className="hover:underline">
          Trang chủ
        </Link>{" "}
        /{" "}
        <Link to="/products" className="hover:underline">
          Danh mục
        </Link>{" "}
        / <span className="font-semibold text-gray-900">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div>
          <ProductZoomSimple product={product} />
        </div>

        {/* RIGHT: buy box */}
        <div className="lg:pl-4">
          <div className="text-xl font-extrabold mb-2">{product.name}</div>

          <div className="mb-3">
            {product.salePrice && product.salePrice > 0 ? (
              <div className="flex items-end gap-3">
                <div className="text-2xl font-extrabold text-orange-600">
                  {product.salePrice.toLocaleString()}₫
                </div>
                <div className="line-through text-gray-500">
                  {product.price.toLocaleString()}₫
                </div>
              </div>
            ) : (
              <div className="text-2xl font-extrabold">
                {product.price.toLocaleString()}₫
              </div>
            )}

            <div className="mt-2 text-sm text-gray-600">
              {(product.stock ?? 0) > 0
                ? `Còn hàng: ${product.stock}`
                : "Hết hàng"}
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

          {/* Qty */}
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
                onChange={(e) =>
                  setQty(Math.max(1, Number(e.target.value) || 1))
                }
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
            disabled={!canBuy}
            className="mt-4 w-full py-3 rounded-xl font-extrabold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            THÊM VÀO GIỎ
          </button>

          <div className="mt-4 text-sm text-gray-700">
            📞 Tư vấn miễn phí: <span className="font-bold">1900 6750</span>
          </div>

          <div className="mt-3 text-sm text-gray-700 space-y-1">
            <div>✔ Giao hàng nhanh 2-4 ngày</div>
            <div>✔ Đổi trả 7 ngày</div>
            <div>✔ Thanh toán khi nhận hàng</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 border-t">
        <div className="flex gap-0">
          <TabButton active={tab === "info"} onClick={() => setTab("info")}>
            Thông tin sản phẩm
          </TabButton>
          <TabButton active={tab === "how"} onClick={() => setTab("how")}>
            Cách mua hàng
          </TabButton>
          <TabButton active={tab === "policy"} onClick={() => setTab("policy")}>
            Điều khoản
          </TabButton>
        </div>

        <div className="border border-t-0 p-4 rounded-b-xl">
          {tab === "info" && (
            <div className="space-y-3 leading-7">
              <div className="font-bold text-lg">{product.name}</div>
              <div className="text-gray-700">
                {product.description?.trim()
                  ? product.description
                  : "Chưa có mô tả. Bạn có thể cập nhật mô tả trong trang quản trị."}
              </div>
            </div>
          )}

          {tab === "how" && (
            <div className="space-y-2 leading-7">
              <div className="font-bold text-lg">Cách mua hàng</div>
              <ol className="list-decimal pl-5 text-gray-700">
                <li>Chọn màu và size (nếu có).</li>
                <li>Chọn số lượng và nhấn “THÊM VÀO GIỎ”.</li>
                <li>Vào giỏ hàng, điền thông tin nhận hàng.</li>
                <li>Xác nhận đơn hàng và chờ giao.</li>
              </ol>
            </div>
          )}

          {tab === "policy" && (
            <div className="space-y-2 leading-7">
              <div className="font-bold text-lg">Điều khoản</div>
              <ul className="list-disc pl-5 text-gray-700">
                <li>Đổi trả trong 7 ngày nếu sản phẩm lỗi do nhà sản xuất.</li>
                <li>Sản phẩm phải còn tem/mác, chưa sử dụng.</li>
                <li>Thời gian giao hàng 2-4 ngày tuỳ khu vực.</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* demo sử dụng biến displayPrice nếu cần */}
      <div className="hidden">{displayPrice}</div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 border font-extrabold ${
        active ? "bg-white border-b-white" : "bg-gray-50 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}
