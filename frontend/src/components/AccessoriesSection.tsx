import saleImg from "../assets/images/banner_1.png";
import img from "../assets/images/banner_1.png";

const accessories = [
  { id: 1, name: "Khăn choàng thời trang", price: 450000, image: img },
  { id: 2, name: "Kính râm gọng nhựa màu da báo", price: 150000, image: img },
  { id: 3, name: "Mũ lưỡi trai xanh lam 9FORTY", price: 230000, image: img },
  { id: 4, name: "Đồng hồ cao cấp dây da", price: 1200000, image: img },
  { id: 5, name: "Dây đeo hoa xanh ngọc", price: 120000, image: img },
  { id: 6, name: "Vòng cổ thời trang", price: 450000, image: img },
];

function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + " đ";
}

export default function AccessoriesSection() {
  return (
    <section className="bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold border-l-4 border-orange-600 pl-3">
              PHỤ KIỆN
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Các loại phụ kiện đi cùng với những trang phục của bạn
            </p>
          </div>

          <button className="border border-orange-600 text-orange-600 px-5 py-2 hover:bg-orange-600 hover:text-white transition">
            XEM THÊM
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SALE BANNER */}
          <div className="relative overflow-hidden group">
            <img
              src={saleImg}
              alt="sale"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
              <p className="text-lg">SALE OFF</p>
              <h3 className="text-5xl font-bold">50%</h3>
              <p>tất cả phụ kiện</p>
            </div>
          </div>

          {/* ACCESSORY LIST */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-6">
            {accessories.map((item) => (
              <div key={item.id} className="flex gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover"
                />
                <div>
                  <h4 className="text-sm font-medium mb-1">{item.name}</h4>
                  <p className="text-orange-600 font-semibold text-sm">
                    {formatPrice(item.price)}
                  </p>
                  <button className="text-xs text-gray-500 hover:text-orange-600">
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
