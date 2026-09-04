import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import SiteLayout from "./components/SiteLayout";
import HomePage from "./pages/index.jsx";
import {
  AcademyPage,
  CoursePage,
  StorePage,
  ProductPage,
  CartPage,
  InnovationPage,
  AuthPage,
} from "./components/PublicPages";

const AboutPage = InnovationPage;
const ContactPage = InnovationPage;

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SiteLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/academy" element={<AcademyPage />} />
            <Route path="/course/:courseId" element={<CoursePage />} />
            <Route path="/store" element={<StorePage />} />
            <Route path="/product/:productId" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/innovation" element={<InnovationPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SiteLayout>
      </CartProvider>
    </AuthProvider>
  );
}
