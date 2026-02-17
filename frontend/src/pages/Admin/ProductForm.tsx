import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { productApi } from "../../api/product.api";
import { getCategories } from "../../api/category.api";
import { getBrands } from "../../api/brand.api";
import type { TProduct } from "../../types/product.type";
import { uploadFiles } from "../../api/upload.api";
import { apiFile } from "../../utils/apiFile";

type TCategory = { _id: string; name: string; slug?: string };
type TBrand = { _id: string; name: string; slug?: string };

type FormState = {
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  salePrice: number;

  categoryId: string;
  brandId: string;

  isActive: boolean;
  stock: number;

  colorsText: string;
  sizesText: string;

  primaryImage: string;
  images: string[];
};

type IdLike = string | { _id: string };

type ProductUpsertPayload = {
  name: string;
  slug?: string;
  sku?: string;
  description?: string;

  price: number;
  salePrice?: number;

  categoryId: string;
  brandId?: string;

  isActive: boolean;
  stock: number;

  colors?: string[];
  sizes?: string[];

  primaryImage: string;
  images: string[];
};

const emptyState: FormState = {
  name: "",
  slug: "",
  sku: "",
  description: "",
  price: 0,
  salePrice: 0,

  categoryId: "",
  brandId: "",

  isActive: true,
  stock: 0,

  colorsText: "",
  sizesText: "",

  primaryImage: "",
  images: [],
};

function parseCSV(text: string) {
  return text
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function pickId(v: unknown): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && "_id" in v) {
    const id = (v as { _id?: unknown })._id;
    if (typeof id === "string") return id;
  }
  return "";
}

function getAxiosErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const msg = (err.response?.data as { message?: unknown } | undefined)
      ?.message;
    if (typeof msg === "string" && msg.trim()) return msg;
    if (typeof err.message === "string" && err.message.trim())
      return err.message;
  }
  if (err instanceof Error && err.message.trim()) return err.message;
  return fallback;
}

export default function ProductForm() {
  const params = useParams<{ id?: string }>();
  const id = params.id;
  const isNew = !id || id === "new";
  const nav = useNavigate();

  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<FormState>(emptyState);

  const [categories, setCategories] = useState<TCategory[]>([]);
  const [brands, setBrands] = useState<TBrand[]>([]);

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setState((s) => ({ ...s, [k]: v }));
  };

  // load categories + brands
  useEffect(() => {
    const run = async () => {
      try {
        const [cRes, bRes] = await Promise.all([getCategories(), getBrands()]);

        const cData: TCategory[] = (cRes.data?.data ??
          cRes.data ??
          []) as TCategory[];
        const bData: TBrand[] = (bRes.data?.data ??
          bRes.data ??
          []) as TBrand[];

        setCategories(cData);
        setBrands(bData);

        setState((s) => ({
          ...s,
          categoryId: s.categoryId || cData?.[0]?._id || "",
        }));
      } catch (err: unknown) {
        console.error(err);
        alert(getAxiosErrorMessage(err, "Không load được categories/brands"));
      }
    };

    void run();
  }, []);

  // load product for edit
  useEffect(() => {
    const run = async () => {
      if (isNew) return;
      if (!id) return;

      setLoading(true);
      try {
        const res = await productApi.getById(id);
        const p = res.data.data as TProduct;

        const primary = p.primaryImage || p.images?.[0] || "";
        const gallery = (p.images || []).filter((x) => x && x !== primary);

        setState({
          name: p.name || "",
          slug: p.slug || "",
          sku: p.sku || "",
          description: p.description || "",

          price: p.price || 0,
          salePrice: p.salePrice || 0,

          categoryId: pickId(p.categoryId as unknown as IdLike),
          brandId: pickId(p.brandId as unknown as IdLike),

          isActive: Boolean(p.isActive),
          stock: p.stock || 0,

          colorsText: (p.colors || []).join(", "),
          sizesText: (p.sizes || []).join(", "),

          primaryImage: primary,
          images: gallery,
        });
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [id, isNew]);

  const pricePreview = useMemo(() => {
    const sale = Number(state.salePrice || 0);
    const price = Number(state.price || 0);
    return sale > 0 ? sale : price;
  }, [state.salePrice, state.price]);

  const setPrimary = (url: string) => {
    setState((s) => {
      const nextGallery = [...s.images];
      if (s.primaryImage && s.primaryImage !== url)
        nextGallery.unshift(s.primaryImage);
      const cleaned = nextGallery.filter((x) => x && x !== url);
      return { ...s, primaryImage: url, images: Array.from(new Set(cleaned)) };
    });
  };

  const removeGallery = (url: string) => {
    setState((s) => ({ ...s, images: s.images.filter((x) => x !== url) }));
  };

  const onPickFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);

    setLoading(true);
    try {
      const res = await uploadFiles(arr);
      const uploaded: string[] = (res.data?.data?.files ?? []) as string[];

      setState((s) => {
        let primary = s.primaryImage;
        const gallery = [...s.images];

        for (const u of uploaded) {
          if (!primary) primary = u;
          else gallery.push(u);
        }

        const dedup = Array.from(
          new Set(gallery.filter((x) => x && x !== primary)),
        );
        return { ...s, primaryImage: primary, images: dedup };
      });
    } catch (err: unknown) {
      alert(getAxiosErrorMessage(err, "Upload lỗi"));
    } finally {
      setLoading(false);
      const el = document.getElementById(
        "product-files",
      ) as HTMLInputElement | null;
      if (el) el.value = "";
    }
  };

  const onSubmit = async () => {
    if (!state.name.trim()) return alert("Nhập tên sản phẩm");
    if (!state.categoryId) return alert("Chọn danh mục");
    if (!state.primaryImage) return alert("Chọn ảnh chính (Primary)");

    const payload: ProductUpsertPayload = {
      name: state.name.trim(),
      slug: state.slug.trim() || undefined,
      sku: state.sku.trim() || undefined,
      description: state.description,

      price: Number(state.price || 0),
      salePrice: Number(state.salePrice || 0) || undefined,

      categoryId: state.categoryId,
      brandId: state.brandId || undefined,

      isActive: state.isActive,
      stock: Number(state.stock || 0),

      colors: parseCSV(state.colorsText),
      sizes: parseCSV(state.sizesText),

      primaryImage: state.primaryImage,
      images: state.images.filter((x) => x && x !== state.primaryImage),
    };

    setLoading(true);
    try {
      if (isNew) await productApi.create(payload);
      else if (id) await productApi.update(id, payload);

      nav("/admin/products");
    } catch (err: unknown) {
      alert(getAxiosErrorMessage(err, "Lỗi lưu sản phẩm"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-5xl">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-bold">
          {isNew ? "Thêm sản phẩm" : "Cập nhật sản phẩm"}
        </h2>

        <div className="ml-auto flex gap-2">
          <Link to="/admin/products">
            <button className="px-3 py-2 rounded-lg border hover:bg-gray-50">
              ← Danh sách
            </button>
          </Link>

          <button
            onClick={onSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-60"
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Tên">
          <input
            value={state.name}
            onChange={(e) => setField("name", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-200"
          />
        </Field>

        <Field label="Slug (bỏ trống để tự tạo)">
          <input
            value={state.slug}
            onChange={(e) => setField("slug", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-200"
          />
        </Field>

        <Field label="SKU">
          <input
            value={state.sku}
            onChange={(e) => setField("sku", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-200"
          />
        </Field>

        <Field label="Tồn kho (stock chung)">
          <input
            type="number"
            value={state.stock}
            onChange={(e) => setField("stock", Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-200"
          />
        </Field>

        <Field label="Giá">
          <input
            type="number"
            value={state.price}
            onChange={(e) => setField("price", Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-200"
          />
        </Field>

        <Field label="Giá sale">
          <input
            type="number"
            value={state.salePrice}
            onChange={(e) => setField("salePrice", Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-200"
          />
        </Field>

        <Field label="Danh mục">
          <select
            value={state.categoryId}
            onChange={(e) => setField("categoryId", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-orange-200"
          >
            {!categories.length && <option value="">(Chưa có danh mục)</option>}
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Thương hiệu (tuỳ chọn)">
          <select
            value={state.brandId}
            onChange={(e) => setField("brandId", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-orange-200"
          >
            <option value="">(Không chọn)</option>
            {brands.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Trạng thái">
          <select
            value={String(state.isActive)}
            onChange={(e) => setField("isActive", e.target.value === "true")}
            className="w-full px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-orange-200"
          >
            <option value="true">Bật bán</option>
            <option value="false">Tắt bán</option>
          </select>
        </Field>

        <Field label="Màu (phân cách dấu phẩy)">
          <input
            value={state.colorsText}
            onChange={(e) => setField("colorsText", e.target.value)}
            placeholder="Navy, Gray"
            className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-200"
          />
        </Field>

        <Field label="Size (phân cách dấu phẩy)">
          <input
            value={state.sizesText}
            onChange={(e) => setField("sizesText", e.target.value)}
            placeholder="S, M, L, XL"
            className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-200"
          />
        </Field>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-1">Mô tả</label>
          <textarea
            value={state.description}
            onChange={(e) => setField("description", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg min-h-[120px] outline-none focus:ring-2 focus:ring-orange-200"
          />
        </div>

        {/* Ảnh */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold">Ảnh sản phẩm</div>
            <label className="ml-auto">
              <input
                id="product-files"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => onPickFiles(e.target.files)}
              />
              <span className="px-4 py-2 rounded-lg border hover:bg-gray-50 cursor-pointer">
                + Chọn ảnh / Upload
              </span>
            </label>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border rounded-xl p-2">
              <div className="text-xs font-bold mb-2">PRIMARY</div>
              {state.primaryImage ? (
                <img
                  src={apiFile(state.primaryImage)}
                  alt="primary"
                  className="w-full h-[260px] object-cover rounded-lg border"
                />
              ) : (
                <div className="w-full h-[260px] flex items-center justify-center border rounded-lg text-gray-400">
                  Chưa chọn ảnh chính
                </div>
              )}
              <div className="mt-2 text-xs text-gray-600">
                Click ảnh ở Gallery để đặt làm Primary
              </div>
            </div>

            <div className="border rounded-xl p-2">
              <div className="text-xs font-bold mb-2">GALLERY</div>
              {!state.images.length ? (
                <div className="text-gray-400 text-sm">Chưa có ảnh phụ</div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {state.images.map((u) => (
                    <div key={u} className="relative group">
                      <button
                        type="button"
                        onClick={() => setPrimary(u)}
                        className="block w-full"
                      >
                        <img
                          src={apiFile(u)}
                          alt="gallery"
                          className="w-full h-24 object-cover rounded-md border group-hover:border-black"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeGallery(u)}
                        className="absolute top-1 right-1 px-2 py-1 text-xs rounded bg-black/70 text-white opacity-0 group-hover:opacity-100"
                        title="Xóa"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 text-sm text-gray-600">
            Giá hiển thị:{" "}
            <span className="font-bold">{pricePreview.toLocaleString()}₫</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      {children}
    </div>
  );
}
