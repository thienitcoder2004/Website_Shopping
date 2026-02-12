import { Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Package,
  Layers,
  ShoppingCart,
  BarChart3,
  LogOut,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../stores/authSlice";
import { useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const menu = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/admin" },
    { name: "Người dùng", icon: <Users size={18} />, path: "/admin/users" },
    {
      name: "Nhân viên",
      icon: <UserCog size={18} />,
      path: "/admin/employees",
    },
    { name: "Sản phẩm", icon: <Package size={18} />, path: "/admin/products" },
    { name: "Danh mục", icon: <Layers size={18} />, path: "/admin/categories" },
    {
      name: "Đơn hàng",
      icon: <ShoppingCart size={18} />,
      path: "/admin/orders",
    },
    {
      name: "Thống kê",
      icon: <BarChart3 size={18} />,
      path: "/admin/statistics",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 text-xl font-bold border-b">ADMIN PANEL</div>

        <nav className="flex-1 p-4 space-y-3">
          {menu.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-3 p-3 rounded hover:bg-orange-100 cursor-pointer transition"
            >
              {item.icon}
              <span>{item.name}</span>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={() => {
              dispatch(logout());
              navigate("/");
            }}
            className="flex items-center gap-2 text-red-500 hover:text-red-700"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* TOPBAR */}
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h2 className="font-semibold text-lg">Dashboard</h2>
          <div className="text-sm text-gray-500">Chào mừng trở lại 👋</div>
        </header>

        {/* CONTENT */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
