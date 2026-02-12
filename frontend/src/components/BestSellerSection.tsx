import product1 from "../assets/images/banner_1.png";
import product2 from "../assets/images/banner_1.png";

const products = [
  {
    id: 1,
    name: "Váy bèo bó dáng",
    price: 320000,
    oldPrice: 330000,
    discount: -3,
    image: product1,
  },
  {
    id: 2,
    name: "Váy hoa",
    price: 350000,
    image: product2,
  },
  {
    id: 3,
    name: "Áo phông tay lửng",
    contact: true,
    image: product1,
  },
  {
    id: 4,
    name: "Comple nhung xanh",
    price: 1400000,
    oldPrice: 1500000,
    discount: -7,
    image: product2,
  },
  {
    id: 5,
    name: "Áo bèo trắng",
    price: 200000,
    image: product1,
  },
  {
    id: 6,
    name: "Bộ thể thao",
    price: 180000,
    image: product2,
  },
  {
    id: 7,
    name: "Áo khoác cam dáng ngắn",
    price: 740000,
    oldPrice: 800000,
    discount: -8,
    image: product1,
  },
  {
    id: 8,
    name: "Áo cổ lọ",
    price: 150000,
    oldPrice: 180000,
    discount: -17,
    image: product2,
  },
];

function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + " đ";
}

export default function BestSellerSection() {
  return (
    <section className="bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-semibold border-l-4 border-orange-600 pl-3">
              SẢN PHẨM BÁN CHẠY
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Chào thu với những mẫu sản phẩm mới nhất
            </p>
          </div>

          <button className="border border-orange-600 text-orange-600 px-5 py-2 hover:bg-orange-600 hover:text-white transition">
            XEM THÊM
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 group hover:shadow-lg transition duration-300"
            >
              <div className="relative overflow-hidden">
                {/* Discount Badge */}
                {item.discount && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold w-10 h-10 flex items-center justify-center rounded-full z-10">
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
                  <div className="space-x-2">
                    <span className="text-orange-600 font-semibold">
                      {formatPrice(item.price!)}
                    </span>

                    {item.oldPrice && (
                      <span className="text-gray-400 line-through text-sm">
                        {formatPrice(item.oldPrice)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
