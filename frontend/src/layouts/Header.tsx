import { useState } from "react";
import { Menu, X, Search, ShoppingBag, Phone } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../stores/authSlice";

import logo from "../assets/images/logo.png";
import type { RootState } from "../stores/store";

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-orange-500 border-b-2 border-orange-500 pb-1"
      : "hover:text-orange-500";

  const isPrefixActive = (keyword: string) =>
    location.pathname.includes(keyword)
      ? "text-orange-500 border-b-2 border-orange-500 pb-1"
      : "hover:text-orange-500";

  return (
    <header className="w-full shadow-sm">
      {/* ===== TOP BAR ===== */}
      <div className="bg-orange-500 text-white text-xs md:text-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 h-[32px]">
          <span className="hidden sm:block">
            Chào mừng bạn đến với Fashion Every Year
          </span>
          <div className="space-x-3">
            {user ? (
              <>
                <span>
                  Xin chào, {user.firstName} {user.lastName}
                </span>
                <span>|</span>
                <Link to="/account" className="hover:underline">
                  Tài khoản
                </Link>
                <span>|</span>
                <button
                  onClick={() => dispatch(logout())}
                  className="hover:underline"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:underline">
                  Đăng nhập
                </Link>
                <span>|</span>
                <Link to="/register" className="hover:underline">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===== MAIN HEADER ===== */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 h-[80px] md:h-[110px] flex items-center justify-between">
          <button className="lg:hidden" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="hidden md:flex items-center gap-2 text-gray-600">
            <Phone size={20} />
            <div>
              <p className="text-sm">Hotline:</p>
              <p className="text-orange-500 font-semibold">1900 6750</p>
            </div>
          </div>

          <div className="text-center">
            <Link to="/">
              <img
                src={logo}
                alt="Logo"
                className="h-10 md:h-14 object-contain"
              />
            </Link>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden md:block relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="border-b outline-none pr-8 py-1 text-sm"
              />
              <Search
                size={18}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>

            <Link to="/cart" className="relative">
              <ShoppingBag size={22} />
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                0
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ===== NAVBAR PC ===== */}
      <nav className="hidden lg:block border-t border-gray-200 relative z-50">
        <div className="max-w-7xl mx-auto px-4 h-[55px] flex items-center justify-center gap-10 text-sm font-medium">
          <Link to="/" className={isActive("/")}>
            TRANG CHỦ
          </Link>

          {/* NAM */}
          <div className="group relative">
            <Link to="/category/nam" className={isPrefixActive("nam")}>
              NAM
            </Link>

            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[900px] bg-white shadow-lg p-8 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
              <div className="grid grid-cols-4 gap-8 text-sm">
                <div>
                  <h4 className="font-semibold mb-3">Áo sơ mi</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>Áo sơ mi dài tay</li>
                    <li>Áo sơ mi cộc tay</li>
                    <li>Áo unisex</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Quần nam</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>Quần jean</li>
                    <li>Quần âu</li>
                    <li>Quần kaki</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Vest</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>Phong cách sang trọng</li>
                    <li>Phong cách công sở</li>
                    <li>Phong cách casual</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Áo phông</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>Basic</li>
                    <li>Oversize</li>
                    <li>Graphic</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* NỮ */}
          <div className="group relative">
            <Link to="/category/nu" className={isPrefixActive("nu")}>
              NỮ
            </Link>

            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[900px] bg-white shadow-lg p-8 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
              <div className="grid grid-cols-4 gap-8 text-sm">
                <div>
                  <h4 className="font-semibold mb-3">Váy</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>Váy công sở</li>
                    <li>Váy dự tiệc</li>
                    <li>Váy maxi</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Áo nữ</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>Áo sơ mi</li>
                    <li>Áo croptop</li>
                    <li>Áo len</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Quần nữ</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>Quần jean</li>
                    <li>Quần short</li>
                    <li>Quần culottes</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Phụ kiện</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>Túi xách</li>
                    <li>Giày</li>
                    <li>Kính</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <Link to="/category/phu-kien" className={isPrefixActive("phu-kien")}>
            PHỤ KIỆN
          </Link>

          <Link to="/sale" className={isActive("/sale")}>
            KHUYẾN MẠI
          </Link>

          <Link to="/new" className={isActive("/new")}>
            TIN TỨC
          </Link>

          <Link to="/contact" className={isActive("/contact")}>
            LIÊN HỆ
          </Link>
        </div>
      </nav>

      {/* ===== MOBILE MENU ===== */}
      {open && (
        <div className="lg:hidden bg-white border-t shadow-md">
          <div className="flex flex-col p-4 gap-4 text-sm font-medium">
            <Link to="/" onClick={() => setOpen(false)}>
              TRANG CHỦ
            </Link>
            <Link to="/category/nam" onClick={() => setOpen(false)}>
              NAM
            </Link>
            <Link to="/category/nu" onClick={() => setOpen(false)}>
              NỮ
            </Link>
            <Link to="/category/phu-kien" onClick={() => setOpen(false)}>
              PHỤ KIỆN
            </Link>
            <Link to="/sale" onClick={() => setOpen(false)}>
              KHUYẾN MẠI
            </Link>
            <Link to="/new" onClick={() => setOpen(false)}>
              TIN TỨC
            </Link>
            <Link to="/contact" onClick={() => setOpen(false)}>
              LIÊN HỆ
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
