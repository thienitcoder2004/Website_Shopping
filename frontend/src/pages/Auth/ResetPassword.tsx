import { useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

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

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // nếu URL thiếu token thì đá về login (tránh gọi API sai)
  if (!token) return <Navigate to="/login" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Mật khẩu phải tối thiểu 6 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        { password },
      );

      toast.success("Đổi mật khẩu thành công 🎉");
      navigate("/login");
    } catch (err: unknown) {
      toast.error(getAxiosErrorMessage(err, "Lỗi reset mật khẩu"));
    }
  };

  return (
    <section className="bg-gray-100 py-10 min-h-screen flex items-center">
      <div className="max-w-md mx-auto bg-white p-8 shadow-sm w-full">
        <h2 className="text-xl font-semibold border-b pb-3 mb-6">
          Đổi mật khẩu
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PASSWORD */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu mới"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-4 py-2 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border px-4 py-2 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              aria-label={
                showConfirm ? "Hide confirm password" : "Show confirm password"
              }
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button className="bg-orange-600 text-white w-full py-2 hover:bg-orange-700 transition">
            Đổi mật khẩu
          </button>
        </form>
      </div>
    </section>
  );
}
