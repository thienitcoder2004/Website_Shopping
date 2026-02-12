import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { AppDispatch } from "../stores/store";
import { login } from "../stores/authSlice";

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await dispatch(login(form)).unwrap();
      toast.success("Đăng nhập thành công 🎉");
      navigate("/");
    } catch (err: any) {
      toast.error(err || "Đăng nhập thất bại");
      setError(err);
    }
  };

  return (
    <section className="bg-gray-100 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-lg font-semibold border-b-2 border-orange-600 pb-2 mb-8">
          ĐĂNG NHẬP TÀI KHOẢN
        </h2>

        <div className="bg-white p-10 shadow-sm">
          {error && (
            <div className="bg-red-100 text-red-600 p-2 mb-4">{error}</div>
          )}

          {/* SOCIAL LOGIN */}
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() =>
                (window.location.href = "http://localhost:5000/api/auth/google")
              }
              className="bg-red-600 text-white px-6 py-2 text-sm hover:bg-red-700"
            >
              Google
            </button>

            <button
              type="button"
              onClick={() =>
                (window.location.href =
                  "http://localhost:5000/api/auth/facebook")
              }
              className="bg-blue-600 text-white px-6 py-2 text-sm hover:bg-blue-700"
            >
              Facebook
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border px-4 py-2 outline-none focus:border-orange-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Mật khẩu *
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full border px-4 py-2 outline-none focus:border-orange-600"
              />
            </div>

            <div className="flex items-center gap-6">
              <button
                type="submit"
                className="bg-orange-600 text-white px-6 py-2 hover:bg-orange-700 transition"
              >
                Đăng nhập
              </button>

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-gray-500 hover:text-orange-600"
              >
                Mất mật khẩu?
              </button>
            </div>

            <div>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-sm text-gray-600 hover:text-orange-600"
              >
                Đăng ký
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
