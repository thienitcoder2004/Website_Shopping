import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import type { RootState } from "../../stores/store";
import UsersTable from "../../components/UsersTable";
import AddUserModal from "../../components/AddUserModal";
import EditUserModal from "../../components/EditUserModal";
import UserSearchBar from "../../components/UserSearchBar";

type UserRole = "admin" | "employee" | "user" | string;

export type TUser = {
  _id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

const API_BASE = "http://localhost:5000";

function getAxiosErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.message;
    if (typeof msg === "string" && msg.trim()) return msg;
    if (typeof err.message === "string" && err.message.trim())
      return err.message;
  }
  if (err instanceof Error && err.message.trim()) return err.message;
  return fallback;
}

export default function UsersPage() {
  const token = useSelector((state: RootState) => state.auth.token);

  const [users, setUsers] = useState<TUser[]>([]);
  const [editUser, setEditUser] = useState<TUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [keyword, setKeyword] = useState("");

  const fetchUsers = async () => {
    if (!token) return;

    try {
      const res = await axios.get<TUser[]>(`${API_BASE}/api/admin/users`, {
        params: { keyword },
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(res.data ?? []);
    } catch (err: unknown) {
      toast.error(getAxiosErrorMessage(err, "Không tải được danh sách users"));
      setUsers([]);
    }
  };

  useEffect(() => {
    void fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const deleteUser = async (id: string) => {
    if (!token) return;

    try {
      await axios.delete(`${API_BASE}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Đã xóa");
      await fetchUsers();
    } catch (err: unknown) {
      toast.error(getAxiosErrorMessage(err, "Xóa thất bại"));
    }
  };

  const toggleUser = async (id: string) => {
    if (!token) return;

    try {
      await axios.patch(
        `${API_BASE}/api/admin/users/${id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await fetchUsers();
    } catch (err: unknown) {
      toast.error(getAxiosErrorMessage(err, "Cập nhật trạng thái thất bại"));
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 space-y-6">
      <UserSearchBar
        keyword={keyword}
        setKeyword={setKeyword}
        onSearch={fetchUsers}
        onAdd={() => setShowModal(true)}
      />

      <UsersTable
        users={users}
        onDelete={deleteUser}
        onToggle={toggleUser}
        onEdit={setEditUser}
      />

      {showModal && (
        <AddUserModal
          token={token}
          onClose={() => setShowModal(false)}
          onSuccess={fetchUsers}
        />
      )}

      {editUser && (
        <EditUserModal
          token={token}
          user={editUser}
          onClose={() => setEditUser(null)}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  );
}
