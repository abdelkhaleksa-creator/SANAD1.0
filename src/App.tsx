// ============================================================
// SANAD 1.0 - Main Application
// ============================================================
import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { ImportPage } from './pages/ImportPage';
import { PsychologicalPage } from './pages/PsychologicalPage';
import { SocialPage } from './pages/SocialPage';
import { HealthPage } from './pages/HealthPage';
import { SchoolLifePage } from './pages/SchoolLifePage';
import { FamilyPage } from './pages/FamilyPage';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { SocialActivitiesPage } from './pages/SocialActivitiesPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { initializeDatabase } from './database';

function App() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    initializeDatabase()
      .then(() => setDbReady(true))
      .catch((err) => {
        console.error('Database initialization error:', err);
        setDbError(err?.message || 'خطأ في تهيئة قاعدة البيانات');
        // Still set ready to show the app
        setDbReady(true);
      });
  }, []);

  if (dbError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">SANAD 1.0</h1>
          <p className="text-sm text-red-600 mb-4">{dbError}</p>
          <p className="text-sm text-gray-500 mb-4">يرجى التأكد من أن متصفحك يدعم IndexedDB</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (!dbReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white text-xl font-bold">S</span>
          </div>
          <h1 className="text-lg font-bold text-gray-900">SANAD 1.0</h1>
          <p className="text-sm text-gray-500 mt-1">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/students/:id" element={<StudentProfilePage />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/psychological" element={<PsychologicalPage />} />
          <Route path="/social" element={<SocialPage />} />
          <Route path="/health" element={<HealthPage />} />
          <Route path="/school-life" element={<SchoolLifePage />} />
          <Route path="/family" element={<FamilyPage />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/social-activities" element={<SocialActivitiesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
