import { useEffect, useMemo, useState } from "react";
import axios, { AxiosError } from "axios";

type ContactStatus = "new" | "resolved";

export type TContact = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  status: ContactStatus;
  createdAt?: string;
  updatedAt?: string;
};

type ContactUpdatePayload = Pick<TContact, "fullName" | "email" | "message">;

function getErrorMessage(err: unknown) {
  if (axios.isAxiosError(err)) {
    const e = err as AxiosError<{ message?: string }>;
    return e.response?.data?.message || e.message || "Có lỗi xảy ra";
  }
  return "Có lỗi xảy ra";
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<TContact[]>([]);
  const [editing, setEditing] = useState<TContact | null>(null);

  const token = useMemo(() => localStorage.getItem("token"), []);

  const authHeaders = useMemo(() => {
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }, [token]);

  const fetchData = async () => {
    try {
      const res = await axios.get<TContact[]>(
        "http://localhost:5000/api/contacts",
        {
          headers: authHeaders,
        },
      );

      // nếu backend trả {data: ...} thì đổi thành: setContacts(res.data.data)
      setContacts(res.data);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/contacts/${id}`, {
        headers: authHeaders,
      });
      await fetchData();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/contacts/${id}/resolve`,
        {},
        { headers: authHeaders },
      );
      await fetchData();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;

    const payload: ContactUpdatePayload = {
      fullName: editing.fullName,
      email: editing.email,
      message: editing.message,
    };

    try {
      await axios.put(
        `http://localhost:5000/api/contacts/${editing._id}`,
        payload,
        { headers: authHeaders },
      );

      setEditing(null);
      await fetchData();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <div className="p-8 bg-gray-100">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6">
          Quản lý liên hệ
        </h2>

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

              {!contacts.length && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-500">
                    Chưa có liên hệ nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDIT */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[420px]">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Chỉnh sửa liên hệ
            </h3>

            <label className="text-sm text-slate-600">Họ tên</label>
            <input
              className="w-full border p-2 mb-3 rounded-lg"
              value={editing.fullName}
              onChange={(e) =>
                setEditing((prev) =>
                  prev ? { ...prev, fullName: e.target.value } : prev,
                )
              }
            />

            <label className="text-sm text-slate-600">Email</label>
            <input
              className="w-full border p-2 mb-3 rounded-lg"
              value={editing.email}
              onChange={(e) =>
                setEditing((prev) =>
                  prev ? { ...prev, email: e.target.value } : prev,
                )
              }
            />

            <label className="text-sm text-slate-600">Nội dung</label>
            <textarea
              className="w-full border p-2 mb-3 rounded-lg min-h-[120px]"
              value={editing.message}
              onChange={(e) =>
                setEditing((prev) =>
                  prev ? { ...prev, message: e.target.value } : prev,
                )
              }
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                Hủy
              </button>

              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
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
