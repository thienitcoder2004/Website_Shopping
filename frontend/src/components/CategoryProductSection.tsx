import { useState } from "react";
import banner from "../assets/images/banner_1.png";
import img from "../assets/images/banner_1.png";

type Product = {
  id: number;
  name: string;
  price?: number;
  oldPrice?: number;
  discount?: number;
  contact?: boolean;
  image: string;
};

const maleProducts: Product[] = [
  { id: 1, name: "Áo len kẻ ngang", price: 200000, image: img },
  { id: 2, name: "Áo khoác xanh lam", price: 670000, image: img },
  { id: 3, name: "Áo khoác xám", price: 180000, image: img },
  { id: 4, name: "Áo Phông Lacoste", price: 220000, image: img },
  { id: 5, name: "Áo len nam màu ghi", price: 350000, image: img },
  { id: 6, name: "Áo gió xanh lá", price: 870000, image: img },
  { id: 7, name: "Áo phông cổ hồng", price: 240000, image: img },
  { id: 8, name: "Áo dạ xanh lam", price: 520000, image: img },
];

const femaleProducts: Product[] = [
  {
    id: 1,
    name: "Váy bèo bó dáng",
    price: 320000,
    oldPrice: 330000,
    discount: -3,
    image: img,
  },
  { id: 2, name: "Váy hoa", price: 350000, image: img },
  { id: 3, name: "Áo phông tay lửng", contact: true, image: img },
  {
    id: 4,
    name: "Comple nhung xanh",
    price: 1400000,
    oldPrice: 1500000,
    discount: -7,
    image: img,
  },
  { id: 5, name: "Áo bèo trắng", price: 200000, image: img },
  { id: 6, name: "Bộ thể thao", price: 180000, image: img },
  { id: 7, name: "Bộ váy đen nhung", price: 610000, image: img },
  { id: 8, name: "Bộ váy áo croptop", price: 500000, image: img },
];

function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + " đ";
}

export default function CategoryProductSection() {
  const [active, setActive] = useState<"male" | "female">("male");

  const products = active === "male" ? maleProducts : femaleProducts;

  return (
    <section className="bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* ===== HEADER ===== */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold border-l-4 border-orange-600 pl-3">
              DANH MỤC SẢN PHẨM
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Các sản phẩm thời trang nam, nữ phù hợp với nhiều lứa tuổi
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setActive("male")}
              className={`px-6 py-2 border ${
                active === "male"
                  ? "bg-orange-600 text-white"
                  : "border-orange-600 text-orange-600"
              }`}
            >
              Nam
            </button>

            <button
              onClick={() => setActive("female")}
              className={`px-6 py-2 border ${
                active === "female"
                  ? "bg-orange-600 text-white"
                  : "border-orange-600 text-orange-600"
              }`}
            >
              Nữ
            </button>
          </div>
        </div>

        {/* ===== BANNER ===== */}
        <div className="mb-8">
          <img
            src={banner}
            alt="banner"
            className="w-full h-[180px] object-cover"
          />
        </div>

        {/* ===== PRODUCT GRID ===== */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 hover:shadow-lg transition duration-300 group"
            >
              <div className="relative overflow-hidden">
                {item.discount && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold w-10 h-10 flex items-center justify-center rounded-full">
                    {item.discount}%
                  </div>
                )}

                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-[250px] object-cover group-hover:scale-105 transition duration-500"
                />
              </div>

              <div className="mt-4 text-center">
                <h3 className="text-sm font-medium mb-2">{item.name}</h3>

                {item.contact ? (
                  <p className="text-orange-600 font-semibold">Liên hệ</p>
                ) : (
                  <div>
                    <span className="text-orange-600 font-semibold">
                      {formatPrice(item.price!)}
                    </span>

                    {item.oldPrice && (
                      <span className="text-gray-400 line-through text-sm ml-2">
                        {formatPrice(item.oldPrice)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ===== VIEW MORE ===== */}
        <div className="text-center mt-10">
          <button className="border border-gray-400 px-6 py-2 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition">
            XEM THÊM
          </button>
        </div>
      </div>
    </section>
  );
}
