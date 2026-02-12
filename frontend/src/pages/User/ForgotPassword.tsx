import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", {
        email,
      });

      toast.success("Đã gửi email reset mật khẩu 📩");
    } catch (err: any) {
      toast.error(err.response?.data?.message);
    }
  };

  return (
    <section className="bg-gray-100 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-lg font-semibold border-b-2 border-orange-600 pb-2 mb-8">
          Quên Mật Khẩu
        </h2>

        <div className="bg-white p-10 shadow-sm space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 w-full"
              required
            />

            <button className="bg-orange-600 text-white px-4 py-2">Gửi</button>
          </form>
        </div>
      </div>
    </section>
  );
}
