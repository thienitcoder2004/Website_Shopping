import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function StatisticsPage() {
  const [data, setData] = useState<any[]>([]);
  const [type, setType] = useState("day");

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/statistics/revenue?type=${type}`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setData(res.data);
        } else {
          setData(res.data?.data || []);
        }
      })
      .catch(() => setData([]));
  }, [type]);

  const totalRevenue = data.reduce(
    (sum, item) => sum + (item.totalRevenue || 0),
    0,
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Thống kê doanh thu</h1>

        <select
          className="rounded-xl border px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="day">Theo ngày</option>
          <option value="month">Theo tháng</option>
          <option value="year">Theo năm</option>
        </select>
      </div>

      <div className="mb-6 rounded-2xl bg-white p-5 shadow">
        <p className="text-gray-500">Tổng doanh thu</p>
        <h2 className="text-2xl font-bold text-green-600">
          {totalRevenue.toLocaleString("vi-VN")} VNĐ
        </h2>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis
                tickFormatter={(v) =>
                  v === 0 ? "0đ" : `${(v / 1000000).toFixed(1)}tr`
                }
              />
              <Tooltip
                formatter={(v: number) => `${v.toLocaleString("vi-VN")} VNĐ`}
              />
              <Line
                type="monotone"
                dataKey="totalRevenue"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 py-10">Không có dữ liệu</p>
        )}
      </div>
    </div>
  );
}
