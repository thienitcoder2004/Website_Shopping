import "./App.css";
import "quill/dist/quill.snow.css";
import { Suspense, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

import { Home } from "./pages/User/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";

import Loading from "./components/common/Loading";
import ScrollToTop from "./components/common/ScrollToTop";

import ShoppingCart from "./pages/User/Cart/ShoppingCart";
import CheckoutPage from "./pages/User/Cart/CheckoutPage";
import PaymentMomoResult from "./pages/User/Cart/PaymentMomoResult";

import ContactPage from "./pages/User/Content/ContactPage";

import NewsPage from "./pages/User/News/NewsPage";
import NewsDetailPage from "./pages/User/News/NewsDetailPage";

import Account from "./pages/User/Account";
import ProductList from "./pages/User/Product/ProductList";
import ProductDetail from "./pages/User/Product";
import OrderHistoryPage from "./pages/User/Orders/OrderHistoryPage";
import OrderDetailPage from "./pages/User/Orders/OrderDetailPage";

import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";
import RoleRoute from "./routes/RoleRoute";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import UsersPage from "./pages/Admin/UsersPage";
import StaffsPage from "./pages/Admin/StaffsPage";
import CategoriesPage from "./pages/Admin/CategoriesPage";
import NewsPages from "./pages/Admin/NewsPages";
import NewsForm from "./components/news/NewsForm";
import ContactsPage from "./pages/Admin/ContactsPage";
import CouponsPage from "./pages/Admin/CouponsPage";
import BrandsPage from "./pages/Admin/BrandsPage";
import Inventory from "./pages/Admin/Inventory";
import ProductListAdmin from "./pages/Admin/ProductList";
import ProductForm from "./pages/Admin/ProductForm";
import OrdersPage from "./pages/Admin/OrdersPage";
import ReviewsPage from "./pages/Admin/ReviewsPage";
import StatisticsPage from "./pages/Admin/StatisticsPage";
import SalePage from "./pages/User/Sales/SalePage";

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
      <ScrollToTop />

      <Routes>
        <Route element={<MainLayout children />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/new" element={<NewsPage />} />
          <Route path="/new/:slug" element={<NewsDetailPage />} />

          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/product/:gender" element={<ProductList />} />
          <Route path="/search" element={<ProductList />} />

          <Route path="/contact" element={<ContactPage />} />
          <Route path="/sale" element={<SalePage />} />
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

          <Route
            path="/checkout"
            element={
              <PrivateRoute>
                <CheckoutPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/payment/momo"
            element={
              <PrivateRoute>
                <PaymentMomoResult />
              </PrivateRoute>
            }
          />

          <Route
            path="/account/orders"
            element={
              <PrivateRoute>
                <OrderHistoryPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/account/orders/:id"
            element={
              <PrivateRoute>
                <OrderDetailPage />
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

          <Route
            path="users"
            element={
              <RoleRoute allow={["admin"]}>
                <UsersPage />
              </RoleRoute>
            }
          />

          <Route
            path="staffs"
            element={
              <RoleRoute allow={["admin"]}>
                <StaffsPage />
              </RoleRoute>
            }
          />

          <Route
            path="coupon"
            element={
              <RoleRoute allow={["admin"]}>
                <CouponsPage />
              </RoleRoute>
            }
          />

          <Route
            path="statistics"
            element={
              <RoleRoute allow={["admin"]}>
                <StatisticsPage />
              </RoleRoute>
            }
          />

          <Route
            path="products"
            element={
              <RoleRoute allow={["admin", "staff"]}>
                <ProductListAdmin />
              </RoleRoute>
            }
          />

          <Route
            path="products/new"
            element={
              <RoleRoute allow={["admin", "staff"]}>
                <ProductForm />
              </RoleRoute>
            }
          />

          <Route
            path="products/:id"
            element={
              <RoleRoute allow={["admin", "staff"]}>
                <ProductForm />
              </RoleRoute>
            }
          />

          <Route
            path="reviews"
            element={
              <RoleRoute allow={["admin", "staff"]}>
                <ReviewsPage />
              </RoleRoute>
            }
          />

          <Route
            path="inventory"
            element={
              <RoleRoute allow={["admin", "staff"]}>
                <Inventory />
              </RoleRoute>
            }
          />

          <Route
            path="categories"
            element={
              <RoleRoute allow={["admin", "staff"]}>
                <CategoriesPage />
              </RoleRoute>
            }
          />

          <Route
            path="orders"
            element={
              <RoleRoute allow={["admin", "staff"]}>
                <OrdersPage />
              </RoleRoute>
            }
          />

          <Route
            path="news"
            element={
              <RoleRoute allow={["admin", "staff"]}>
                <NewsPages />
              </RoleRoute>
            }
          />

          <Route
            path="news/create"
            element={
              <RoleRoute allow={["admin", "staff"]}>
                <NewsForm />
              </RoleRoute>
            }
          />

          <Route
            path="news/edit/:id"
            element={
              <RoleRoute allow={["admin", "staff"]}>
                <NewsForm />
              </RoleRoute>
            }
          />

          <Route
            path="contacts"
            element={
              <RoleRoute allow={["admin", "staff"]}>
                <ContactsPage />
              </RoleRoute>
            }
          />

          <Route
            path="brands"
            element={
              <RoleRoute allow={["admin", "staff"]}>
                <BrandsPage />
              </RoleRoute>
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
}
