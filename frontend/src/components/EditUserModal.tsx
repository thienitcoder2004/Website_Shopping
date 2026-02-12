import axios from "axios";
import { toast } from "react-toastify";

export default function EditUserModal({
  token,
  user,
  onClose,
  onSuccess,
}: any) {
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await axios.put(`http://localhost:5000/api/admin/users/${user._id}`, user, {
      headers: { Authorization: `Bearer ${token}` },
    });

    toast.success("Cập nhật thành công");
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
        <h3 className="text-xl font-bold mb-4">Chỉnh sửa</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border p-3 rounded-lg"
            value={user.firstName}
            onChange={(e) => (user.firstName = e.target.value)}
          />

          <input
            className="w-full border p-3 rounded-lg"
            value={user.lastName}
            onChange={(e) => (user.lastName = e.target.value)}
          />

          <select
            className="w-full border p-3 rounded-lg"
            value={user.role}
            onChange={(e) => (user.role = e.target.value)}
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Cập nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
