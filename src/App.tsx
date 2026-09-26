/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import MainHome from './pages/MainHome';
import BranchLayout from './components/BranchLayout';
import KollamHome from './pages/kollam/KollamHome';
import KollamMenu from './pages/kollam/KollamMenu';
import KollamCruise from './pages/kollam/KollamCruise';
import KollamCelebrations from './pages/kollam/KollamCelebrations';
import KollamGallery from './pages/kollam/KollamGallery';

import AlappuzhaHome from './pages/alappuzha/AlappuzhaHome';
import AlappuzhaMenu from './pages/alappuzha/AlappuzhaMenu';

import VarkalaHome from './pages/varkala/VarkalaHome';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import BranchManager from './pages/admin/BranchManager';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<MainHome />} />
        
        {/* Kollam Branch */}
        <Route path="/kollam" element={<BranchLayout branchSlug="kollam" />}>
          <Route index element={<KollamHome />} />
          <Route path="menu" element={<KollamMenu />} />
          <Route path="cruise" element={<KollamCruise />} />
          <Route path="celebrations" element={<KollamCelebrations />} />
          <Route path="decor" element={<Navigate to="/kollam/celebrations" replace />} />
          <Route path="decoration" element={<Navigate to="/kollam/celebrations" replace />} />
          <Route path="decorations" element={<Navigate to="/kollam/celebrations" replace />} />
          <Route path="events" element={<Navigate to="/kollam/celebrations" replace />} />
          <Route path="events-and-decorations" element={<Navigate to="/kollam/celebrations" replace />} />
          <Route path="events-and-decoration" element={<Navigate to="/kollam/celebrations" replace />} />
          <Route path="gallery" element={<KollamGallery />} />
        </Route>

        {/* Alappuzha Branch */}
        <Route path="/alappuzha" element={<BranchLayout branchSlug="alappuzha" />}>
          <Route index element={<AlappuzhaHome />} />
          <Route path="menu" element={<AlappuzhaMenu />} />
        </Route>

        {/* Varkala Branch */}
        <Route path="/varkala" element={<VarkalaHome />} />

        {/* Admin Dashboard */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="branch/:branchId" element={<BranchManager />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
