import { MapPin, Phone, Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <section className="bg-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-6">
          Trang chủ / <span className="text-orange-600">Liên hệ</span>
        </div>

        {/* ===== INFO BOXES ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 flex items-center gap-4 shadow-sm">
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

          <div className="bg-white p-6 flex items-center gap-4 shadow-sm">
            <div className="bg-orange-600 text-white p-3 rounded-full">
              <Phone size={22} />
            </div>
            <div>
              <p className="font-semibold">Hotline</p>
              <p className="text-sm text-gray-600">1900 6750</p>
            </div>
          </div>

          <div className="bg-white p-6 flex items-center gap-4 shadow-sm">
            <div className="bg-orange-600 text-white p-3 rounded-full">
              <Mail size={22} />
            </div>
            <div>
              <p className="font-semibold">Email</p>
              <p className="text-sm text-gray-600">support@sapo.vn</p>
            </div>
          </div>
        </div>

        {/* ===== MAP + FORM ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* GOOGLE MAP */}
          <div className="w-full h-[400px]">
            <iframe
              title="map"
              src="https://www.google.com/maps?q=266%20%C4%90%E1%BB%99i%20C%E1%BA%A5n%20H%C3%A0%20N%E1%BB%99i&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
            ></iframe>
          </div>

          {/* CONTACT FORM */}
          <div className="bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold mb-2">
              GỬI TIN NHẮN CHO CHÚNG TÔI
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Mô tả ngắn trang liên hệ
            </p>

            <form className="space-y-4">
              <input
                type="text"
                placeholder="Họ và tên*"
                className="w-full border px-4 py-3 outline-none focus:border-orange-600"
              />
              <input
                type="email"
                placeholder="Email*"
                className="w-full border px-4 py-3 outline-none focus:border-orange-600"
              />
              <input
                type="text"
                placeholder="Số điện thoại*"
                className="w-full border px-4 py-3 outline-none focus:border-orange-600"
              />
              <textarea
                placeholder="Nội dung"
                rows={5}
                className="w-full border px-4 py-3 outline-none focus:border-orange-600"
              ></textarea>

              <button
                type="submit"
                className="bg-orange-600 text-white px-6 py-3 hover:bg-orange-700 transition"
              >
                Gửi liên hệ của bạn
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
