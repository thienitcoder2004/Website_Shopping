import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  promotionApi,
  type Promotion,
  type PromotionPayload,
  type PromotionType,
} from "../../api/promotion.api";
import { productApi } from "../../api/product.api";

type ProductItem = {
  _id: string;
  name: string;
  slug?: string;
  price: number;
  salePrice?: number;
  primaryImage?: string;
  images?: string[];
  isActive?: boolean;
};

type PromotionForm = {
  name: string;
  type: PromotionType;
  value: number;
  maxDiscount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  productIds: string[];
  saleStock: number;
  perUserLimit: number;
  priority: number;
};

function formatPrice(value: number) {
  return value.toLocaleString("vi-VN") + "₫";
}

function toDatetimeLocal(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

function toIsoStringFromLocal(value: string) {
  if (!value) return "";
  return new Date(value).toISOString();
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
    if (typeof error.message === "string" && error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

function getPromotionStatus(promotion: Promotion) {
  const now = new Date();
  const start = new Date(promotion.startDate);
  const end = new Date(promotion.endDate);

  if (!promotion.isActive) return "Tạm ngưng";
  if (now < start) return "Sắp diễn ra";
  if (now > end) return "Đã kết thúc";
  return "Đang chạy";
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [searchPromotion, setSearchPromotion] = useState("");
  const [searchProduct, setSearchProduct] = useState("");

  const [form, setForm] = useState<PromotionForm>({
    name: "",
    type: "percentage",
    value: 0,
    maxDiscount: 0,
    startDate: "",
    endDate: "",
    isActive: true,
    productIds: [],
    saleStock: 0,
    perUserLimit: 0,
    priority: 0,
  });

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await promotionApi.getPromotions();
      const items = Array.isArray(res.data?.data)
        ? (res.data.data as Promotion[])
        : [];
      setPromotions(items);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Không tải được khuyến mãi"));
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await productApi.list({ page: 1, limit: 1000 });
      const rawItems = Array.isArray(res.data?.data?.items)
  ? res.data.data.items
  : [];
      const nextProducts = Array.isArray(rawItems)
        ? (rawItems as ProductItem[])
        : [];
      setProducts(nextProducts.filter((item) => item.isActive !== false));
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Không tải được sản phẩm"));
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    void fetchPromotions();
    void fetchProducts();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      type: "percentage",
      value: 0,
      maxDiscount: 0,
      startDate: "",
      endDate: "",
      isActive: true,
      productIds: [],
      saleStock: 0,
      perUserLimit: 0,
      priority: 0,
    });
    setEditingId(null);
    setSearchProduct("");
  };

  const filteredPromotions = useMemo(() => {
    const keyword = searchPromotion.trim().toLowerCase();
    if (!keyword) return promotions;

    return promotions.filter((item) =>
      item.name.toLowerCase().includes(keyword),
    );
  }, [promotions, searchPromotion]);

  const filteredProducts = useMemo(() => {
    const keyword = searchProduct.trim().toLowerCase();
    if (!keyword) return products;

    return products.filter((item) =>
      item.name.toLowerCase().includes(keyword),
    );
  }, [products, searchProduct]);

  const selectedProducts = useMemo(() => {
    const selectedIds = new Set(form.productIds);
    return products.filter((item) => selectedIds.has(item._id));
  }, [products, form.productIds]);

  const handleToggleProduct = (productId: string) => {
    setForm((prev) => {
      const exists = prev.productIds.includes(productId);
      return {
        ...prev,
        productIds: exists
          ? prev.productIds.filter((id) => id !== productId)
          : [...prev.productIds, productId],
      };
    });
  };

  const handleSelectAllFilteredProducts = () => {
    const ids = filteredProducts.map((item) => item._id);
    setForm((prev) => {
      const set = new Set(prev.productIds);
      ids.forEach((id) => set.add(id));
      return {
        ...prev,
        productIds: Array.from(set),
      };
    });
  };

  const handleClearSelectedProducts = () => {
    setForm((prev) => ({
      ...prev,
      productIds: [],
    }));
  };

  const handleEdit = (promotion: Promotion) => {
    const ids = Array.isArray(promotion.productIds)
      ? promotion.productIds.map((item) =>
          typeof item === "string" ? item : item._id,
        )
      : [];

    setEditingId(promotion._id);
    setForm({
      name: promotion.name || "",
      type: promotion.type || "percentage",
      value: Number(promotion.value || 0),
      maxDiscount: Number(promotion.maxDiscount || 0),
      startDate: toDatetimeLocal(promotion.startDate),
      endDate: toDatetimeLocal(promotion.endDate),
      isActive: Boolean(promotion.isActive),
      productIds: ids,
      saleStock: Number(promotion.saleStock || 0),
      perUserLimit: Number(promotion.perUserLimit || 0),
      priority: Number(promotion.priority || 0),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    try {
      if (!form.name.trim()) {
        toast.error("Vui lòng nhập tên chương trình");
        return;
      }

      if (Number(form.value) <= 0) {
        toast.error("Giá trị khuyến mãi phải lớn hơn 0");
        return;
      }

      if (!form.startDate || !form.endDate) {
        toast.error("Vui lòng chọn thời gian bắt đầu và kết thúc");
        return;
      }

      if (new Date(form.startDate) >= new Date(form.endDate)) {
        toast.error("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc");
        return;
      }

      if (form.productIds.length === 0) {
        toast.error("Vui lòng chọn ít nhất 1 sản phẩm");
        return;
      }

      const payload: PromotionPayload = {
        name: form.name.trim(),
        type: form.type,
        value: Number(form.value || 0),
        maxDiscount: Number(form.maxDiscount || 0),
        startDate: toIsoStringFromLocal(form.startDate),
        endDate: toIsoStringFromLocal(form.endDate),
        isActive: form.isActive,
        productIds: form.productIds,
        saleStock: Number(form.saleStock || 0),
        perUserLimit: Number(form.perUserLimit || 0),
        priority: Number(form.priority || 0),
      };

      setLoading(true);

      if (editingId) {
        await promotionApi.updatePromotion(editingId, payload);
        toast.success("Cập nhật khuyến mãi thành công");
      } else {
        await promotionApi.createPromotion(payload);
        toast.success("Tạo khuyến mãi thành công");
      }

      resetForm();
      await fetchPromotions();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Lưu khuyến mãi thất bại"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm("Bạn có chắc muốn xóa chương trình này?");
    if (!ok) return;

    try {
      setLoading(true);
      await promotionApi.deletePromotion(id);
      toast.success("Xóa khuyến mãi thành công");
      await fetchPromotions();

      if (editingId === id) {
        resetForm();
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Xóa khuyến mãi thất bại"));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await promotionApi.togglePromotionActive(id);
      toast.success("Đổi trạng thái thành công");
      await fetchPromotions();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Đổi trạng thái thất bại"));
    }
  };

  return (
    <section className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Quản lý Flash Sale / Khuyến mãi
        </h1>
        <p className="text-gray-500 mt-2">
          Tạo chương trình giảm giá theo khung giờ cho từng sản phẩm
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          {editingId ? "Cập nhật chương trình" : "Tạo chương trình mới"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Tên chương trình"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
          />

          <select
            value={form.type}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                type: e.target.value as PromotionType,
              }))
            }
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="percentage">Giảm theo %</option>
            <option value="fixed">Giảm số tiền</option>
          </select>

          <input
            type="number"
            placeholder="Giá trị giảm"
            value={form.value}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                value: Number(e.target.value),
              }))
            }
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
          />

          <input
            type="number"
            placeholder="Giảm tối đa"
            value={form.maxDiscount}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                maxDiscount: Number(e.target.value),
              }))
            }
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
          />

          <input
            type="datetime-local"
            value={form.startDate}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                startDate: e.target.value,
              }))
            }
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
          />

          <input
            type="datetime-local"
            value={form.endDate}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                endDate: e.target.value,
              }))
            }
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
          />

          <input
            type="number"
            placeholder="Số lượng sale"
            value={form.saleStock}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                saleStock: Number(e.target.value),
              }))
            }
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
          />

          <input
            type="number"
            placeholder="Giới hạn / user"
            value={form.perUserLimit}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                perUserLimit: Number(e.target.value),
              }))
            }
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
          />

          <input
            type="number"
            placeholder="Độ ưu tiên"
            value={form.priority}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                priority: Number(e.target.value),
              }))
            }
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
          />

          <select
            value={form.isActive ? "true" : "false"}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                isActive: e.target.value === "true",
              }))
            }
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="true">Đang bật</option>
            <option value="false">Tạm ngưng</option>
          </select>
        </div>

        <div className="mt-8 bg-gray-50 border rounded-2xl p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Chọn sản phẩm áp dụng
            </h3>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              />

              <button
                type="button"
                onClick={handleSelectAllFilteredProducts}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                Chọn tất cả đang lọc
              </button>

              <button
                type="button"
                onClick={handleClearSelectedProducts}
                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
              >
                Bỏ chọn hết
              </button>
            </div>
          </div>

          <div className="mb-4 text-sm text-gray-600">
            Đã chọn:{" "}
            <span className="font-semibold text-orange-600">
              {form.productIds.length}
            </span>{" "}
            sản phẩm
          </div>

          {selectedProducts.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {selectedProducts.map((product) => (
                <span
                  key={product._id}
                  className="inline-flex items-center gap-2 rounded-full bg-orange-100 text-orange-700 px-3 py-1 text-sm"
                >
                  {product.name}
                  <button
                    type="button"
                    onClick={() => handleToggleProduct(product._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {loadingProducts ? (
            <div className="py-8 text-center text-gray-500">
              Đang tải sản phẩm...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              Không tìm thấy sản phẩm nào
            </div>
          ) : (
            <div className="max-h-[360px] overflow-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredProducts.map((product) => {
                const checked = form.productIds.includes(product._id);
                const basePrice =
                  Number(product.salePrice) > 0
                    ? Number(product.salePrice)
                    : Number(product.price || 0);

                return (
                  <label
                    key={product._id}
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
                      checked
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 bg-white hover:border-orange-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleProduct(product._id)}
                      className="mt-1"
                    />

                    <div className="min-w-0">
                      <div className="font-medium text-gray-800 line-clamp-2">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {formatPrice(basePrice)}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {loading
              ? "Đang xử lý..."
              : editingId
                ? "Cập nhật khuyến mãi"
                : "Tạo khuyến mãi"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Làm mới
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Danh sách chương trình
          </h2>

          <input
            type="text"
            placeholder="Tìm theo tên chương trình..."
            value={searchPromotion}
            onChange={(e) => setSearchPromotion(e.target.value)}
            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-500">
            Đang tải dữ liệu...
          </div>
        ) : filteredPromotions.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            Chưa có chương trình khuyến mãi nào
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPromotions.map((promotion) => {
              const status = getPromotionStatus(promotion);
              const productCount = Array.isArray(promotion.productIds)
                ? promotion.productIds.length
                : 0;

              return (
                <div
                  key={promotion._id}
                  className="border border-gray-200 rounded-2xl p-5 hover:shadow-md transition"
                >
                  <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {promotion.name}
                        </h3>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            status === "Đang chạy"
                              ? "bg-green-100 text-green-700"
                              : status === "Sắp diễn ra"
                                ? "bg-yellow-100 text-yellow-700"
                                : status === "Đã kết thúc"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {status}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          Kiểu giảm:{" "}
                          <span className="font-medium">
                            {promotion.type === "percentage"
                              ? "Phần trăm"
                              : "Số tiền"}
                          </span>
                        </div>

                        <div>
                          Giá trị:{" "}
                          <span className="font-medium">
                            {promotion.type === "percentage"
                              ? `${promotion.value}%`
                              : formatPrice(Number(promotion.value || 0))}
                          </span>
                        </div>

                        <div>
                          Giảm tối đa:{" "}
                          <span className="font-medium">
                            {Number(promotion.maxDiscount || 0) > 0
                              ? formatPrice(Number(promotion.maxDiscount || 0))
                              : "Không giới hạn"}
                          </span>
                        </div>

                        <div>
                          Thời gian:{" "}
                          <span className="font-medium">
                            {new Date(promotion.startDate).toLocaleString("vi-VN")} -{" "}
                            {new Date(promotion.endDate).toLocaleString("vi-VN")}
                          </span>
                        </div>

                        <div>
                          Sản phẩm áp dụng:{" "}
                          <span className="font-medium">{productCount}</span>
                        </div>

                        <div>
                          Sale stock / Đã bán:{" "}
                          <span className="font-medium">
                            {Number(promotion.saleStock || 0)} /{" "}
                            {Number(promotion.soldCount || 0)}
                          </span>
                        </div>

                        <div>
                          Giới hạn / user:{" "}
                          <span className="font-medium">
                            {Number(promotion.perUserLimit || 0)}
                          </span>
                        </div>

                        <div>
                          Ưu tiên:{" "}
                          <span className="font-medium">
                            {Number(promotion.priority || 0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(promotion)}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Sửa
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleActive(promotion._id)}
                        className="px-4 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600"
                      >
                        {promotion.isActive ? "Tắt" : "Bật"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(promotion._id)}
                        className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>

                  {Array.isArray(promotion.productIds) &&
                    promotion.productIds.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {promotion.productIds.map((item) => {
                          const product =
                            typeof item === "string" ? null : item;
                          const label =
                            typeof item === "string"
                              ? item
                              : product?.name || "Sản phẩm";

                          return (
                            <span
                              key={typeof item === "string" ? item : item._id}
                              className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm"
                            >
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}