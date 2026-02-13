import { MapPin, Phone, Mail } from "lucide-react";
import { useState } from "react";
import axios from "axios";

export default function ContactPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors: any = {};

    if (!form.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ tên";
    if (!form.email.match(/^\S+@\S+\.\S+$/))
      newErrors.email = "Email không hợp lệ";
    if (form.phone.length < 9) newErrors.phone = "Số điện thoại không hợp lệ";
    if (!form.message.trim()) newErrors.message = "Vui lòng nhập nội dung";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: any) => {
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
    } catch (error) {
      alert("Có lỗi xảy ra");
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
            ></iframe>
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
                ></textarea>
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
