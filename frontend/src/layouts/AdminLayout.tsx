import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Package,
  Layers,
  ShoppingCart,
  BarChart3,
  LogOut,
  Newspaper,
  PhoneCall,
  TicketPercent,
  BadgePercent,
  Boxes,
  MessageSquare,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../stores/authSlice";
import type { AppDispatch, RootState } from "../stores/store";
import NotificationBell from "../components/common/NotificationBell";

type MenuRole = "admin" | "staff";

type MenuItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
  roles: MenuRole[];
};

export default function AdminLayout() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector((state: RootState) => state.auth.user);
  const role = String(user?.role || "").toLowerCase() as MenuRole;

  const menu: MenuItem[] = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      path: "/admin",
      roles: ["admin", "staff"],
    },
    {
      name: "Người dùng",
      icon: <Users size={18} />,
      path: "/admin/users",
      roles: ["admin"],
    },
    {
      name: "Nhân viên",
      icon: <UserCog size={18} />,
      path: "/admin/staffs",
      roles: ["admin"],
    },
    {
      name: "Sản phẩm",
      icon: <Package size={18} />,
      path: "/admin/products",
      roles: ["admin", "staff"],
    },
    {
      name: "Đánh giá",
      icon: <MessageSquare size={18} />,
      path: "/admin/reviews",
      roles: ["admin", "staff"],
    },
    {
      name: "Danh mục",
      icon: <Layers size={18} />,
      path: "/admin/categories",
      roles: ["admin", "staff"],
    },
    {
      name: "Thương hiệu",
      icon: <BadgePercent size={18} />,
      path: "/admin/brands",
      roles: ["admin", "staff"],
    },
    {
      name: "Kho hàng",
      icon: <Boxes size={18} />,
      path: "/admin/inventory",
      roles: ["admin", "staff"],
    },
    {
      name: "Đơn hàng",
      icon: <ShoppingCart size={18} />,
      path: "/admin/orders",
      roles: ["admin", "staff"],
    },
    {
      name: "Tin tức",
      icon: <Newspaper size={18} />,
      path: "/admin/news",
      roles: ["admin", "staff"],
    },
    {
      name: "Liên hệ",
      icon: <PhoneCall size={18} />,
      path: "/admin/contacts",
      roles: ["admin", "staff"],
    },
    {
      name: "Giảm giá",
      icon: <TicketPercent size={18} />,
      path: "/admin/coupon",
      roles: ["admin"],
    },
    {
      name: "Thống kê",
      icon: <BarChart3 size={18} />,
      path: "/admin/statistics",
      roles: ["admin"],
    },
  ];

  const filteredMenu = menu.filter((item) => item.roles.includes(role));

  const currentMenu =
    filteredMenu.find((item) =>
      item.path === "/admin"
        ? location.pathname === "/admin"
        : location.pathname.startsWith(item.path),
    ) || filteredMenu[0];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const displayName =
    [user?.lastName, user?.firstName].filter(Boolean).join(" ").trim() ||
    user?.firstName ||
    user?.lastName ||
    "bạn";

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="flex w-64 flex-col bg-white shadow-lg">
        <div className="border-b p-6 text-xl font-bold text-orange-600">
          QUẢN TRỊ HỆ THỐNG
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {filteredMenu.map((item) => {
            const isActive =
              item.path === "/admin"
                ? location.pathname === "/admin"
                : location.pathname.startsWith(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition ${
                  isActive
                    ? "bg-orange-500 text-white shadow"
                    : "text-gray-700 hover:bg-orange-100"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 transition hover:text-red-700"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between bg-white px-6 py-4 shadow">
          <h2 className="text-lg font-semibold">
            {currentMenu?.name || "Quản trị hệ thống"}
          </h2>

          <div className="text-sm text-gray-500 flex">
            <div className="ml-5">
              <NotificationBell />
            </div>
            Xin chào,{" "}
            <span className="font-medium text-slate-700">{displayName}</span> (
            {role === "admin" ? "Admin" : "Nhân viên"})
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
