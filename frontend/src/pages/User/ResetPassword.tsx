import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        { password },
      );

      toast.success("Đổi mật khẩu thành công 🎉");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.message);
    }
  };

  return (
    <section className="bg-gray-100 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="p-10">
          <h2 className="text-lg font-semibold border-b-2 border-orange-600 pb-2 mb-8">
            Đổi Mật Khẩu Tài Khoản
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Mật khẩu mới"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 w-full"
              required
            />

            <button className="bg-orange-600 text-white px-4 py-2">
              Đổi mật khẩu
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
