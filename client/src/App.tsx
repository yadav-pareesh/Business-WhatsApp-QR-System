import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Public Pages
import { HomePage } from './pages/landing/HomePage';
import { FeaturesPage } from './pages/landing/FeaturesPage';
import { PricingPage } from './pages/landing/PricingPage';
import { BusinessTypesPage } from './pages/landing/BusinessTypesPage';
import { DemoPage } from './pages/demo/DemoPage';
import { FAQPage } from './pages/landing/FAQPage';
import { ContactPage } from './pages/landing/ContactPage';
import { PrivacyPage, TermsPage } from './pages/landing/LegalPages';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { OnboardWizardPage } from './pages/onboarding/OnboardWizardPage';

// Public Storefront (QR Code Scan Destination)
import { PublicStorePage } from './pages/store/PublicStorePage';

// Dashboard Pages
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardOverviewPage } from './pages/dashboard/DashboardOverviewPage';
import { CatalogPage } from './pages/dashboard/CatalogPage';
import { CategoriesPage } from './pages/dashboard/CategoriesPage';
import { OrdersPage } from './pages/dashboard/OrdersPage';
import { QRManagementPage } from './pages/dashboard/QRManagementPage';
import { AnalyticsPage } from './pages/dashboard/AnalyticsPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';
import { BillingPage } from './pages/dashboard/BillingPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export function App() {
  const { init } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Website */}
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/business-types" element={<BusinessTypesPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Guided Merchant Onboarding */}
        <Route
          path="/onboard"
          element={
            <ProtectedRoute>
              <OnboardWizardPage />
            </ProtectedRoute>
          }
        />

        {/* Customer Mobile Ordering Storefront (Scanned from QR) */}
        <Route path="/business/:businessSlug" element={<PublicStorePage />} />
        <Route path="/b/:businessSlug" element={<PublicStorePage />} />

        {/* Merchant Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverviewPage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="qr" element={<QRManagementPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="billing" element={<BillingPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
