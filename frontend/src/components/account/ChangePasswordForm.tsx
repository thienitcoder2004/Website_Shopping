import { useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import {
  API_BASE,
  getAxiosErrorMessage,
  getPasswordStrength,
} from "../../utils/account.utils";

type ChangePasswordFormProps = {
  token: string | null;
};

export default function ChangePasswordForm({
  token,
}: ChangePasswordFormProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const passwordStrength = useMemo(
    () => getPasswordStrength(newPassword),
    [newPassword],
  );

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Bạn chưa đăng nhập");
      return;
    }

    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin mật khẩu");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải tối thiểu 6 ký tự");
      return;
    }

    if (oldPassword === newPassword) {
      toast.error("Mật khẩu mới không được trùng mật khẩu cũ");
      return;
    }

    try {
      setChangingPassword(true);

      await axios.post(
        `${API_BASE}/api/auth/change-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Đổi mật khẩu thành công 🎉");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      toast.error(getAxiosErrorMessage(err, "Lỗi đổi mật khẩu"));
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <ShieldCheck size={20} className="text-slate-700" />
        <h3 className="text-xl font-semibold text-slate-800">Đổi mật khẩu</h3>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-4">
        <div className="relative">
          <input
            type={showOld ? "text" : "password"}
            placeholder="Mật khẩu cũ"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 pr-11 outline-none transition focus:border-orange-500"
            required
          />
          <button
            type="button"
            onClick={() => setShowOld((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
          >
            {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 pr-11 outline-none transition focus:border-orange-500"
            required
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
          >
            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {newPassword && (
          <div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full ${passwordStrength.color} ${passwordStrength.width} transition-all`}
              />
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Độ mạnh mật khẩu:{" "}
              <span className="font-semibold">{passwordStrength.label}</span>
            </p>
          </div>
        )}

        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 pr-11 outline-none transition focus:border-orange-500"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          disabled={changingPassword}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {changingPassword ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Đang đổi mật khẩu...
            </>
          ) : (
            "Đổi mật khẩu"
          )}
        </button>
      </form>
    </div>
  );
}