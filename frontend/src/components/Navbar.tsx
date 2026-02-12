import { ChevronRight, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import banner1 from "../assets/images/banner_1.png";

export default function Navbar() {
  const [slide, setSlide] = useState(0);

  const banners = [banner1, banner1];

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <section className="bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="hidden lg:flex gap-4 mb-4">
          <div className="flex-1 bg-black text-white text-sm py-3 text-center">
            ⭐ Free ship với đơn &gt;= 500k
          </div>
          <div className="flex-1 bg-black text-white text-sm py-3 text-center">
            ⭐ Đổi trả trong vòng 7 ngày
          </div>
          <div className="flex-1 bg-black text-white text-sm py-3 text-center">
            ⭐ Khuyến mãi mùa thu lên đến 50%
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-white shadow-sm hidden lg:block relative">
            <div className="bg-orange-600 text-white font-semibold p-4">
              DANH MỤC SẢN PHẨM
            </div>

            <ul className="text-sm">
              <li className="group relative border-b">
                <div className="flex justify-between items-center px-4 py-3 hover:bg-gray-100 cursor-pointer">
                  Hàng mới về
                  <ChevronRight size={16} />
                </div>

                <div className="absolute left-full top-0 w-64 bg-white shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="px-4 py-3 hover:bg-gray-100 cursor-pointer">
                    Áo sơ mi nam
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-100 cursor-pointer">
                    Áo sơ mi nữ
                  </div>
                </div>
              </li>

              <li className="group relative border-b">
                <div className="flex justify-between items-center px-4 py-3 hover:bg-gray-100 cursor-pointer">
                  Thời trang nam
                  <ChevronRight size={16} />
                </div>

                <div className="absolute left-full top-0 w-64 bg-white shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="flex justify-between px-4 py-3 hover:bg-gray-100 cursor-pointer">
                    Áo sơ mi
                  </div>

                  <div className="flex justify-between px-4 py-3 hover:bg-gray-100 cursor-pointer">
                    Quần nam
                  </div>

                  <div className="px-4 py-3 hover:bg-gray-100 cursor-pointer">
                    Comple
                  </div>

                  <div className="flex justify-between px-4 py-3 hover:bg-gray-100 cursor-pointer">
                    Áo cộc tay
                  </div>
                </div>
              </li>

              <li className="px-4 py-3 border-b hover:bg-gray-100 cursor-pointer">
                Thời trang nữ
              </li>

              <li className="px-4 py-3 border-b hover:bg-gray-100 cursor-pointer">
                Thời trang công sở
              </li>

              <li className="px-4 py-3 border-b hover:bg-gray-100 cursor-pointer">
                Phụ kiện nam
              </li>

              <li className="px-4 py-3 border-b hover:bg-gray-100 cursor-pointer">
                Phụ kiện nữ
              </li>

              <li className="px-4 py-3 border-b hover:bg-gray-100 cursor-pointer">
                Giày da công sở
              </li>
            </ul>

            <div className="text-center text-orange-600 font-semibold py-3 cursor-pointer hover:bg-gray-100">
              XEM TẤT CẢ
            </div>
          </div>

          <div className="relative lg:col-span-3 overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{
                transform: `translateX(-${slide * 100}%)`,
              }}
            >
              {banners.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt="banner"
                  className="w-full h-[250px] md:h-[350px] lg:h-[400px] object-cover flex-shrink-0"
                />
              ))}
            </div>

            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full"
            >
              <ChevronLeft />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full"
            >
              <ChevronRight />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setSlide(i)}
                  className={`w-3 h-3 rounded-full cursor-pointer ${
                    slide === i ? "bg-orange-600" : "bg-white"
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
