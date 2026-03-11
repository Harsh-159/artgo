/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MapPage } from './pages/MapPage';
import { ARPage } from './pages/ARPage';
import { UploadPage } from './pages/UploadPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/map" replace />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/ar/:id" element={<ARPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/profile" element={<div className="h-screen bg-background text-white flex items-center justify-center">Profile (Coming Soon)</div>} />
      </Routes>
    </BrowserRouter>
  );
}
