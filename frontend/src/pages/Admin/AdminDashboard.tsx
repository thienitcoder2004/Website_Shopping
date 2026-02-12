import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import type { RootState } from "../../stores/store";

export default function AdminDashboard() {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);

  const [stats, setStats] = useState({
    totalUsers: 0,
  });

  const fetchStats = async () => {
    const res = await axios.get("http://localhost:5000/api/admin/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setStats(res.data);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Chào mừng trở lại 👋 {user?.firstName}
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg rounded-xl p-6">
          <p className="text-sm">Tổng User</p>
          <h3 className="text-3xl font-bold mt-2">{stats.totalUsers}</h3>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg rounded-xl p-6">
          <p className="text-sm">Sản phẩm</p>
          <h3 className="text-3xl font-bold mt-2">84</h3>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg rounded-xl p-6">
          <p className="text-sm">Đơn hàng</p>
          <h3 className="text-3xl font-bold mt-2">35</h3>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg rounded-xl p-6">
          <p className="text-sm">Doanh thu</p>
          <h3 className="text-3xl font-bold mt-2">$12,500</h3>
        </div>
      </div>

      {/* CHART */}
      <div className="bg-white shadow-lg rounded-xl p-8 h-96 flex items-center justify-center text-gray-400">
        Biểu đồ doanh thu (ChartJS / Recharts)
      </div>
    </div>
  );
}
