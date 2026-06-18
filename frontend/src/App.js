import React from 'react';
import { Routes, Route } from 'react-router-dom';
import '@/App.css';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import CataloguePage from '@/pages/CataloguePage';
import SpecialOffersPage from '@/pages/SpecialOffersPage';
import HowItWorksPage from '@/pages/HowItWorksPage';
import PlansPage from '@/pages/PlansPage';
import AboutPage from '@/pages/AboutPage';
import BlogPage from '@/pages/BlogPage';
import BlogPostPage from '@/pages/BlogPostPage';
import ContactPage from '@/pages/ContactPage';
import FAQPage from '@/pages/FAQPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { FoodPage, HygienePage, VitaminsPage, ToysPage, InnovationTechPage, ServicesPage } from '@/pages/SubPages';
import { PrivacyPage, TermsPage, DeliveryPage, RefundPage } from '@/pages/LegalPages';

import AdminLogin from '@/pages/admin/AdminLogin';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminProductsImport from '@/pages/admin/AdminProductsImport';
import AdminProductForm from '@/pages/admin/AdminProductForm';
import AdminPlans from '@/pages/admin/AdminPlans';
import AdminPlanForm from '@/pages/admin/AdminPlanForm';
import AdminBlog from '@/pages/admin/AdminBlog';
import AdminBlogForm from '@/pages/admin/AdminBlogForm';
import AdminOffers from '@/pages/admin/AdminOffers';
import AdminOfferForm from '@/pages/admin/AdminOfferForm';
import { AdminLeads, AdminContacts, AdminCabinetCustomers } from '@/pages/admin/AdminViewers';

// Customer Cabinet (merged from standalone MVP) — mounts under /cabinet/*
import CabinetApp from '@/cabinet/CabinetApp';

function CabinetMount() {
  return (
    <div className="cabinet-scope" data-testid="cabinet-scope">
      <CabinetApp />
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Customer Cabinet (logged-in customer experience) */}
      <Route path="/cabinet/*" element={<CabinetMount />} />

      {/* Public marketing site */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />

        <Route path="/catalogue" element={<CataloguePage />} />
        <Route path="/catalogue/food" element={<FoodPage />} />
        <Route path="/catalogue/hygiene" element={<HygienePage />} />
        <Route path="/catalogue/vitamins" element={<VitaminsPage />} />

        <Route path="/special-offers" element={<SpecialOffersPage />} />
        <Route path="/special-offers/toys-accessories" element={<ToysPage />} />
        <Route path="/special-offers/innovation-tech" element={<InnovationTechPage />} />
        <Route path="/special-offers/services" element={<ServicesPage />} />

        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />

        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/delivery-policy" element={<DeliveryPage />} />
        <Route path="/refund-policy" element={<RefundPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin panel */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/import" element={<AdminProductsImport />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/:id" element={<AdminProductForm />} />
        <Route path="plans" element={<AdminPlans />} />
        <Route path="plans/new" element={<AdminPlanForm />} />
        <Route path="plans/:id" element={<AdminPlanForm />} />
        <Route path="blog-posts" element={<AdminBlog />} />
        <Route path="blog-posts/new" element={<AdminBlogForm />} />
        <Route path="blog-posts/:id" element={<AdminBlogForm />} />
        <Route path="special-offers" element={<AdminOffers />} />
        <Route path="special-offers/new" element={<AdminOfferForm />} />
        <Route path="special-offers/:id" element={<AdminOfferForm />} />
        <Route path="cabinet-customers" element={<AdminCabinetCustomers />} />
        <Route path="leads" element={<AdminLeads />} />
        <Route path="contact-inquiries" element={<AdminContacts />} />
      </Route>
    </Routes>
  );
}

export default App;
