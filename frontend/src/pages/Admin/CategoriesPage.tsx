import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCategories,
  deleteCategory,
  createCategory,
  updateCategory,
} from "../../api/category.api";
import Pagination from "../../components/common/Pagination";

type Category = {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  parentId?: {
    _id?: string;
    name?: string;
    slug?: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
};

type CategoryPayload = {
  name: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  isActive?: boolean;
};

type CategoriesResponse =
  | Category[]
  | {
      ok?: boolean;
      categories?: Category[];
    };

type HttpResponse<T> = {
  data: T;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    image: string;
    parentId: string;
    isActive: boolean;
  }>({
    name: "",
    description: "",
    image: "",
    parentId: "",
    isActive: true,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchData = useCallback(async () => {
    const res = (await getCategories()) as unknown as HttpResponse<CategoriesResponse>;
    const data = res.data;

    const list: Category[] = Array.isArray(data)
      ? data
      : Array.isArray(data.categories)
        ? data.categories
        : [];

    setCategories(list);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchData]);

  const totalPages = useMemo(() => {
    const n = Math.ceil(categories.length / itemsPerPage);
    return Math.max(1, n);
  }, [categories.length]);

  const safePage = useMemo(
    () => clamp(currentPage, 1, totalPages),
    [currentPage, totalPages],
  );

  const currentItems = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return categories.slice(start, end);
  }, [categories, safePage]);

  const parentOptions = useMemo(() => {
    if (!editingId) return categories;
    return categories.filter((cat) => cat._id !== editingId);
  }, [categories, editingId]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image: "",
      parentId: "",
      isActive: true,
    });
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat._id);
    setFormData({
      name: cat.name || "",
      description: cat.description || "",
      image: cat.image || "",
      parentId: cat.parentId?._id || "",
      isActive: cat.isActive !== false,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm("Bạn có chắc muốn xóa danh mục này?");
    if (!ok) return;

    try {
      await deleteCategory(id);
      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Xóa danh mục thất bại");
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("Vui lòng nhập tên danh mục");
      return;
    }

    const payload: CategoryPayload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      image: formData.image.trim(),
      parentId: formData.parentId || null,
      isActive: formData.isActive,
    };

    try {
      if (editingId) {
        await updateCategory(editingId, payload);
      } else {
        await createCategory(payload);
      }

      setShowModal(false);
      resetForm();
      await fetchData();
    } catch (error) {
      console.error(error);
      alert(editingId ? "Cập nhật thất bại" : "Thêm danh mục thất bại");
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý danh mục</h2>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý danh mục sản phẩm trong hệ thống
          </p>
        </div>

        <button
          onClick={openCreate}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Thêm danh mục
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
            <tr>
              <th className="px-6 py-4">Tên danh mục</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Danh mục cha</th>
              <th className="px-6 py-4">Mô tả</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-center">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {currentItems.map((cat) => (
              <tr key={cat._id} className="border-t">
                <td className="px-6 py-4 font-medium text-slate-800">{cat.name}</td>
                <td className="px-6 py-4 text-gray-500">{cat.slug || "-"}</td>
                <td className="px-6 py-4 text-gray-500">
                  {cat.parentId?.name || "-"}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {cat.description || "-"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      cat.isActive !== false
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {cat.isActive !== false ? "Hiển thị" : "Ẩn"}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="rounded-md bg-yellow-400 px-3 py-1 text-sm text-white hover:bg-yellow-500"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="rounded-md bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!currentItems.length && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  Chưa có danh mục
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={(p) => setCurrentPage(clamp(p, 1, totalPages))}
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[460px] rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">
              {editingId ? "Sửa Danh Mục" : "Thêm Danh Mục"}
            </h3>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Tên danh mục"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
              />

              <textarea
                placeholder="Mô tả"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="min-h-[100px] w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
              />

              <input
                type="text"
                placeholder="Ảnh danh mục (URL nếu có)"
                value={formData.image}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, image: e.target.value }))
                }
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
              />

              <select
                value={formData.parentId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, parentId: e.target.value }))
                }
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
              >
                <option value="">Không có danh mục cha</option>
                {parentOptions.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                />
                Hiển thị danh mục
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
              >
                Hủy
              </button>

              <button
                onClick={() => void handleSubmit()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                {editingId ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}