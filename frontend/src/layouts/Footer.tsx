import img from "../assets/images/banner_1.png";

export default function Footer() {
  return (
    <footer className="bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold border-l-4 border-orange-600 inline-block pl-3">
            HÌNH ẢNH CỦA CHÚNG TÔI
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Hình ảnh sản phẩm của chúng tôi đã bán ra thị trường
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <img
              key={item}
              src={img}
              alt="gallery"
              className="w-full h-[150px] object-cover hover:scale-105 transition duration-500"
            />
          ))}
        </div>
      </div>

      <div className="bg-white py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* ABOUT */}
          <div>
            <h3 className="text-lg font-semibold border-l-4 border-orange-600 pl-3 mb-6">
              VỀ CHÚNG TÔI
            </h3>

            <ul className="space-y-3 text-sm text-gray-600">
              <li>📍 266 Đội Cấn, Hà Nội</li>
              <li>📍 70 Lữ Gia, P.15, Q.11, TP.HCM</li>
              <li>📍 124 Lê Đình Lý, P.Vĩnh Trung, Đà Nẵng</li>
              <li>📞 1800.6750</li>
              <li>✉ support@sapo.vn</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold border-l-4 border-orange-600 pl-3 mb-6">
              NHẬN KHUYẾN MÃI
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              Đăng ký email để nhận ngay mã giảm giá & những thông tin sản phẩm
              mới nhất từ chúng tôi
            </p>

            <input
              type="email"
              placeholder="Nhập email của bạn..."
              className="w-full border px-4 py-3 mb-4 outline-none focus:border-orange-600"
            />

            <button className="w-full bg-orange-600 text-white py-3 hover:bg-orange-700 transition">
              ĐĂNG KÝ
            </button>
          </div>

          <div>
            <h3 className="text-lg font-semibold border-l-4 border-orange-600 pl-3 mb-6">
              HỖ TRỢ KHÁCH HÀNG
            </h3>

            <ul className="space-y-3 text-sm text-gray-600 mb-4">
              <li>Từ thứ 2 - thứ 6: 8:00 AM - 10:00 PM</li>
              <li>Thứ 7: 9:00 AM - 8:00 PM</li>
              <li>Chủ nhật: Nghỉ cả ngày</li>
            </ul>

            <div className="flex gap-4 text-xl">
              <span className="cursor-pointer hover:text-orange-600">📘</span>
              <span className="cursor-pointer hover:text-orange-600">▶</span>
              <span className="cursor-pointer hover:text-orange-600">📸</span>
              <span className="cursor-pointer hover:text-orange-600">📌</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black text-gray-400 text-center py-4 text-sm">
        Bản quyền thuộc về <span className="text-orange-500">OHI Team</span> |
        Cung cấp bởi <span className="text-orange-500">Sapo</span>
      </div>
    </footer>
  );
}
