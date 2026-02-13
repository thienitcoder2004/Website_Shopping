import { useEffect, useMemo, useState } from "react";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../../api/coupon.api";
import Pagination from "../../components/Pagination";

export default function CouponsPage() {
  /* ================= STATE ================= */

  const [coupons, setCoupons] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const [form, setForm] = useState({
    code: "",
    type: "percentage",
    value: 0,
    startDate: "",
    endDate: "",
    isActive: true,
  });

  /* ================= FETCH DATA ================= */

  const fetchData = async () => {
    const res = await getCoupons();
    setCoupons(res.data.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= RESET PAGE WHEN SEARCH ================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  /* ================= FORM ================= */

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
    if (!form.code || !form.startDate || !form.endDate) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (new Date(form.startDate) > new Date(form.endDate)) {
      alert("Ngày bắt đầu không được lớn hơn ngày kết thúc");
      return;
    }

    if (editingId) {
      await updateCoupon(editingId, form);
    } else {
      await createCoupon(form);
    }

    resetForm();
    fetchData();
  };

  const handleEdit = (coupon: any) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      startDate: coupon.startDate?.substring(0, 10),
      endDate: coupon.endDate?.substring(0, 10),
      isActive: coupon.isActive,
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa mã này?")) {
      await deleteCoupon(id);
      fetchData();
    }
  };

  /* ================= STATUS ================= */

  const checkStatus = (endDate: string) => {
    return new Date() > new Date(endDate) ? "Hết hạn" : "Còn hạn";
  };

  /* ================= SEARCH ================= */

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) =>
      c.code.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, coupons]);

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);

  const currentData = filteredCoupons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  /* ================= UI ================= */

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Quản lý Giảm Giá</h1>
          <p className="text-gray-500 mt-2">Tổng số mã: {coupons.length}</p>
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
              setForm({ ...form, code: e.target.value.toUpperCase() })
            }
            className="input-style"
          />

          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
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
              setForm({ ...form, value: Number(e.target.value) })
            }
            className="input-style"
          />

          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="input-style"
          />

          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="input-style"
          />

          <select
            value={form.isActive ? "true" : "false"}
            onChange={(e) =>
              setForm({
                ...form,
                isActive: e.target.value === "true",
              })
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
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-8 py-3 rounded-xl shadow-md"
          >
            {editingId ? "Cập nhật" : "Thêm mới"}
          </button>

          <button
            onClick={resetForm}
            className="bg-gray-200 hover:bg-gray-300 transition px-8 py-3 rounded-xl"
          >
            Làm mới
          </button>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {currentData.length === 0 ? (
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
                        {c.value.toLocaleString()} VNĐ
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
