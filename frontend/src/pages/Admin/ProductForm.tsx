import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { productApi } from "../../api/product.api";
import { getCategories, type CategoryItem } from "../../api/category.api";
import { getBrands, type Brand } from "../../api/brand.api";
import type { TProduct } from "../../types/product.type";
import { uploadFiles } from "../../api/upload.api";
import { apiFile } from "../../utils/apiFile";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";

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
  gender: string;

  colorsText: string;
  sizesText: string;

  primaryImage: string;
  images: string[];
};

type ProductUpsertPayload = {
  name: string;
  slug?: string;
  sku?: string;
  description?: string;

  price: number;
  salePrice?: number;
  gender?: string;
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
  gender: "unisex",

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
    if (typeof err.message === "string" && err.message.trim()) {
      return err.message;
    }
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

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setState((s) => ({ ...s, [k]: v }));
  };

  // Load categories + brands
  useEffect(() => {
    const run = async () => {
      try {
        const [cRes, bRes] = await Promise.all([getCategories(), getBrands()]);

        const cData = Array.isArray(cRes.data.categories)
          ? cRes.data.categories
          : [];

        const bData = Array.isArray(bRes.data.brands) ? bRes.data.brands : [];

        setCategories(cData);
        setBrands(bData);

        setState((s) => ({
          ...s,
          categoryId: s.categoryId || cData?.[0]?._id || "",
        }));
      } catch (err: unknown) {
        console.error("Load categories/brands error:", err);
        alert(getAxiosErrorMessage(err, "Không load được categories/brands"));
      }
    };

    void run();
  }, []);

  // Load product detail if edit
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

          categoryId: pickId(p.categoryId),
          brandId: pickId(p.brandId),
          gender: p.gender || "unisex",
          isActive: Boolean(p.isActive),
          stock: p.stock || 0,

          colorsText: (p.colors || []).join(", "),
          sizesText: (p.sizes || []).join(", "),

          primaryImage: primary,
          images: gallery,
        });
      } catch (err: unknown) {
        console.error("Load product detail error:", err);
        alert(getAxiosErrorMessage(err, "Không load được chi tiết sản phẩm"));
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

      if (s.primaryImage && s.primaryImage !== url) {
        nextGallery.unshift(s.primaryImage);
      }

      const cleaned = nextGallery.filter((x) => x && x !== url);

      return {
        ...s,
        primaryImage: url,
        images: Array.from(new Set(cleaned)),
      };
    });
  };

  const removeGallery = (url: string) => {
    setState((s) => ({
      ...s,
      images: s.images.filter((x) => x !== url),
    }));
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

        return {
          ...s,
          primaryImage: primary,
          images: dedup,
        };
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
      gender: state.gender,

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
      if (isNew) {
        await productApi.create(payload);
      } else if (id) {
        await productApi.update(id, payload);
      }

      nav("/admin/products");
    } catch (err: unknown) {
      alert(getAxiosErrorMessage(err, "Lỗi lưu sản phẩm"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          {isNew ? "➕ Thêm sản phẩm" : "✏️ Cập nhật sản phẩm"}
        </h2>

        <div className="flex gap-3">
          <Link to="/admin/products">
            <button className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-100">
              ← Danh sách
            </button>
          </Link>

          <button
            onClick={onSubmit}
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2 font-semibold text-white shadow hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Đang lưu..." : "💾 Lưu"}
          </button>
        </div>
      </div>

      {/* FORM */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* BASIC INFO */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-gray-700">
              Thông tin cơ bản
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Tên"
                value={state.name}
                onChange={(v) => setField("name", v)}
              />
              <Input
                label="Slug"
                value={state.slug}
                onChange={(v) => setField("slug", v)}
              />
              <Input
                label="SKU"
                value={state.sku}
                onChange={(v) => setField("sku", v)}
              />
              <Input
                label="Tồn kho"
                type="number"
                value={state.stock}
                onChange={(v) => setField("stock", Number(v))}
              />
              <Input
                label="Giá"
                type="number"
                value={state.price}
                onChange={(v) => setField("price", Number(v))}
              />
              <Input
                label="Giá sale"
                type="number"
                value={state.salePrice}
                onChange={(v) => setField("salePrice", Number(v))}
              />
            </div>
          </div>

          {/* CATEGORY */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-gray-700">Phân loại</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label="Danh mục"
                value={state.categoryId}
                onChange={(v) => setField("categoryId", v)}
                options={categories.map((c) => ({
                  value: c._id,
                  label: c.name,
                }))}
              />

              <Select
                label="Thương hiệu"
                value={state.brandId}
                onChange={(v) => setField("brandId", v)}
                options={[
                  { value: "", label: "(Không chọn)" },
                  ...brands.map((b) => ({
                    value: b._id,
                    label: b.name,
                  })),
                ]}
              />

              <Select
                label="Giới tính"
                value={state.gender}
                onChange={(v) => setField("gender", v)}
                options={[
                  { value: "male", label: "Nam" },
                  { value: "female", label: "Nữ" },
                  { value: "unisex", label: "Unisex" },
                ]}
              />

              <Select
                label="Trạng thái"
                value={String(state.isActive)}
                onChange={(v) => setField("isActive", v === "true")}
                options={[
                  { value: "true", label: "Bật bán" },
                  { value: "false", label: "Tắt bán" },
                ]}
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-gray-700">Mô tả</h3>

            <textarea
              value={state.description}
              onChange={(e) => setField("description", e.target.value)}
              className="w-full rounded-xl border p-3 focus:ring-2 focus:ring-orange-200"
              rows={5}
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* ATTRIBUTES */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-gray-700">Thuộc tính</h3>

            <Input
              label="Màu sắc"
              value={state.colorsText}
              onChange={(v) => setField("colorsText", v)}
              placeholder="Đỏ, Xanh"
            />

            <Input
              label="Size"
              value={state.sizesText}
              onChange={(v) => setField("sizesText", v)}
              placeholder="S, M, L"
            />
          </div>

          {/* IMAGE */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center">
              <h3 className="font-semibold text-gray-700">Ảnh sản phẩm</h3>

              <label className="ml-auto cursor-pointer rounded-lg border px-3 py-1 text-sm hover:bg-gray-100">
                Upload
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={(e) => onPickFiles(e.target.files)}
                />
              </label>
            </div>

            {/* PRIMARY */}
            <div className="mb-4">
              {state.primaryImage ? (
                <img
                  src={apiFile(state.primaryImage)}
                  className="h-48 w-full rounded-xl object-cover shadow"
                />
              ) : (
                <div className="flex h-48 items-center justify-center rounded-xl border text-gray-400">
                  No image
                </div>
              )}
            </div>

            {/* GALLERY */}
            <div className="grid grid-cols-3 gap-2">
              {state.images.map((img) => (
                <div key={img} className="group relative">
                  <img
                    src={apiFile(img)}
                    onClick={() => setPrimary(img)}
                    className="h-20 w-full cursor-pointer rounded-lg object-cover transition hover:scale-105"
                  />

                  <button
                    onClick={() => removeGallery(img)}
                    className="absolute right-1 top-1 hidden rounded bg-black/70 px-1 text-xs text-white group-hover:block"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3 text-sm">
              Giá hiển thị:{" "}
              <span className="font-bold text-orange-600">
                {pricePreview.toLocaleString("vi-VN")}₫
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
