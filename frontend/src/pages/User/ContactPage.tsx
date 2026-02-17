import { MapPin, Phone, Mail } from "lucide-react";
import { useState } from "react";
import axios from "axios";

type ContactForm = {
  fullName: string;
  email: string;
  phone: string;
  message: string;
};

type ContactErrors = Partial<Record<keyof ContactForm, string>>;

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

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState<ContactErrors>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // optional: xóa lỗi field ngay khi người dùng sửa
    setErrors((prev) => ({
      ...prev,
      [name as keyof ContactForm]: undefined,
    }));
  };

  const validate = () => {
    const newErrors: ContactErrors = {};

    if (!form.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ tên";

    if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      newErrors.email = "Email không hợp lệ";

    const phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length < 9) newErrors.phone = "Số điện thoại không hợp lệ";

    if (!form.message.trim()) newErrors.message = "Vui lòng nhập nội dung";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess("");

    if (!validate()) return;

    try {
      setLoading(true);

      await axios.post("http://localhost:5000/api/contacts", form);

      setSuccess("🎉 Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm.");
      setForm({
        fullName: "",
        email: "",
        phone: "",
        message: "",
      });
      setErrors({});
    } catch (err: unknown) {
      alert(getAxiosErrorMessage(err, "Có lỗi xảy ra"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-6">
          Trang chủ / <span className="text-orange-600">Liên hệ</span>
        </div>

        {/* INFO BOXES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 flex items-center gap-4 shadow-sm rounded-xl">
            <div className="bg-orange-600 text-white p-3 rounded-full">
              <MapPin size={22} />
            </div>
            <div>
              <p className="font-semibold">Địa chỉ</p>
              <p className="text-sm text-gray-600">
                266 Đội Cấn, Ba Đình, Hà Nội
              </p>
            </div>
          </div>

          <div className="bg-white p-6 flex items-center gap-4 shadow-sm rounded-xl">
            <div className="bg-orange-600 text-white p-3 rounded-full">
              <Phone size={22} />
            </div>
            <div>
              <p className="font-semibold">Hotline</p>
              <p className="text-sm text-gray-600">1900 6750</p>
            </div>
          </div>

          <div className="bg-white p-6 flex items-center gap-4 shadow-sm rounded-xl">
            <div className="bg-orange-600 text-white p-3 rounded-full">
              <Mail size={22} />
            </div>
            <div>
              <p className="font-semibold">Email</p>
              <p className="text-sm text-gray-600">support@sapo.vn</p>
            </div>
          </div>
        </div>

        {/* MAP + FORM */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* GOOGLE MAP */}
          <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-sm">
            <iframe
              title="map"
              src="https://www.google.com/maps?q=266%20%C4%90%E1%BB%99i%20C%E1%BA%A5n%20H%C3%A0%20N%E1%BB%99i&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>

          {/* CONTACT FORM */}
          <div className="bg-white p-8 shadow-sm rounded-xl">
            <h2 className="text-2xl font-semibold mb-2">
              GỬI TIN NHẮN CHO CHÚNG TÔI
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Mô tả ngắn trang liên hệ
            </p>

            {success && (
              <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Họ và tên*"
                  className="w-full border px-4 py-3 rounded-lg outline-none focus:border-orange-600"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email*"
                  className="w-full border px-4 py-3 rounded-lg outline-none focus:border-orange-600"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Số điện thoại*"
                  className="w-full border px-4 py-3 rounded-lg outline-none focus:border-orange-600"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Nội dung"
                  rows={5}
                  className="w-full border px-4 py-3 rounded-lg outline-none focus:border-orange-600"
                />
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
              >
                {loading ? "Đang gửi..." : "Gửi liên hệ của bạn"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
