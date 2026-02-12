import img from "../assets/images/banner_1.png";

const newsList = [
  {
    id: 1,
    title: "Học Quang Vinh cách chọn phụ kiện thời trang cho mọi chuyến đi",
    desc: "Bởi thu đến đẹp trong chuyến du lịch kéo dài 14 ngày tại Maroc...",
    image: img,
  },
  {
    id: 2,
    title: "5 xu hướng thời trang giúp bạn trẻ ra cả chục tuổi",
    desc: "Chỉ cần diện những items siêu xinh trong dòng xu hướng thời trang 2019...",
    image: img,
  },
  {
    id: 3,
    title: "6 mẹo thời trang công sở dành cho nữ CEO đẳng cấp",
    desc: "Có một câu ngạn ngữ người nổi tiếng rằng: Hãy ăn mặc vì công việc bạn mong muốn...",
    image: img,
  },
];

export default function NewsSection() {
  return (
    <section className="bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold border-l-4 border-orange-600 pl-3">
              TIN TỨC THỜI TRANG
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Tin tức mới nhất về thời trang trong nước và thế giới
            </p>
          </div>

          <button className="border border-orange-600 text-orange-600 px-5 py-2 hover:bg-orange-600 hover:text-white transition">
            XEM THÊM
          </button>
        </div>

        {/* NEWS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {newsList.map((item) => (
            <div
              key={item.id}
              className="bg-white hover:shadow-lg transition duration-300"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-[200px] object-cover"
              />
              <div className="p-4">
                <h3 className="text-sm font-semibold mb-2">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
