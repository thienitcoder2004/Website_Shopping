import { Trash2, Lock, Unlock, Pencil } from "lucide-react";

export default function UsersTable({ users, onDelete, onToggle, onEdit }: any) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <table className="w-full table-fixed">
        <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <tr>
            <th className="p-4 text-left">Tên</th>
            <th>Email</th>
            <th>Role</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u: any) => (
            <tr key={u._id} className="border-b hover:bg-purple-50">
              <td className="p-4">
                {u.firstName} {u.lastName}
              </td>

              <td>{u.email}</td>

              <td className="text-center">{u.role}</td>

              <td className="text-center">
                {u.isActive ? "Hoạt động" : "Đã khóa"}
              </td>

              <td className="text-center space-x-2">
                <button
                  onClick={() => onEdit(u)}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  <Pencil size={16} />
                </button>

                <button
                  onClick={() => onToggle(u._id)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  {u.isActive ? <Lock size={16} /> : <Unlock size={16} />}
                </button>

                <button
                  onClick={() => onDelete(u._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
