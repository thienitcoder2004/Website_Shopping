import "./App.css";
import "quill/dist/quill.snow.css";
import { Suspense, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import { Home } from "./pages/User/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Loading from "./components/Loading";
import ShoppingCart from "./pages/ShoppingCart";
import ContactPage from "./pages/User/ContactPage";
import NewsPage from "./pages/User/NewsPage";
import ForgotPassword from "./pages/User/ForgotPassword";
import ResetPassword from "./pages/User/ResetPassword";
import Account from "./pages/Account";
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminLayout from "./layouts/AdminLayout";
import UsersPage from "./pages/Admin/UsersPage";
import CategoriesPage from "./pages/Admin/CategoriesPage";
import NewsPages from "./pages/Admin/NewsPages";
import NewsForm from "./components/NewsForm";
import NewsDetailPage from "./components/NewsDetailPage";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<MainLayout children />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/new" element={<NewsPage />} />
          <Route path="/new/:slug" element={<NewsDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/cart" element={<ShoppingCart />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route
            path="/account"
            element={
              <PrivateRoute>
                <Account />
              </PrivateRoute>
            }
          />
        </Route>

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UsersPage />}>
            Quản lý người dùng
          </Route>
          <Route path="employees" element={<div>Quản lý nhân viên</div>} />
          <Route path="products" element={<div>Quản lý sản phẩm</div>} />
          <Route path="categories" element={<CategoriesPage />}>
            Quản lý danh mục
          </Route>
          <Route path="orders" element={<div>Quản lý đơn hàng</div>} />
          <Route path="news" element={<NewsPages />}>
            Quản lý tin tức
          </Route>
          <Route path="/admin/news/create" element={<NewsForm />} />
          <Route path="/admin/news/edit/:id" element={<NewsForm />} />
          <Route path="contacts" element={<div>Quản lý liên hệ</div>} />
          <Route path="statistics" element={<div>Thống kê</div>} />
        </Route>
      </Routes>
    </Suspense>
  );
}
