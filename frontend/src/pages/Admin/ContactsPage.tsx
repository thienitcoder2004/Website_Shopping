import { useEffect, useState } from "react";
import axios from "axios";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    const res = await axios.get("http://localhost:5000/api/contacts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setContacts(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    await axios.delete(`http://localhost:5000/api/contacts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  const handleResolve = async (id: string) => {
    await axios.patch(
      `http://localhost:5000/api/contacts/${id}/resolve`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    fetchData();
  };

  const handleUpdate = async () => {
    await axios.put(
      `http://localhost:5000/api/contacts/${editing._id}`,
      editing,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    setEditing(null);
    fetchData();
  };

  return (
    <div className="p-8 bg-gray-100">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Quản lý liên hệ</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                <th className="p-3">Tên</th>
                <th className="p-3">Email</th>
                <th className="p-3">SĐT</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr
                  key={c._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-3">{c.fullName}</td>
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">{c.phone}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        c.status === "new"
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {c.status === "new" ? "Mới" : "Đã xử lý"}
                    </span>
                  </td>

                  <td className="p-3 text-center space-x-2">
                    <button
                      onClick={() => setEditing(c)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      Sửa
                    </button>

                    <button
                      onClick={() => handleDelete(c._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      Xóa
                    </button>

                    {c.status === "new" && (
                      <button
                        onClick={() => handleResolve(c._id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        Đã xử lý
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDIT */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-96">
            <h3 className="text-lg font-bold mb-4">Chỉnh sửa liên hệ</h3>

            <input
              className="w-full border p-2 mb-3 rounded-lg"
              value={editing.fullName}
              onChange={(e) =>
                setEditing({ ...editing, fullName: e.target.value })
              }
            />

            <input
              className="w-full border p-2 mb-3 rounded-lg"
              value={editing.email}
              onChange={(e) =>
                setEditing({ ...editing, email: e.target.value })
              }
            />

            <textarea
              className="w-full border p-2 mb-3 rounded-lg"
              value={editing.message}
              onChange={(e) =>
                setEditing({ ...editing, message: e.target.value })
              }
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Hủy
              </button>

              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
