import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import type { AppDispatch } from "../../stores/store";
import { register } from "../../stores/authSlice";

type RegisterForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other" | "prefer_not_to_say";
  shoppingPreference: "male" | "female" | "both";
};

function calculateAge(dateOfBirth: string) {
  if (!dateOfBirth) return 0;

  const today = new Date();
  const dob = new Date(dateOfBirth);

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dob.getDate())
  ) {
    age--;
  }

  return age;
}

function getMaxBirthDate() {
  const today = new Date();
  const maxDate = new Date(
    today.getFullYear() - 16,
    today.getMonth(),
    today.getDate()
  );

  return maxDate.toISOString().split("T")[0];
}

export default function Register() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    gender: "prefer_not_to_say",
    shoppingPreference: "both",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const age = useMemo(() => calculateAge(form.dateOfBirth), [form.dateOfBirth]);
  const isUnder16 = form.dateOfBirth ? age < 16 : false;
  const maxBirthDate = useMemo(() => getMaxBirthDate(), []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const toErrorMessage = (err: unknown) => {
    if (typeof err === "string") return err;
    if (err instanceof Error) return err.message;
    return "Đăng ký thất bại";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.dateOfBirth) {
      toast.error("Vui lòng chọn ngày sinh");
      return;
    }

    if (isUnder16) {
      toast.error("Bạn phải đủ 16 tuổi để tạo tài khoản ❌");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Mật khẩu không khớp ❌");
      return;
    }

    try {
      await dispatch(
        register({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
          shoppingPreference: form.shoppingPreference,
        })
      ).unwrap();

      toast.success("Đăng ký thành công 🎉");
      navigate("/");
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
          ĐĂNG KÝ TÀI KHOẢN
        </h2>

        <div className="bg-white p-10 shadow-sm space-y-5">
          {error && <div className="bg-red-100 text-red-600 p-2">{error}</div>}

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

            <div>
              <label className="block mb-2 font-medium">Ngày sinh</label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                max={maxBirthDate}
                className="w-full border px-4 py-2"
                required
              />
              {form.dateOfBirth && (
                <p className={`mt-2 text-sm ${isUnder16 ? "text-red-600" : "text-green-600"}`}>
                  {isUnder16
                    ? `Bạn hiện ${age} tuổi - chưa đủ 16 tuổi để đăng ký`
                    : `Bạn hiện ${age} tuổi - đủ điều kiện đăng ký`}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 font-medium">Giới tính</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full border px-4 py-2"
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
                <option value="prefer_not_to_say">Không muốn tiết lộ</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Bạn muốn xem sản phẩm</label>
              <select
                name="shoppingPreference"
                value={form.shoppingPreference}
                onChange={handleChange}
                className="w-full border px-4 py-2"
              >
                <option value="male">Đồ nam</option>
                <option value="female">Đồ nữ</option>
                <option value="both">Cả đồ nam và đồ nữ</option>
              </select>
            </div>

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
              <div
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>

            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full border px-4 py-2 pr-10"
                required
              />
              <div
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>

            <button
              type="submit"
              disabled={isUnder16}
              className={`text-white px-6 py-2 w-full ${
                isUnder16
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-600"
              }`}
            >
              Đăng ký
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}