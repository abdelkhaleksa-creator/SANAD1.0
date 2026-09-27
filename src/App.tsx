// ============================================================
// SANAD 1.0 - Main Application
// ============================================================
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
  useEffect(() => {
    initializeDatabase();
  }, []);

  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
