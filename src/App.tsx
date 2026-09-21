/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';

const MainHome = lazy(() => import('./pages/MainHome'));
const BranchLayout = lazy(() => import('./components/BranchLayout'));
const KollamHome = lazy(() => import('./pages/kollam/KollamHome'));
const KollamMenu = lazy(() => import('./pages/kollam/KollamMenu'));
const KollamCruise = lazy(() => import('./pages/kollam/KollamCruise'));
const KollamCelebrations = lazy(() => import('./pages/kollam/KollamCelebrations'));
const KollamGallery = lazy(() => import('./pages/kollam/KollamGallery'));

const AlappuzhaHome = lazy(() => import('./pages/alappuzha/AlappuzhaHome'));
const AlappuzhaMenu = lazy(() => import('./pages/alappuzha/AlappuzhaMenu'));

const VarkalaHome = lazy(() => import('./pages/varkala/VarkalaHome'));

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const BranchManager = lazy(() => import('./pages/admin/BranchManager'));

function PageFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<MainHome />} />
          
          {/* Kollam Branch */}
          <Route path="/kollam" element={<BranchLayout branchSlug="kollam" />}>
            <Route index element={<KollamHome />} />
            <Route path="menu" element={<KollamMenu />} />
            <Route path="cruise" element={<KollamCruise />} />
            <Route path="celebrations" element={<KollamCelebrations />} />
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
      </Suspense>
    </BrowserRouter>
  );
}
