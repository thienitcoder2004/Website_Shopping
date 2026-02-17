import { useEffect, useMemo, useState } from "react";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../../api/coupon.api";
import Pagination from "../../components/Pagination";
import axios from "axios";

type CouponType = "percentage" | "fixed";

type TCoupon = {
  _id: string;
  code: string;
  type: CouponType;
  value: number;
  startDate: string; // ISO string
  endDate: string; // ISO string
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type CouponForm = {
  code: string;
  type: CouponType;
  value: number;
  startDate: string; // yyyy-mm-dd
  endDate: string; // yyyy-mm-dd
  isActive: boolean;
};

const itemsPerPage = 5;

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

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<TCoupon[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [form, setForm] = useState<CouponForm>({
    code: "",
    type: "percentage",
    value: 0,
    startDate: "",
    endDate: "",
    isActive: true,
  });

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getCoupons();
      const items = (res.data?.data ?? []) as TCoupon[];
      setCoupons(items);
    } catch (err: unknown) {
      setError(getAxiosErrorMessage(err, "Không tải được mã giảm giá"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const resetForm = () => {
    setForm({
      code: "",
      type: "percentage",
      value: 0,
      startDate: "",
      endDate: "",
      isActive: true,
    });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.code.trim() || !form.startDate || !form.endDate) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (new Date(form.startDate) > new Date(form.endDate)) {
      alert("Ngày bắt đầu không được lớn hơn ngày kết thúc");
      return;
    }

    // payload gửi lên BE (giữ đúng kiểu)
    const payload: CouponForm = {
      ...form,
      code: form.code.trim().toUpperCase(),
      value: Number(form.value || 0),
    };

    setLoading(true);
    setError("");
    try {
      if (editingId) {
        await updateCoupon(editingId, payload);
      } else {
        await createCoupon(payload);
      }

      resetForm();
      await fetchData();
    } catch (err: unknown) {
      alert(getAxiosErrorMessage(err, "Lưu mã giảm giá thất bại"));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (coupon: TCoupon) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code ?? "",
      type: coupon.type ?? "percentage",
      value: coupon.value ?? 0,
      startDate: coupon.startDate?.slice(0, 10) ?? "",
      endDate: coupon.endDate?.slice(0, 10) ?? "",
      isActive: !!coupon.isActive,
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa mã này?")) return;

    setLoading(true);
    setError("");
    try {
      await deleteCoupon(id);
      await fetchData();
    } catch (err: unknown) {
      alert(getAxiosErrorMessage(err, "Xóa thất bại"));
    } finally {
      setLoading(false);
    }
  };

  /* ================= STATUS ================= */

  const checkStatus = (endDate: string) => {
    return new Date() > new Date(endDate) ? "Hết hạn" : "Còn hạn";
  };

  /* ================= SEARCH ================= */

  const filteredCoupons = useMemo(() => {
    const key = search.trim().toLowerCase();
    if (!key) return coupons;
    return coupons.filter((c) => c.code.toLowerCase().includes(key));
  }, [search, coupons]);

  /* ================= PAGINATION ================= */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCoupons.length / itemsPerPage),
  );

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredCoupons.slice(start, end);
  }, [filteredCoupons, currentPage]);

  /* ================= UI ================= */

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Quản lý Giảm Giá</h1>
          <p className="text-gray-500 mt-2">Tổng số mã: {coupons.length}</p>
          {error && (
            <p className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm mã..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 pl-4 pr-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* FORM CARD */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
        <div className="grid grid-cols-3 gap-6">
          <input
            type="text"
            placeholder="Mã giảm giá"
            value={form.code}
            onChange={(e) =>
              setForm((s) => ({ ...s, code: e.target.value.toUpperCase() }))
            }
            className="input-style"
          />

          <select
            value={form.type}
            onChange={(e) =>
              setForm((s) => ({ ...s, type: e.target.value as CouponType }))
            }
            className="input-style"
          >
            <option value="percentage">Phần trăm (%)</option>
            <option value="fixed">Số tiền (VNĐ)</option>
          </select>

          <input
            type="number"
            placeholder="Giá trị"
            value={form.value}
            onChange={(e) =>
              setForm((s) => ({ ...s, value: Number(e.target.value) }))
            }
            className="input-style"
          />

          <input
            type="date"
            value={form.startDate}
            onChange={(e) =>
              setForm((s) => ({ ...s, startDate: e.target.value }))
            }
            className="input-style"
          />

          <input
            type="date"
            value={form.endDate}
            onChange={(e) =>
              setForm((s) => ({ ...s, endDate: e.target.value }))
            }
            className="input-style"
          />

          <select
            value={form.isActive ? "true" : "false"}
            onChange={(e) =>
              setForm((s) => ({ ...s, isActive: e.target.value === "true" }))
            }
            className="input-style"
          >
            <option value="true">Đang hoạt động</option>
            <option value="false">Tạm ngưng</option>
          </select>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-8 py-3 rounded-xl shadow-md disabled:opacity-60"
          >
            {editingId ? "Cập nhật" : "Thêm mới"}
          </button>

          <button
            onClick={resetForm}
            disabled={loading}
            className="bg-gray-200 hover:bg-gray-300 transition px-8 py-3 rounded-xl disabled:opacity-60"
          >
            Làm mới
          </button>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {loading ? (
          <div className="text-center py-16 text-gray-400 text-lg">
            Đang tải...
          </div>
        ) : currentData.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-lg">
            Không có mã giảm giá nào
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-gray-500 uppercase text-sm">
                    <th className="py-4">Code</th>
                    <th>Loại</th>
                    <th>Giá trị</th>
                    <th>Bắt đầu</th>
                    <th>Kết thúc</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>

                <tbody>
                  {currentData.map((c) => (
                    <tr
                      key={c._id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="py-4 font-semibold text-gray-800">
                        {c.code}
                      </td>
                      <td>
                        {c.type === "percentage" ? "Phần trăm" : "Số tiền"}
                      </td>
                      <td className="font-medium">
                        {c.value.toLocaleString("vi-VN")}{" "}
                        {c.type === "percentage" ? "%" : "VNĐ"}
                      </td>
                      <td>
                        {new Date(c.startDate).toLocaleDateString("vi-VN")}
                      </td>
                      <td>{new Date(c.endDate).toLocaleDateString("vi-VN")}</td>
                      <td>
                        <span
                          className={`px-4 py-1 rounded-full text-sm font-semibold ${
                            checkStatus(c.endDate) === "Hết hạn"
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {checkStatus(c.endDate)}
                        </span>
                      </td>
                      <td className="space-x-4">
                        <button
                          onClick={() => handleEdit(c)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </>
        )}
      </div>
    </div>
  );
}
