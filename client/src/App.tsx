import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './components/PublicLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GuestRoute } from './components/GuestRoute';
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { LifePacksPage } from './pages/LifePacksPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { DonatePage } from './pages/DonatePage';
import { JoinPage } from './pages/JoinPage';
import { ContactPage } from './pages/ContactPage';
import { TransparencyPage } from './pages/TransparencyPage';
import { UpdatesPage } from './pages/UpdatesPage';
import { UpdateDetailPage } from './pages/UpdateDetailPage';
import { FinancialReportsPage } from './pages/FinancialReportsPage';
import { FinancialReportDetailPage } from './pages/FinancialReportDetailPage';
import { ResearchPublicationsPage } from './pages/ResearchPublicationsPage';
import { ResearchPublicationDetailPage } from './pages/ResearchPublicationDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminAccountingPage } from './pages/admin/AdminAccountingPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminMessagesPage } from './pages/admin/AdminMessagesPage';
import { AdminDonationsPage } from './pages/admin/AdminDonationsPage';
import { AdminSubscribersPage } from './pages/admin/AdminSubscribersPage';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage';
import { AdminUpdatesPage } from './pages/admin/AdminUpdatesPage';
import { AdminFinancialReportsPage } from './pages/admin/AdminFinancialReportsPage';
import { AdminResearchPublicationsPage } from './pages/admin/AdminResearchPublicationsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="life-packs" element={<LifePacksPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="donate" element={<DonatePage />} />
              <Route path="join" element={<JoinPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="transparency" element={<TransparencyPage />} />
              <Route path="updates" element={<UpdatesPage />} />
              <Route path="updates/:slug" element={<UpdateDetailPage />} />
              <Route path="financial-reports" element={<FinancialReportsPage />} />
              <Route path="financial-reports/:slug" element={<FinancialReportDetailPage />} />
              <Route path="research" element={<ResearchPublicationsPage />} />
              <Route path="research/:slug" element={<ResearchPublicationDetailPage />} />
            </Route>

            <Route path="login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

            <Route path="admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="admin/accounting" element={<ProtectedRoute><AdminAccountingPage /></ProtectedRoute>} />
            <Route path="admin/users" element={<ProtectedRoute><AdminUsersPage /></ProtectedRoute>} />
            <Route path="admin/messages" element={<ProtectedRoute><AdminMessagesPage /></ProtectedRoute>} />
            <Route path="admin/donations" element={<ProtectedRoute><AdminDonationsPage /></ProtectedRoute>} />
            <Route path="admin/subscribers" element={<ProtectedRoute><AdminSubscribersPage /></ProtectedRoute>} />
            <Route path="admin/projects" element={<ProtectedRoute><AdminProjectsPage /></ProtectedRoute>} />
            <Route path="admin/updates" element={<ProtectedRoute><AdminUpdatesPage /></ProtectedRoute>} />
            <Route path="admin/financial-reports" element={<ProtectedRoute><AdminFinancialReportsPage /></ProtectedRoute>} />
            <Route path="admin/research-publications" element={<ProtectedRoute><AdminResearchPublicationsPage /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
