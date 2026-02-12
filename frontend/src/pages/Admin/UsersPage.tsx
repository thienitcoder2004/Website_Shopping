import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import type { RootState } from "../../stores/store";
import UsersTable from "../../components/UsersTable";
import AddUserModal from "../../components/AddUserModal";
import EditUserModal from "../../components/EditUserModal";
import UserSearchBar from "../../components/UserSearchBar";

export default function UsersPage() {
  const token = useSelector((state: RootState) => state.auth.token);

  const [users, setUsers] = useState<any[]>([]);
  const [editUser, setEditUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [keyword, setKeyword] = useState("");

  const fetchUsers = async () => {
    const res = await axios.get("http://localhost:5000/api/admin/users", {
      params: { keyword },
      headers: { Authorization: `Bearer ${token}` },
    });

    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id: string) => {
    await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("Đã xóa");
    fetchUsers();
  };

  const toggleUser = async (id: string) => {
    await axios.patch(
      `http://localhost:5000/api/admin/users/${id}/toggle`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    fetchUsers();
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
