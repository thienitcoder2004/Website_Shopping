import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import type { AppDispatch } from "../../stores/store";
import { login } from "../../stores/authSlice";

type LoginForm = {
  email: string;
  password: string;
};

const toErrorMessage = (err: unknown) => {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  return "Đăng nhập thất bại";
};

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const isValidGmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidGmail(form.email)) {
      toast.error("Email phải là @gmail.com ❌");
      return;
    }

    try {
      const result = await dispatch(login(form)).unwrap();

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      toast.success("Đăng nhập thành công 🎉");

      const role = String(result.user?.role || "").toLowerCase();

      if (role === "admin" || role === "staff") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err: unknown) {
      const msg = toErrorMessage(err);
      toast.error(msg);
      setError(msg);
    }
  };

  return (
    <section className="bg-gray-100 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-lg font-semibold border-b-2 border-orange-600 pb-2 mb-8">
          ĐĂNG NHẬP TÀI KHOẢN
        </h2>

        <div className="bg-white p-10 shadow-sm space-y-5">
          {error && <div className="bg-red-100 text-red-600 p-2">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full border px-4 py-2"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Mật khẩu"
                value={form.password}
                onChange={handleChange}
                className="w-full border px-4 py-2 pr-10"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              className="bg-orange-600 text-white px-6 py-2 w-full"
            >
              Đăng nhập
            </button>
          </form>

          <div className="text-sm text-center mt-4">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-gray-500 hover:text-orange-600"
            >
              Mất mật khẩu?
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
