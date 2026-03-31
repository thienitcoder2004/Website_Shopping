import { Trash2, Lock, Unlock, Pencil } from "lucide-react";
import type { UserRole, UserRow } from "../../types/user";

type UsersTableProps = {
  users: UserRow[];
  onDelete: (id: string) => void | Promise<void>;
  onToggle: (id: string) => void | Promise<void>;
  onEdit: (user: UserRow) => void;
};

function getRoleLabel(role: UserRole) {
  switch (role) {
    case "admin":
      return "Admin";
    case "staff":
      return "Nhân viên";
    default:
      return "User";
  }
}

function getRoleClass(role: UserRole) {
  switch (role) {
    case "admin":
      return "bg-red-100 text-red-700";
    case "staff":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function UsersTable({
  users,
  onDelete,
  onToggle,
  onEdit,
}: UsersTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full table-fixed">
        <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <tr>
            <th className="p-4 text-left">Tên</th>
            <th className="p-4 text-left">Email</th>
            <th className="p-4 text-center">Vai trò</th>
            <th className="p-4 text-center">Trạng thái</th>
            <th className="p-4 text-center">Hành động</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr
              key={u._id}
              className="border-b border-slate-100 hover:bg-purple-50/60"
            >
              <td className="p-4 truncate font-medium text-slate-800">
                {[u.firstName, u.lastName].filter(Boolean).join(" ") ||
                  "Chưa cập nhật"}
              </td>

              <td className="p-4 truncate text-slate-600">{u.email}</td>

              <td className="p-4 text-center">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getRoleClass(
                    u.role,
                  )}`}
                >
                  {getRoleLabel(u.role)}
                </span>
              </td>

              <td className="p-4 text-center">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                    u.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {u.isActive ? "Hoạt động" : "Đã khóa"}
                </span>
              </td>

              <td className="p-4 text-center">
                <div className="inline-flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(u)}
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-white transition hover:bg-blue-700"
                    aria-label="Sửa"
                    title="Sửa"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggle(u._id)}
                    className="inline-flex items-center justify-center rounded-lg bg-yellow-500 px-3 py-2 text-white transition hover:bg-yellow-600"
                    aria-label={u.isActive ? "Khóa" : "Mở khóa"}
                    title={u.isActive ? "Khóa" : "Mở khóa"}
                  >
                    {u.isActive ? <Lock size={16} /> : <Unlock size={16} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(u._id)}
                    className="inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-2 text-white transition hover:bg-red-700"
                    aria-label="Xóa"
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {!users.length && (
            <tr>
              <td colSpan={5} className="p-8 text-center text-slate-500">
                Chưa có người dùng
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}