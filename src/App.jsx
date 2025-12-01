import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider } from '@/components/marketing/auth-context';
import { MarketingLayout } from '@/components/marketing/marketing-layout';
import { AppShell } from '@/components/layout/app-shell';
import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import AboutUsPage from '@/pages/about-us';
import AssessmentsPage from '@/pages/assessments';
import CoursesPage from '@/pages/catalog';
import CourseDetailPage from '@/pages/course-detail';
import CheckoutPage from '@/pages/checkout';
import CertificatesPage from '@/pages/certificates';
import ContactUsPage from '@/pages/contact-us';
import CoursesAdminPage from '@/pages/courses';
import CourseCategoriesPage from '@/pages/course-categories';
import DashboardPage from '@/pages/dashboard';
import EnrollPage from '@/pages/enroll';
import EnrollmentsPage from '@/pages/enrollments';
import AccountVerifyPage from '@/pages/account/verify';
import GetStartedPage from '@/pages/get-started';
import AdminLoginPage from '@/pages/admin-login';
import HomePage from '@/pages/home';
import LessonsPage from '@/pages/lessons';
import LoginPage from '@/pages/login';
import PrivacyPage from '@/pages/privacy';
import ProgressPage from '@/pages/progress';
import PromotionsPage from '@/pages/promotions';
import MarketingPromotionsPage from '@/pages/marketing-promotions';
import AffiliateProgramPage from '@/pages/affiliate-program';
import ReferralsPage from '@/pages/referrals';
import RegisterPage from '@/pages/register';
import TermsPage from '@/pages/terms';
import UsersPage from '@/pages/users';
import CustomersPage from '@/pages/customers';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Routes>
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:courseId" element={<CourseDetailPage />} />
              <Route path="/about-us" element={<AboutUsPage />} />
              <Route path="/contact-us" element={<ContactUsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/checkout/:courseId" element={<CheckoutPage />} />
              <Route path="/enroll/:courseId" element={<EnrollPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/promotions" element={<MarketingPromotionsPage />} />
              <Route path="/affiliate-program" element={<AffiliateProgramPage />} />
              <Route path="/get-started" element={<GetStartedPage />} />
              <Route path="/account/verify" element={<AccountVerifyPage />} />
              <Route path="/accept-invite" element={<AccountVerifyPage />} />
            </Route>

            <Route path="/admin/login" element={<AdminLoginPage />} />

            <Route path="/admin" element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="courses" element={<CoursesAdminPage />} />
              <Route path="course-categories" element={<CourseCategoriesPage />} />
              <Route path="lessons" element={<LessonsPage />} />
              <Route path="enrollments" element={<EnrollmentsPage />} />
              <Route path="progress" element={<ProgressPage />} />
              <Route path="assessments" element={<AssessmentsPage />} />
              <Route path="certificates" element={<CertificatesPage />} />
              <Route path="promotions" element={<PromotionsPage />} />
              <Route path="referrals" element={<ReferralsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;







