import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { productApi } from "../../api/product.api";
import type { TProduct } from "../../types/product.type";
import { cn, formatVND } from "../../utils/format";
import { getFallbackImage, resolveImgUrl } from "../../utils/media";
import Pagination from "../../components/Pagination";

type SortKey = "updatedAt" | "createdAt" | "price" | "stock" | "name";
type SortDir = "asc" | "desc";
type StockFilter = "all" | "in" | "out";

const STOCK_TABS: Array<{ key: StockFilter; label: string }> = [
  { key: "all", label: "Tất cả" },
  { key: "in", label: "Còn hàng" },
  { key: "out", label: "Hết hàng" },
];

function Badge({
  tone,
  children,
}: {
  tone: "green" | "gray" | "amber" | "indigo";
  children: React.ReactNode;
}) {
  const cls =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : tone === "amber"
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : tone === "indigo"
          ? "bg-indigo-50 text-indigo-700 ring-indigo-200"
          : "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
        cls,
      )}
    >
      {children}
    </span>
  );
}

function StatCard({
  title,
  value,
  sub,
  icon,
  tone,
}: {
  title: string;
  value: React.ReactNode;
  sub: React.ReactNode;
  icon: string;
  tone: "indigo" | "emerald" | "amber";
}) {
  const bg =
    tone === "indigo"
      ? "from-indigo-500/12 to-indigo-500/0 ring-indigo-200"
      : tone === "emerald"
        ? "from-emerald-500/12 to-emerald-500/0 ring-emerald-200"
        : "from-amber-500/12 to-amber-500/0 ring-amber-200";

  const iconBg =
    tone === "indigo"
      ? "bg-indigo-600"
      : tone === "emerald"
        ? "bg-emerald-600"
        : "bg-amber-500";

  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.35)]">
      <div className={cn("absolute inset-0 bg-gradient-to-br", bg)} />
      <div className="relative p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-medium text-slate-600">{title}</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              {value}
            </div>
          </div>

          <div
            className={cn(
              "grid h-10 w-10 place-items-center rounded-2xl text-white shadow-sm transition-transform duration-200 group-hover:-translate-y-0.5",
              iconBg,
            )}
          >
            <span className="text-lg">{icon}</span>
          </div>
        </div>

        <div className="mt-2 text-xs text-slate-600">{sub}</div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-[pulse_1.35s_ease-in-out_infinite]">
      <td className="p-3">
        <div className="h-4 w-4 rounded bg-slate-200" />
      </td>
      <td className="p-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-slate-200" />
          <div className="min-w-0 flex-1">
            <div className="h-4 w-56 max-w-full rounded bg-slate-200" />
            <div className="mt-2 h-3 w-40 max-w-full rounded bg-slate-200" />
          </div>
        </div>
      </td>
      <td className="p-3 text-right">
        <div className="ml-auto h-4 w-20 rounded bg-slate-200" />
        <div className="ml-auto mt-2 h-3 w-14 rounded bg-slate-200" />
      </td>
      <td className="p-3 text-right">
        <div className="ml-auto h-6 w-12 rounded-full bg-slate-200" />
      </td>
      <td className="p-3">
        <div className="h-4 w-24 rounded bg-slate-200" />
      </td>
      <td className="p-3">
        <div className="h-4 w-24 rounded bg-slate-200" />
      </td>
      <td className="p-3">
        <div className="ml-auto flex justify-end gap-2">
          <div className="h-8 w-14 rounded-2xl bg-slate-200" />
          <div className="h-8 w-14 rounded-2xl bg-slate-200" />
        </div>
      </td>
    </tr>
  );
}

export default function ProductListAdmin() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<TProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const [inStock, setInStock] = useState<StockFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const selectedIds = useMemo(
    () => Object.keys(selected).filter((id) => selected[id]),
    [selected],
  );

  const [debouncedQ, setDebouncedQ] = useState(q);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  const fetchIdRef = useRef(0);

  const fetchData = async () => {
    const myFetchId = ++fetchIdRef.current;
    setLoading(true);
    try {
      const res = await productApi.list({ q: debouncedQ, page, limit });
      if (fetchIdRef.current !== myFetchId) return;

      const paged = res.data.data;
      setItems(paged.items);
      setTotalPages(paged.totalPages);
      setTotalItems(paged.total);
      setSelected({});
    } finally {
      if (fetchIdRef.current === myFetchId) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, page, limit]);

  const getDisplayPrice = (p: TProduct) =>
    p.salePrice && p.salePrice > 0 ? p.salePrice : p.price;

  const viewItems = useMemo(() => {
    let arr = [...items];

    if (inStock !== "all") {
      arr = arr.filter((p) =>
        inStock === "in" ? (p.stock || 0) > 0 : (p.stock || 0) <= 0,
      );
    }

    arr.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;

      const aStock = a.stock || 0;
      const bStock = b.stock || 0;

      const aPrice = getDisplayPrice(a);
      const bPrice = getDisplayPrice(b);

      const aName = (a.name ?? "").toLowerCase();
      const bName = (b.name ?? "").toLowerCase();

      const aCreated = new Date(a.createdAt).getTime();
      const bCreated = new Date(b.createdAt).getTime();
      const aUpdated = new Date(a.updatedAt).getTime();
      const bUpdated = new Date(b.updatedAt).getTime();

      switch (sortKey) {
        case "stock":
          return (aStock - bStock) * dir;
        case "price":
          return (aPrice - bPrice) * dir;
        case "name":
          return aName.localeCompare(bName) * dir;
        case "createdAt":
          return (aCreated - bCreated) * dir;
        case "updatedAt":
        default:
          return (aUpdated - bUpdated) * dir;
      }
    });

    return arr;
  }, [items, inStock, sortKey, sortDir]);

  const totalStock = useMemo(
    () => viewItems.reduce((sum, p) => sum + (p.stock || 0), 0),
    [viewItems],
  );
  const outOfStockCount = useMemo(
    () => viewItems.filter((p) => (p.stock || 0) <= 0).length,
    [viewItems],
  );

  const toggleAll = () => {
    if (!viewItems.length) return;
    const allChecked = viewItems.every((p) => selected[p._id]);
    const next: Record<string, boolean> = {};
    viewItems.forEach((p) => (next[p._id] = !allChecked));
    setSelected(next);
  };

  const onDelete = async (id: string) => {
    if (!confirm("Xóa sản phẩm này?")) return;
    await productApi.remove(id);
    await fetchData();
  };

  const onBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`Xóa ${selectedIds.length} sản phẩm đã chọn?`)) return;
    await Promise.all(selectedIds.map((id) => productApi.remove(id)));
    await fetchData();
  };

  return (
    <div className="">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(1200px_circle_at_10%_10%,rgba(99,102,241,0.16),transparent_46%),radial-gradient(900px_circle_at_90%_20%,rgba(16,185,129,0.12),transparent_40%),radial-gradient(900px_circle_at_60%_90%,rgba(245,158,11,0.12),transparent_40%),linear-gradient(to_bottom,#f8fafc,#f8fafc)]" />

      <div className="mx-auto max-w-[1200px] p-4 md:p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="inline-flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-400 text-white shadow-[0_10px_25px_-12px_rgba(99,102,241,0.6)]">
              <span className="text-lg font-semibold">P</span>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
                Products
              </h2>
              <p className="text-sm text-slate-600">
                Quản lý danh sách sản phẩm, tồn kho, giá và trạng thái.
              </p>
            </div>
          </div>

          <div className="md:ml-auto flex flex-wrap items-center gap-2">
            <Link to="/admin/products/new">
              <button className="group relative overflow-hidden rounded-2xl px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_-18px_rgba(99,102,241,0.65)] transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0">
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500" />
                <span className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(600px_circle_at_30%_20%,rgba(255,255,255,0.25),transparent_45%)]" />
                <span className="relative">+ Thêm sản phẩm</span>
              </button>
            </Link>

            <Link to="/admin/inventory">
              <button className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 ring-1 ring-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-[0_10px_25px_-18px_rgba(15,23,42,0.35)] transition hover:-translate-y-0.5 hover:bg-white">
                Kho tồn
              </button>
            </Link>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <StatCard
            title="Sản phẩm (đang hiển thị)"
            value={viewItems.length}
            sub={
              <>
                Tổng sản phẩm server:{" "}
                <b className="font-semibold text-slate-800">{totalItems}</b>
              </>
            }
            icon="📦"
            tone="indigo"
          />
          <StatCard
            title="Tổng tồn (đang hiển thị)"
            value={totalStock}
            sub="Tổng stock của danh sách đang thấy."
            icon="📈"
            tone="emerald"
          />
          <StatCard
            title="Hết hàng (đang hiển thị)"
            value={outOfStockCount}
            sub="Dùng filter để xử lý nhanh."
            icon="⚠️"
            tone="amber"
          />
        </div>

        <div className="mb-4 rounded-3xl bg-white/80 backdrop-blur border border-white/60 ring-1 ring-slate-200 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.35)]">
          <div className="p-3 md:p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative w-full md:w-[380px]">
                <div className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-slate-400">
                  ⌕
                </div>
                <input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Tìm theo tên / SKU / slug..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-10 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-200/60 transition"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 md:ml-auto">
                <div className="inline-flex rounded-2xl bg-slate-100 p-1 ring-1 ring-slate-200">
                  {STOCK_TABS.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setInStock(t.key)}
                      className={cn(
                        "rounded-xl px-3 py-2 text-sm font-semibold transition",
                        inStock === t.key
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-700 hover:bg-white hover:shadow-sm",
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* ✅ sort/select dùng thật => hết warning */}
                <select
                  value={`${sortKey}:${sortDir}`}
                  onChange={(e) => {
                    const [k, d] = e.target.value.split(":");
                    setSortKey(k as SortKey);
                    setSortDir(d as SortDir);
                  }}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-200/60 transition"
                >
                  <option value="updatedAt:desc">Mới cập nhật</option>
                  <option value="createdAt:desc">Mới tạo</option>
                  <option value="name:asc">Tên A → Z</option>
                  <option value="price:asc">Giá tăng dần</option>
                  <option value="price:desc">Giá giảm dần</option>
                  <option value="stock:asc">Tồn tăng dần</option>
                  <option value="stock:desc">Tồn giảm dần</option>
                </select>

                {/* ✅ limit dùng thật => hết warning */}
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-200/60 transition"
                >
                  {[10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}/trang
                    </option>
                  ))}
                </select>

                <button
                  onClick={fetchData}
                  disabled={loading}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? "Đang tải..." : "Làm mới"}
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="text-xs text-slate-600">
                Đã chọn:{" "}
                <span className="font-semibold text-slate-900">
                  {selectedIds.length}
                </span>
              </div>

              <button
                onClick={onBulkDelete}
                disabled={!selectedIds.length}
                className="rounded-2xl bg-rose-50 text-rose-700 ring-1 ring-rose-200 px-3 py-2 text-xs font-semibold transition hover:bg-rose-100 disabled:opacity-50"
              >
                Xóa đã chọn
              </button>

              <div className="ml-auto text-xs text-slate-600">
                Trang <b className="font-semibold text-slate-900">{page}</b>/
                <b className="font-semibold text-slate-900">{totalPages}</b>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-white/85 backdrop-blur border border-white/60 ring-1 ring-slate-200 shadow-[0_14px_40px_-22px_rgba(15,23,42,0.45)]">
          <div className="overflow-auto">
            <table className="min-w-[1050px] w-full text-sm">
              <thead className="sticky top-0 z-10 bg-white/90 backdrop-blur">
                <tr className="text-left text-slate-600">
                  <th className="p-3 w-[56px]">
                    <input
                      type="checkbox"
                      checked={
                        viewItems.length > 0 &&
                        viewItems.every((p) => selected[p._id])
                      }
                      onChange={toggleAll}
                      className="h-4 w-4 accent-indigo-600"
                    />
                  </th>
                  <th className="p-3 font-semibold">Sản phẩm</th>
                  <th className="p-3 font-semibold text-right">Giá</th>
                  <th className="p-3 font-semibold text-right">Tồn</th>
                  <th className="p-3 font-semibold">Màu</th>
                  <th className="p-3 font-semibold">Size</th>
                  <th className="p-3 font-semibold text-right">Hành động</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}

                {!loading &&
                  viewItems.map((p) => {
                    const stock = p.stock || 0;
                    const price = getDisplayPrice(p);
                    const hasSale = !!(p.salePrice && p.salePrice > 0);

                    const img1 = resolveImgUrl(p.primaryImage);
                    const img2 = resolveImgUrl(p.images?.[0]);
                    const fallback = getFallbackImage();

                    return (
                      <tr
                        key={p._id}
                        className="group transition hover:bg-indigo-50/40"
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={!!selected[p._id]}
                            onChange={(e) =>
                              setSelected((prev) => ({
                                ...prev,
                                [p._id]: e.target.checked,
                              }))
                            }
                            className="h-4 w-4 accent-indigo-600"
                          />
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 overflow-hidden rounded-2xl ring-1 ring-slate-200 bg-slate-100 shadow-sm">
                              <img
                                src={img1 || img2 || fallback}
                                alt={p.name}
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                loading="lazy"
                                onError={(e) => {
                                  const el = e.currentTarget;
                                  if (img2 && el.src !== img2) {
                                    el.src = img2;
                                    return;
                                  }
                                  el.src = fallback;
                                }}
                              />
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="truncate font-medium text-slate-900">
                                  {p.name}
                                </div>

                                {stock > 0 ? (
                                  <Badge tone="green">IN STOCK</Badge>
                                ) : (
                                  <Badge tone="gray">OUT</Badge>
                                )}
                                {hasSale && <Badge tone="amber">SALE</Badge>}
                              </div>

                              <div className="mt-0.5 truncate text-xs text-slate-500">
                                <span className="font-medium">Slug:</span>{" "}
                                {p.slug || "-"}
                                {p.sku ? (
                                  <>
                                    {" "}
                                    • <span className="font-medium">
                                      SKU:
                                    </span>{" "}
                                    {p.sku}
                                  </>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3 text-right">
                          <div className="font-medium text-slate-900">
                            {formatVND(price)}
                          </div>
                          {hasSale && (
                            <div className="text-xs font-medium text-slate-400 line-through">
                              {formatVND(p.price)}
                            </div>
                          )}
                        </td>

                        <td className="p-3 text-right">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1",
                              stock > 0
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                : "bg-slate-100 text-slate-700 ring-slate-200",
                            )}
                          >
                            {stock}
                          </span>
                        </td>

                        <td className="p-3">
                          {p.colors?.length ? (
                            <div className="max-w-[220px] truncate font-medium text-slate-800">
                              {p.colors.join(", ")}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="p-3">
                          {p.sizes?.length ? (
                            <div className="max-w-[220px] truncate font-medium text-slate-800">
                              {p.sizes.join(", ")}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="p-3">
                          <div className="flex justify-end gap-2">
                            <Link to={`/admin/products/${p._id}`}>
                              <button className="rounded-2xl bg-white ring-1 ring-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50">
                                Sửa
                              </button>
                            </Link>

                            <button
                              onClick={() => onDelete(p._id)}
                              className="rounded-2xl bg-rose-50 ring-1 ring-rose-200 px-3.5 py-2 text-xs font-semibold text-rose-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-100"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                {!loading && !viewItems.length && (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-slate-600">
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 bg-white/80 px-4 py-3 flex items-center justify-between">
            <div className="text-xs text-slate-600">
              Tip: tìm theo <b className="font-semibold">name</b>,{" "}
              <b className="font-semibold">sku</b> hoặc{" "}
              <b className="font-semibold">slug</b>.
            </div>

            <div className="flex items-center gap-2">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
