import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import type { UserRole } from "../../types/user";

type AddUserModalProps = {
  token: string | null;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
};

type CreateUserForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Extract<UserRole, "user" | "staff">;
  dateOfBirth: string;
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

export default function AddUserModal({
  token,
  onClose,
  onSuccess,
}: AddUserModalProps) {
  const [form, setForm] = useState<CreateUserForm>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user",
    dateOfBirth: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = <K extends keyof CreateUserForm>(
    key: K,
    value: CreateUserForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      toast.error("Bạn chưa đăng nhập");
      return;
    }

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.password.trim()
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (form.role === "user" && !form.dateOfBirth) {
      toast.error("Tài khoản user phải có ngày sinh");
      return;
    }

    try {
      setSubmitting(true);

      const endpoint =
        form.role === "staff"
          ? "http://localhost:5000/api/admin/staffs"
          : "http://localhost:5000/api/admin/users";

      const payload =
        form.role === "staff"
          ? {
              firstName: form.firstName.trim(),
              lastName: form.lastName.trim(),
              email: form.email.trim(),
              password: form.password,
            }
          : {
              firstName: form.firstName.trim(),
              lastName: form.lastName.trim(),
              email: form.email.trim(),
              password: form.password,
              dateOfBirth: form.dateOfBirth,
            };

      await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Thêm tài khoản thành công");
      await onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(getAxiosErrorMessage(err, "Thêm tài khoản thất bại"));
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
        <h3 className="mb-5 text-xl font-bold text-slate-800">Thêm tài khoản</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={form.firstName}
            placeholder="Tên"
            className="w-full rounded-lg border p-3 outline-none focus:border-purple-500"
            onChange={(e) => handleChange("firstName", e.target.value)}
          />

          <input
            value={form.lastName}
            placeholder="Họ"
            className="w-full rounded-lg border p-3 outline-none focus:border-purple-500"
            onChange={(e) => handleChange("lastName", e.target.value)}
          />

          <input
            value={form.email}
            type="email"
            placeholder="Email"
            className="w-full rounded-lg border p-3 outline-none focus:border-purple-500"
            onChange={(e) => handleChange("email", e.target.value)}
          />

          <input
            value={form.password}
            type="password"
            placeholder="Mật khẩu"
            className="w-full rounded-lg border p-3 outline-none focus:border-purple-500"
            onChange={(e) => handleChange("password", e.target.value)}
          />

          <select
            value={form.role}
            className="w-full rounded-lg border p-3 outline-none focus:border-purple-500"
            onChange={(e) =>
              handleChange("role", e.target.value as Extract<UserRole, "user" | "staff">)
            }
          >
            <option value="user">User</option>
            <option value="staff">Nhân viên</option>
          </select>

          {form.role === "user" && (
            <input
              value={form.dateOfBirth}
              type="date"
              className="w-full rounded-lg border p-3 outline-none focus:border-purple-500"
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
            />
          )}

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
              className="rounded-lg bg-purple-600 px-4 py-2 text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Đang thêm..." : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}