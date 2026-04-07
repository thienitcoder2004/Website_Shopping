import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "../../stores/store";

type Staff = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
};

type StaffForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

type StaffsResponse = {
  ok?: boolean;
  staffs?: Staff[];
};

const EMPTY_FORM: StaffForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
};

function getAxiosErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const msg = error.response?.data?.message;
    if (typeof msg === "string" && msg.trim()) return msg;
    if (typeof error.message === "string" && error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export default function StaffsPage() {
  const token = useSelector((state: RootState) => state.auth.token);

  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [form, setForm] = useState<StaffForm>(EMPTY_FORM);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reloadStaffs = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);

      const res = await axios.get<StaffsResponse>(
        "http://localhost:5000/api/admin/staffs",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setStaffs(Array.isArray(res.data?.staffs) ? res.data.staffs : []);
    } catch (error) {
      console.log("Lỗi tải danh sách nhân viên:", error);
      setStaffs([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void reloadStaffs();
  }, [reloadStaffs]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingStaff(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (staff: Staff) => {
    setEditingStaff(staff);
    setForm({
      firstName: staff.firstName || "",
      lastName: staff.lastName || "",
      email: staff.email || "",
      phone: staff.phone || "",
      password: "",
    });
    setShowEditModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    resetForm();
  };

  const handleChange = (field: keyof StaffForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddStaff = async () => {
    if (!token) return;

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.password.trim()
    ) {
      alert("Vui lòng nhập đầy đủ họ, tên, email và mật khẩu");
      return;
    }

    try {
      setSubmitting(true);

      await axios.post(
        "http://localhost:5000/api/admin/staffs",
        {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      closeAddModal();
      await reloadStaffs();
      alert("Thêm nhân viên thành công");
    } catch (error) {
      console.log("Lỗi thêm nhân viên:", error);
      alert(getAxiosErrorMessage(error, "Thêm nhân viên thất bại"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStaff = async () => {
    if (!token || !editingStaff) return;

    if (!form.firstName.trim() || !form.lastName.trim()) {
      alert("Vui lòng nhập đầy đủ họ và tên");
      return;
    }

    try {
      setSubmitting(true);

      await axios.put(
        `http://localhost:5000/api/admin/staffs/${editingStaff._id}`,
        {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      closeEditModal();
      await reloadStaffs();
      alert("Cập nhật nhân viên thành công");
    } catch (error) {
      console.log("Lỗi cập nhật nhân viên:", error);
      alert(getAxiosErrorMessage(error, "Cập nhật nhân viên thất bại"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (staff: Staff) => {
    if (!token) return;

    const confirmed = window.confirm(
      staff.isActive
        ? "Bạn có chắc muốn khóa tài khoản nhân viên này?"
        : "Bạn có chắc muốn mở khóa tài khoản nhân viên này?",
    );

    if (!confirmed) return;

    try {
      await axios.patch(
        `http://localhost:5000/api/admin/staffs/${staff._id}/toggle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await reloadStaffs();
      alert(
        staff.isActive
          ? "Khóa tài khoản thành công"
          : "Mở khóa tài khoản thành công",
      );
    } catch (error) {
      console.log("Lỗi đổi trạng thái nhân viên:", error);
      alert(getAxiosErrorMessage(error, "Cập nhật trạng thái thất bại"));
    }
  };

  const handleDeleteStaff = async (staff: Staff) => {
    if (!token) return;

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa nhân viên ${staff.firstName} ${staff.lastName}?`,
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/admin/staffs/${staff._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await reloadStaffs();
      alert("Xóa nhân viên thành công");
    } catch (error) {
      console.log("Lỗi xóa nhân viên:", error);
      alert(getAxiosErrorMessage(error, "Xóa nhân viên thất bại"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý nhân viên</h2>
          <p className="text-sm text-gray-500">
            Danh sách tài khoản nhân viên đang hoạt động trong hệ thống
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
        >
          + Thêm nhân viên
        </button>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <div className="border-b px-6 py-4">
          <h3 className="font-semibold text-gray-700">Danh sách nhân viên</h3>
        </div>

        {loading ? (
          <div className="p-6 text-gray-500">Đang tải dữ liệu...</div>
        ) : staffs.length === 0 ? (
          <div className="p-6 text-gray-500">Chưa có nhân viên nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 text-left text-sm text-gray-600">
                <tr>
                  <th className="px-6 py-4">Họ tên</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Số điện thoại</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Hành động</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {staffs.map((staff) => (
                  <tr key={staff._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">
                      {staff.firstName} {staff.lastName}
                    </td>
                    <td className="px-6 py-4">{staff.email}</td>
                    <td className="px-6 py-4">{staff.phone || "-"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          staff.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {staff.isActive ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(staff)}
                          className="rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-600"
                        >
                          Sửa
                        </button>

                        <button
                          onClick={() => void handleToggleStatus(staff)}
                          className={`rounded-md px-3 py-1.5 text-xs font-medium text-white transition ${
                            staff.isActive
                              ? "bg-yellow-500 hover:bg-yellow-600"
                              : "bg-green-500 hover:bg-green-600"
                          }`}
                        >
                          {staff.isActive ? "Khóa" : "Mở khóa"}
                        </button>

                        <button
                          onClick={() => void handleDeleteStaff(staff)}
                          className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Thêm nhân viên
              </h3>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Họ"
                  value={form.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  className="rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                />
                <input
                  type="text"
                  placeholder="Tên"
                  value={form.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  className="rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                />
              </div>

              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
              />

              <input
                type="text"
                placeholder="Số điện thoại"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
              />

              <input
                type="password"
                placeholder="Mật khẩu"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                onClick={closeAddModal}
                className="rounded-lg border px-4 py-2 text-sm transition hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => void handleAddStaff()}
                disabled={submitting}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Đang thêm..." : "Thêm nhân viên"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Cập nhật nhân viên
              </h3>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Họ"
                  value={form.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  className="rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                />
                <input
                  type="text"
                  placeholder="Tên"
                  value={form.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  className="rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
                />
              </div>

              <input
                type="email"
                placeholder="Email"
                value={form.email}
                disabled
                className="w-full rounded-lg border bg-gray-100 px-3 py-2 text-gray-500 outline-none"
              />

              <input
                type="text"
                placeholder="Số điện thoại"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                onClick={closeEditModal}
                className="rounded-lg border px-4 py-2 text-sm transition hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => void handleUpdateStaff()}
                disabled={submitting}
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}