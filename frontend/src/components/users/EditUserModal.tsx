import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import type { EditableUser } from "../../types/user";

type EditUserModalProps = {
  token: string | null;
  user: EditableUser;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
};

type EditUserForm = {
  firstName: string;
  lastName: string;
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

export default function EditUserModal({
  token,
  user,
  onClose,
  onSuccess,
}: EditUserModalProps) {
  const [form, setForm] = useState<EditUserForm>({
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
    });
  }, [user]);

  const handleChange = <K extends keyof EditUserForm>(
    key: K,
    value: EditUserForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      toast.error("Bạn chưa đăng nhập");
      return;
    }

    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("Vui lòng nhập đầy đủ họ tên");
      return;
    }

    try {
      setSubmitting(true);

      await axios.put(
        `http://localhost:5000/api/admin/users/${user._id}`,
        {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success("Cập nhật thành công");
      await onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(getAxiosErrorMessage(err, "Cập nhật thất bại"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h3 className="mb-2 text-xl font-bold text-slate-800">
          Chỉnh sửa tài khoản
        </h3>
        <p className="mb-5 text-sm text-slate-500">{user.email}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={form.firstName}
            className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
            placeholder="Tên"
            onChange={(e) => handleChange("firstName", e.target.value)}
          />

          <input
            value={form.lastName}
            className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
            placeholder="Họ"
            onChange={(e) => handleChange("lastName", e.target.value)}
          />

          <div className="rounded-lg border bg-slate-50 p-3 text-sm text-slate-600">
            Vai trò: <span className="font-medium">{user.role}</span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg bg-gray-200 px-4 py-2 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}