import { Route, Routes } from 'react-router-dom'
import { AdminLayout } from '@/layouts/AdminLayout.tsx'
import { PublicLayout } from '@/layouts/PublicLayout.tsx'
import { AdminAccommodationsPage } from '@/pages/admin/AdminAccommodationsPage.tsx'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage.tsx'
import { AdminDestinationsPage } from '@/pages/admin/AdminDestinationsPage.tsx'
import { AdminGalleryPage } from '@/pages/admin/AdminGalleryPage.tsx'
import { AdminInquiriesPage } from '@/pages/admin/AdminInquiriesPage.tsx'
import { AdminNotFoundPage } from '@/pages/admin/AdminNotFoundPage.tsx'
import { AdminReviewsPage } from '@/pages/admin/AdminReviewsPage.tsx'
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage.tsx'
import { AdminToursPage } from '@/pages/admin/AdminToursPage.tsx'
import { AdminVehiclesPage } from '@/pages/admin/AdminVehiclesPage.tsx'
import { AdminWhyTravelersPage } from '@/pages/admin/AdminWhyTravelersPage.tsx'
import { AdminLoginPage } from '@/pages/auth/AdminLoginPage.tsx'
import { AboutPage } from '@/pages/public/AboutPage.tsx'
import { ContactPage } from '@/pages/public/ContactPage.tsx'
import { DestinationDetailPage } from '@/pages/public/DestinationDetailPage.tsx'
import { DestinationsPage } from '@/pages/public/DestinationsPage.tsx'
import { GalleryPage } from '@/pages/public/GalleryPage.tsx'
import { HomePage } from '@/pages/public/HomePage.tsx'
import { InquiryPage } from '@/pages/public/InquiryPage.tsx'
import { NotFoundPage } from '@/pages/public/NotFoundPage.tsx'
import { PrivacyPage } from '@/pages/public/PrivacyPage.tsx'
import { ReviewsPage } from '@/pages/public/ReviewsPage.tsx'
import { TermsPage } from '@/pages/public/TermsPage.tsx'
import { TourDetailPage } from '@/pages/public/TourDetailPage.tsx'
import { ToursPage } from '@/pages/public/ToursPage.tsx'
import { VehiclesPage } from '@/pages/public/VehiclesPage.tsx'
import { WriteAReviewPage } from '@/pages/public/WriteAReviewPage.tsx'
import { GuestRoute } from '@/routes/GuestRoute.tsx'
import { ProtectedRoute } from '@/routes/ProtectedRoute.tsx'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/admin/login" element={<AdminLoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="tours" element={<AdminToursPage />} />
          <Route path="destinations" element={<AdminDestinationsPage />} />
          <Route path="accommodations" element={<AdminAccommodationsPage />} />
          <Route path="why-travelers" element={<AdminWhyTravelersPage />} />
          <Route path="vehicles" element={<AdminVehiclesPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="gallery" element={<AdminGalleryPage />} />
          <Route path="inquiries" element={<AdminInquiriesPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="*" element={<AdminNotFoundPage />} />
        </Route>
      </Route>

      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="tours">
          <Route index element={<ToursPage />} />
          <Route path=":slug" element={<TourDetailPage />} />
        </Route>
        <Route path="destinations">
          <Route index element={<DestinationsPage />} />
          <Route path=":slug" element={<DestinationDetailPage />} />
        </Route>
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="write-a-review" element={<WriteAReviewPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="inquiry" element={<InquiryPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
