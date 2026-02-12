import { useState } from "react";
import { Link } from "react-router-dom";

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export default function ShoppingCart() {
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: 1,
      name: "Bộ thể thao",
      price: 180000,
      quantity: 1,
      image: "https://i.imgur.com/3aX9QKf.jpg",
    },
  ]);

  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + " đ";

  const increase = (id: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  const decrease = (id: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      ),
    );
  };

  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <section className="bg-gray-100 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-sm text-gray-600 mb-6">
          Trang chủ / <span className="text-orange-600">Giỏ hàng</span>
        </div>

        <h2 className="text-2xl font-semibold mb-6">Giỏ hàng của bạn</h2>

        {cart.length === 0 ? (
          <div className="bg-white p-8 text-gray-600">
            Không có sản phẩm nào.{" "}
            <Link to="/" className="text-orange-600 underline">
              Quay lại cửa hàng
            </Link>
          </div>
        ) : (
          <>
            {/* ================= DESKTOP TABLE ================= */}
            <div className="hidden md:block bg-white shadow-sm overflow-x-auto">
              <table className="w-full text-sm text-center">
                <thead className="border-b">
                  <tr>
                    <th className="py-4">Ảnh</th>
                    <th>Tên</th>
                    <th>Đơn giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                    <th>Xóa</th>
                  </tr>
                </thead>

                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-6">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 mx-auto"
                        />
                      </td>

                      <td>{item.name}</td>

                      <td className="text-orange-600 font-semibold">
                        {formatPrice(item.price)}
                      </td>

                      <td>
                        <div className="flex justify-center items-center border w-fit mx-auto">
                          <button
                            onClick={() => decrease(item.id)}
                            className="px-3 py-1 border-r"
                          >
                            -
                          </button>
                          <span className="px-4">{item.quantity}</span>
                          <button
                            onClick={() => increase(item.id)}
                            className="px-3 py-1 border-l"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="text-orange-600 font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </td>

                      <td>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-white p-4 shadow-sm">
                  <div className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover"
                    />

                    <div className="flex-1">
                      <h3 className="font-medium mb-2">{item.name}</h3>

                      <p className="text-orange-600 font-semibold mb-2">
                        {formatPrice(item.price)}
                      </p>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center border">
                          <button
                            onClick={() => decrease(item.id)}
                            className="px-3 py-1 border-r"
                          >
                            -
                          </button>
                          <span className="px-4">{item.quantity}</span>
                          <button
                            onClick={() => increase(item.id)}
                            className="px-3 py-1 border-l"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 text-sm"
                        >
                          Xóa
                        </button>
                      </div>

                      <p className="mt-2 font-semibold">
                        Thành tiền:{" "}
                        <span className="text-orange-600">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col md:flex-row justify-between gap-6">
              <Link
                to="/"
                className="bg-gray-200 px-6 py-3 w-fit self-start hover:bg-gray-300"
              >
                TIẾP TỤC MUA HÀNG
              </Link>

              <div className="md:w-1/3 w-full">
                <div className="flex justify-between border p-4 mb-4">
                  <span>Tổng tiền</span>
                  <span className="text-orange-600 font-semibold">
                    {formatPrice(total)}
                  </span>
                </div>

                <button className="w-full bg-orange-600 text-white py-4 hover:bg-orange-700 transition">
                  TIẾN HÀNH THANH TOÁN
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
