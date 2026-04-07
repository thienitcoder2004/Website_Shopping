import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import type { RootState } from "../../stores/store";
import UsersTable from "../../components/users/UsersTable";
import AddUserModal from "../../components/users/AddUserModal";
import EditUserModal from "../../components/users/EditUserModal";
import UserSearchBar from "../../components/users/UserSearchBar";
import type { TUser, UserRole, UserRow } from "../../types/user";

const API_BASE = "http://localhost:5000";

type AdminUsersResponse = {
  ok?: boolean;
  users?: TUser[];
};

function getAxiosErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.message;
    if (typeof msg === "string" && msg.trim()) return msg;
    if (typeof err.message === "string" && err.message.trim()) {
      return err.message;
    }
  }

  if (err instanceof Error && err.message.trim()) return err.message;
  return fallback;
}

function normalizeRole(role: string): UserRole {
  if (role === "admin") return "admin";
  if (role === "staff") return "staff";
  return "user";
}

export default function UsersPage() {
  const token = useSelector((state: RootState) => state.auth.token);

  const [users, setUsers] = useState<TUser[]>([]);
  const [editUser, setEditUser] = useState<TUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [keyword, setKeyword] = useState("");

  const fetchUsers = useCallback(async () => {
    if (!token) {
      setUsers([]);
      return;
    }

    try {
      const res = await axios.get<AdminUsersResponse>(
        `${API_BASE}/api/admin/users`,
        {
          params: { keyword: keyword.trim() },
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setUsers(Array.isArray(res.data?.users) ? res.data.users : []);
    } catch (err: unknown) {
      toast.error(getAxiosErrorMessage(err, "Không tải được danh sách users"));
      setUsers([]);
    }
  }, [token, keyword]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchUsers();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchUsers]);

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
      toast.success("Đã cập nhật trạng thái");
      await fetchUsers();
    } catch (err: unknown) {
      toast.error(getAxiosErrorMessage(err, "Cập nhật trạng thái thất bại"));
    }
  };

  const normalizedUsers: UserRow[] = useMemo(() => {
    return users.map((user) => ({
      _id: user._id,
      email: user.email,
      role: normalizeRole(user.role),
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      isActive: user.isActive ?? true,
    }));
  }, [users]);

  const safeEditUser = useMemo(() => {
    if (!editUser) return null;

    return {
      ...editUser,
      role: normalizeRole(editUser.role),
    };
  }, [editUser]);

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 space-y-6">
      <UserSearchBar
        keyword={keyword}
        setKeyword={setKeyword}
        onSearch={fetchUsers}
        onAdd={() => setShowModal(true)}
      />

      <UsersTable
        users={normalizedUsers}
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

      {safeEditUser && (
        <EditUserModal
          token={token}
          user={safeEditUser}
          onClose={() => setEditUser(null)}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  );
}