import { Trash2, Lock, Unlock, Pencil } from "lucide-react";

export type UserRow = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
};

type UsersTableProps = {
  users: UserRow[];
  onDelete: (id: string) => void | Promise<void>;
  onToggle: (id: string) => void | Promise<void>;
  onEdit: (user: UserRow) => void;
};

export default function UsersTable({
  users,
  onDelete,
  onToggle,
  onEdit,
}: UsersTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <table className="w-full table-fixed">
        <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <tr>
            <th className="p-4 text-left">Tên</th>
            <th className="p-4 text-left">Email</th>
            <th className="p-4 text-center">Role</th>
            <th className="p-4 text-center">Trạng thái</th>
            <th className="p-4 text-center">Hành động</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="border-b hover:bg-purple-50">
              <td className="p-4 truncate">
                {u.firstName} {u.lastName}
              </td>

              <td className="p-4 truncate">{u.email}</td>

              <td className="p-4 text-center">{u.role}</td>

              <td className="p-4 text-center">
                {u.isActive ? "Hoạt động" : "Đã khóa"}
              </td>

              <td className="p-4 text-center">
                <div className="inline-flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(u)}
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                    aria-label="Sửa"
                    title="Sửa"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggle(u._id)}
                    className="inline-flex items-center justify-center rounded-lg bg-yellow-500 px-3 py-2 text-white hover:bg-yellow-600"
                    aria-label={u.isActive ? "Khóa" : "Mở khóa"}
                    title={u.isActive ? "Khóa" : "Mở khóa"}
                  >
                    {u.isActive ? <Lock size={16} /> : <Unlock size={16} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(u._id)}
                    className="inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
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
