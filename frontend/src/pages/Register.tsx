import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { AppDispatch } from "../stores/store";
import { register } from "../stores/authSlice";

type RegisterForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

export default function Register() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
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
      await dispatch(register(form)).unwrap();
      toast.success("Đăng nhập thành công 🎉");
      navigate("/");
    } catch (err: any) {
      toast.error(err || "Đăng nhập thất bại");
      setError(err);
    }
  };

  return (
    <section className="bg-gray-100  py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-lg font-semibold border-b-2 border-orange-600 pb-2 mb-8">
          ĐĂNG KÝ TÀI KHOẢN
        </h2>

        <div className="bg-white p-10 shadow-sm">
          {error && (
            <div className="bg-red-100 text-red-600 p-2 mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              name="firstName"
              placeholder="Tên"
              value={form.firstName}
              onChange={handleChange}
              className="w-full border px-4 py-2"
              required
            />

            <input
              name="lastName"
              placeholder="Họ"
              value={form.lastName}
              onChange={handleChange}
              className="w-full border px-4 py-2"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full border px-4 py-2"
              required
            />

            <input
              name="phone"
              placeholder="Số điện thoại"
              value={form.phone}
              onChange={handleChange}
              className="w-full border px-4 py-2"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              value={form.password}
              onChange={handleChange}
              className="w-full border px-4 py-2"
              required
            />

            <button
              type="submit"
              className="bg-orange-600 text-white px-6 py-2"
            >
              Đăng ký
            </button>
          </form>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() =>
                (window.location.href = "http://localhost:5000/api/auth/google")
              }
              className="bg-red-600 text-white px-6 py-2"
            >
              Google
            </button>

            <button
              onClick={() =>
                (window.location.href =
                  "http://localhost:5000/api/auth/facebook")
              }
              className="bg-blue-600 text-white px-6 py-2"
            >
              Facebook
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
