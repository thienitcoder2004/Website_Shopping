import { Link } from "react-router-dom";

const newsData = [
  {
    id: 1,
    title: "Học Quang Vinh cách chọn phụ kiện thời trang cho mọi chuyến đi",
    date: "18/06/2019",
    author: "Lê Trung Hiếu",
    image: "https://i.imgur.com/3aX9QKf.jpg",
    desc: "Bởi thu đến đẹp trong chuyến du lịch kéo dài 14 ngày tại Maroc...",
  },
  {
    id: 2,
    title: "5 xu hướng thời trang giúp bạn trẻ ra cả chục tuổi",
    date: "18/06/2019",
    author: "Lê Trung Hiếu",
    image: "https://i.imgur.com/6g7Q9Rk.jpg",
    desc: "Chỉ cần diện những items siêu xinh trong dòng xu hướng thời trang...",
  },
  {
    id: 3,
    title: "6 mẹo thời trang công sở dành cho nữ CEO đẳng cấp",
    date: "18/06/2019",
    author: "Lê Trung Hiếu",
    image: "https://i.imgur.com/8Jg4sXk.jpg",
    desc: "Có một câu ngạn ngữ người nổi tiếng nói rằng...",
  },
];

export default function NewsPage() {
  return (
    <section className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-6">
          Trang chủ / <span className="text-orange-600">Tin tức</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* ================= SIDEBAR ================= */}
          <aside className="lg:col-span-1 space-y-8">
            <div className="bg-white p-5 shadow-sm">
              <h3 className="font-semibold border-l-4 border-orange-600 pl-3 mb-4">
                DANH MỤC TIN TỨC
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/">Trang chủ</Link>
                </li>
                <li>Nam</li>
                <li>Nữ</li>
                <li>Phụ kiện</li>
                <li>Khuyến mãi</li>
                <li className="text-orange-600">Tin tức</li>
                <li>Liên hệ</li>
              </ul>
            </div>

            <div className="bg-white p-5 shadow-sm">
              <h3 className="font-semibold border-l-4 border-orange-600 pl-3 mb-4">
                TIN TỨC MỚI NHẤT
              </h3>

              {newsData.slice(0, 3).map((item) => (
                <div key={item.id} className="flex gap-3 mb-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 object-cover"
                  />
                  <p className="text-xs">{item.title}</p>
                </div>
              ))}
            </div>

            <div className="bg-white p-5 shadow-sm">
              <h3 className="font-semibold border-l-4 border-orange-600 pl-3 mb-4">
                BÁN CHẠY
              </h3>
              <p className="text-sm text-orange-600 font-semibold">
                Váy bèo bó dáng
              </p>
              <p className="text-sm text-orange-600 font-semibold">320.000 đ</p>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {newsData.map((item) => (
                <div key={item.id} className="bg-white shadow-sm">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-[220px] object-cover"
                  />
                  <div className="p-5">
                    <h3 className="font-semibold mb-2">{item.title}</h3>

                    <p className="text-xs text-gray-500 mb-2">
                      {item.date} | {item.author}
                    </p>

                    <p className="text-sm text-gray-600 mb-4">{item.desc}</p>

                    <button className="border px-4 py-2 text-sm hover:bg-orange-600 hover:text-white transition">
                      XEM CHI TIẾT
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
