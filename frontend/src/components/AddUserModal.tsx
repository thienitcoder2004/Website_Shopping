import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function AddUserModal({ token, onClose, onSuccess }: any) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user",
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await axios.post("http://localhost:5000/api/admin/users", form, {
      headers: { Authorization: `Bearer ${token}` },
    });

    toast.success("Thêm thành công 🎉");
    onClose();
    onSuccess();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      ></div>

      <div className="relative bg-white p-8 rounded-2xl shadow-2xl w-[400px]">
        <h3 className="text-xl font-bold mb-4">Thêm tài khoản</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="Tên"
            className="w-full border p-3 rounded-lg"
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />

          <input
            placeholder="Họ"
            className="w-full border p-3 rounded-lg"
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />

          <input
            placeholder="Email"
            className="w-full border p-3 rounded-lg"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Mật khẩu"
            className="w-full border p-3 rounded-lg"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <select
            className="w-full border p-3 rounded-lg"
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="user">User</option>
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              Hủy
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg"
            >
              Thêm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
