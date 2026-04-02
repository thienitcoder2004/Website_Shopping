import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "../../stores/store";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

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
  const [revenue, setRevenue] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  // 📊 Lấy stats
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

  // 📈 Lấy doanh thu + top sản phẩm
  useEffect(() => {
    if (!token || role !== "admin") return;

    axios
      .get("http://localhost:5000/api/statistics/revenue?type=month")
      .then((res) => setRevenue(res.data));

    axios
      .get("http://localhost:5000/api/statistics/top-products")
      .then((res) => setTopProducts(res.data));
  }, [token, role]);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Chào mừng trở lại 👋 {user?.firstName}
        </p>
      </div>

      {/* STATS */}
      {role === "admin" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
          <Card
            title="Tổng User"
            value={stats.users}
            color="from-purple-500 to-indigo-500"
          />
          <Card
            title="Sản phẩm"
            value={stats.products}
            color="from-blue-500 to-cyan-500"
          />
          <Card
            title="Nhân viên"
            value={stats.staffs}
            color="from-green-500 to-emerald-500"
          />
          <Card
            title="Đơn hàng"
            value={stats.orders}
            color="from-orange-500 to-red-500"
          />
          <Card
            title="Liên hệ"
            value={stats.contacts}
            color="from-pink-500 to-rose-500"
          />
        </div>
      )}

      {/* 📊 CHART */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h3 className="mb-4 font-semibold">📊 Doanh thu theo tháng</h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenue}>
            <CartesianGrid strokeDasharray="3 3" />

            {/* X */}
            <XAxis dataKey="_id" />

            {/* 🔥 Y (MỐC TIỀN) */}
            <YAxis
              ticks={[0, 2000000, 4000000, 6000000, 8000000, 10000000]}
              tickFormatter={(value) =>
                value === 0 ? "0đ" : `${value / 1000000}tr`
              }
            />

            {/* Tooltip */}
            <Tooltip
              formatter={(value: number) =>
                `${value.toLocaleString("vi-VN")} VNĐ`
              }
            />

            <Bar dataKey="totalRevenue" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🔥 TOP PRODUCT */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h3 className="mb-4 font-semibold">🔥 Top 5 sản phẩm bán chạy</h3>

        <ul className="space-y-2">
          {topProducts.map((p: any, index: number) => (
            <li key={p._id} className="flex justify-between border-b pb-2">
              <span>
                {index + 1}. {p.name}
              </span>
              <span className="font-semibold text-blue-600">
                {p.sold} đã bán
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* 🎨 CARD COMPONENT */
function Card({
  title,
  value,
  color,
}: {
  title: string;
  value?: number;
  color: string;
}) {
  return (
    <div
      className={`bg-gradient-to-r ${color} text-white shadow-lg rounded-xl p-6`}
    >
      <p className="text-sm">{title}</p>
      <h3 className="text-3xl font-bold mt-2">{value ?? 0}</h3>
    </div>
  );
}
