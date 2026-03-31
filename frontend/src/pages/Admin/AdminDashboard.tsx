import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "../../stores/store";

type DashboardData = {
  users?: number;
  staffs?: number;
  products?: number;
  orders?: number;
  contacts?: number;
};

type DashboardResponse = {
  ok?: boolean;
  data?: DashboardData;
};

type ApiErrorBody = {
  message?: string;
  error?: string;
};

const EMPTY_STATS: DashboardData = {
  users: 0,
  staffs: 0,
  products: 0,
  orders: 0,
  contacts: 0,
};

export default function AdminDashboard() {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);

  const role = String(user?.role || "").toLowerCase();

  const [stats, setStats] = useState<DashboardData>(EMPTY_STATS);

  useEffect(() => {
    if (!token || role !== "admin") return;

    let cancelled = false;

    void (async () => {
      try {
        const res = await axios.get<DashboardResponse>(
          "http://localhost:5000/api/admin/stats",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!cancelled) {
          setStats(res.data?.data || EMPTY_STATS);
        }
      } catch (e: unknown) {
        const err = e as AxiosError<ApiErrorBody>;
        console.log(
          "STATS ERROR:",
          err.response?.status,
          err.response?.data?.message ?? err.message,
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, role]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Chào mừng trở lại 👋 {user?.firstName}
        </p>
      </div>

      {role === "admin" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg rounded-xl p-6">
            <p className="text-sm">Tổng User</p>
            <h3 className="text-3xl font-bold mt-2">{stats.users ?? 0}</h3>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg rounded-xl p-6">
            <p className="text-sm">Sản phẩm</p>
            <h3 className="text-3xl font-bold mt-2">{stats.products ?? 0}</h3>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg rounded-xl p-6">
            <p className="text-sm">Nhân viên</p>
            <h3 className="text-3xl font-bold mt-2">{stats.staffs ?? 0}</h3>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg rounded-xl p-6">
            <p className="text-sm">Đơn hàng</p>
            <h3 className="text-3xl font-bold mt-2">{stats.orders ?? 0}</h3>
          </div>

          <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg rounded-xl p-6">
            <p className="text-sm">Liên hệ</p>
            <h3 className="text-3xl font-bold mt-2">{stats.contacts ?? 0}</h3>
          </div>
        </div>
      )}

      {role === "staff" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg rounded-xl p-6">
            <p className="text-sm">Sản phẩm</p>
            <h3 className="text-3xl font-bold mt-2">--</h3>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg rounded-xl p-6">
            <p className="text-sm">Đơn hàng</p>
            <h3 className="text-3xl font-bold mt-2">--</h3>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg rounded-xl p-6">
            <p className="text-sm">Tin tức</p>
            <h3 className="text-3xl font-bold mt-2">--</h3>
          </div>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-xl p-8 h-96 flex items-center justify-center text-gray-400">
        Biểu đồ doanh thu (ChartJS / Recharts)
      </div>
    </div>
  );
}