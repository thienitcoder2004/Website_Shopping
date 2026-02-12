import { useSelector, useDispatch } from "react-redux";
import { logout } from "../stores/authSlice";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import type { RootState } from "../stores/store";

export default function Account() {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [provinceCode, setProvinceCode] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [detailAddress, setDetailAddress] = useState("");

  useEffect(() => {
    axios
      .get("https://provinces.open-api.vn/api/p/")
      .then((res) => setProvinces(res.data));
  }, []);

  useEffect(() => {
    if (!provinceCode) return;

    axios
      .get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
      .then((res) => setDistricts(res.data.districts));

    setDistrictCode("");
    setWardCode("");
    setWards([]);
  }, [provinceCode]);

  useEffect(() => {
    if (!districtCode) return;

    axios
      .get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
      .then((res) => setWards(res.data.wards));

    setWardCode("");
  }, [districtCode]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    const province = provinces.find((p) => p.code == provinceCode)?.name;
    const district = districts.find((d) => d.code == districtCode)?.name;
    const ward = wards.find((w) => w.code == wardCode)?.name;

    const fullAddress = `${detailAddress}, ${ward}, ${district}, ${province}`;

    try {
      const res = await axios.put(
        "http://localhost:5000/api/auth/update-profile",
        { address: fullAddress },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Cập nhật địa chỉ thành công 🎉");

      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.location.reload();
    } catch {
      toast.error("Lỗi cập nhật địa chỉ");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải tối thiểu 6 ký tự");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/auth/change-password",
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Đổi mật khẩu thành công 🎉");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi đổi mật khẩu");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Đăng xuất thành công");
    navigate("/");
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <section className="bg-gray-100 py-10 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-10 shadow-sm space-y-8">
        <h2 className="text-xl font-semibold border-b pb-3">
          Tài khoản của bạn
        </h2>

        <div className="space-y-2">
          <p>
            <strong>Họ tên:</strong> {user.firstName} {user.lastName}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Địa chỉ hiện tại:</strong> {user.address || "Chưa cập nhật"}
          </p>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Cập nhật địa chỉ</h3>

          <form onSubmit={handleSaveAddress} className="space-y-4">
            <select
              value={provinceCode}
              onChange={(e) => setProvinceCode(e.target.value)}
              className="w-full border px-4 py-2"
              required
            >
              <option value="">Chọn Tỉnh / Thành phố</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={districtCode}
              onChange={(e) => setDistrictCode(e.target.value)}
              className="w-full border px-4 py-2"
              required
            >
              <option value="">Chọn Quận / Huyện</option>
              {districts.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={wardCode}
              onChange={(e) => setWardCode(e.target.value)}
              className="w-full border px-4 py-2"
              required
            >
              <option value="">Chọn Phường / Xã</option>
              {wards.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Số nhà, tên đường..."
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
              className="w-full border px-4 py-2"
              required
            />

            <button className="bg-orange-600 text-white px-6 py-2">
              Lưu địa chỉ
            </button>
          </form>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Đổi mật khẩu</h3>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* MẬT KHẨU CŨ */}
            <div className="relative">
              <input
                type={showOld ? "text" : "password"}
                placeholder="Mật khẩu cũ"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full border px-4 py-2 pr-10"
                required
              />
              <span
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            {/* MẬT KHẨU MỚI */}
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                placeholder="Mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border px-4 py-2 pr-10"
                required
              />
              <span
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            {/* XÁC NHẬN MẬT KHẨU */}
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Xác nhận mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border px-4 py-2 pr-10"
                required
              />
              <span
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            <button className="bg-orange-600 text-white px-6 py-2">
              Đổi mật khẩu
            </button>
          </form>
        </div>

        <div className="border-t pt-6">
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-6 py-2"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </section>
  );
}
