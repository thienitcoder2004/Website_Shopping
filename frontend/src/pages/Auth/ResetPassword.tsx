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

  const [loading, setLoading] = useState(false);

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

    setLoading(true);

    try {
      await axios.post(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        { password },
      );

      toast.success("Đổi mật khẩu thành công 🎉");
      navigate("/login");
    } catch (err: unknown) {
      toast.error(getAxiosErrorMessage(err, "Lỗi reset mật khẩu"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gray-100 pt-5 pb-10">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-lg font-semibold border-b-2 border-orange-600 pb-2 mb-8">
          ĐỔI MẬT KHẨU
        </h2>

        <div className="bg-white p-10 shadow-sm space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* PASSWORD */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu mới"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border px-4 py-2 pr-10 focus:outline-none focus:border-orange-600"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* CONFIRM */}
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Xác nhận mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border px-4 py-2 pr-10 focus:outline-none focus:border-orange-600"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              disabled={loading}
              className="bg-orange-600 text-white px-6 py-2 w-full hover:bg-orange-700 transition disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
