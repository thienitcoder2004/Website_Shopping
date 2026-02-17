import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios, { AxiosError } from "axios";
import type { RootState } from "../../stores/store";

type AdminStats = {
  totalUsers: number;
  totalActiveUsers: number;
  totalProducts: number;
};

type ApiErrorBody = {
  message?: string;
  error?: string;
};

const EMPTY_STATS: AdminStats = {
  totalUsers: 0,
  totalActiveUsers: 0,
  totalProducts: 0,
};

export default function AdminDashboard() {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);

  const [stats, setStats] = useState<AdminStats>(EMPTY_STATS);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    void (async () => {
      try {
        const res = await axios.get<AdminStats>(
          "http://localhost:5000/api/admin/stats",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!cancelled) setStats(res.data);
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
  }, [token]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Chào mừng trở lại 👋 {user?.firstName}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg rounded-xl p-6">
          <p className="text-sm">Tổng User</p>
          <h3 className="text-3xl font-bold mt-2">{stats.totalUsers}</h3>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg rounded-xl p-6">
          <p className="text-sm">Sản phẩm</p>
          <h3 className="text-3xl font-bold mt-2">{stats.totalProducts}</h3>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg rounded-xl p-6">
          <p className="text-sm">User đang hoạt động</p>
          <h3 className="text-3xl font-bold mt-2">{stats.totalActiveUsers}</h3>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg rounded-xl p-6">
          <p className="text-sm">Doanh thu</p>
          <h3 className="text-3xl font-bold mt-2">$12,500</h3>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-8 h-96 flex items-center justify-center text-gray-400">
        Biểu đồ doanh thu (ChartJS / Recharts)
      </div>
    </div>
  );
}
