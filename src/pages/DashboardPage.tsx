// ============================================================
// SANAD 1.0 - Dashboard Page
// ============================================================
import React, { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, Brain, Heart, Stethoscope, Activity, Palette, UsersRound, Phone } from 'lucide-react';
import { StatCard, Card, PageHeader } from '../components';
import { useDashboardStore } from '../stores';

export function DashboardPage() {
  const { stats, loading, fetchStats } = useDashboardStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div>
      <PageHeader
        title="لوحة التحكم"
        description="نظرة عامة على إحصائيات المؤسسة"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="إجمالي المتعلمين"
          value={stats.totalStudents}
          icon={<Users className="w-6 h-6" />}
          color="bg-primary-600"
        />
        <StatCard
          title="الذكور"
          value={stats.maleStudents}
          icon={<UserCheck className="w-6 h-6" />}
          color="bg-blue-500"
        />
        <StatCard
          title="الإناث"
          value={stats.femaleStudents}
          icon={<UserX className="w-6 h-6" />}
          color="bg-pink-500"
        />
        <StatCard
          title="الحالات النفسية"
          value={stats.psychologicalCases}
          icon={<Brain className="w-6 h-6" />}
          color="bg-purple-600"
        />
        <StatCard
          title="الحالات الاجتماعية"
          value={stats.socialCases}
          icon={<Heart className="w-6 h-6" />}
          color="bg-rose-500"
        />
        <StatCard
          title="السجلات الصحية"
          value={stats.healthRecords}
          icon={<Stethoscope className="w-6 h-6" />}
          color="bg-emerald-600"
        />
        <StatCard
          title="جلسات المواكبة"
          value={stats.supportSessions}
          icon={<Activity className="w-6 h-6" />}
          color="bg-amber-600"
        />
        <StatCard
          title="أنشطة المؤسسة"
          value={stats.institutionActivities}
          icon={<Palette className="w-6 h-6" />}
          color="bg-indigo-600"
        />
        <StatCard
          title="الأندية التربوية"
          value={stats.clubs}
          icon={<UsersRound className="w-6 h-6" />}
          color="bg-teal-600"
        />
        <StatCard
          title="التواصل مع الأسر"
          value={stats.familyCommunications}
          icon={<Phone className="w-6 h-6" />}
          color="bg-cyan-600"
        />
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">مرحباً بك في SANAD 1.0</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            نظام رقمي مهني موجه للمختصين الاجتماعيين بالمؤسسات التعليمية المغربية.
            يساعد على تنظيم وتتبع أعمال المواكبة النفسية والاجتماعية والصحية،
            الحياة المدرسية، التواصل مع الأسر، والأنشطة التربوية والاجتماعية.
          </p>
          <div className="mt-4 p-4 bg-primary-50 rounded-lg">
            <p className="text-sm text-primary-700 font-medium">
              💡 ابدأ بإضافة المتعلمين عبر استيراد ملف مسار أو الإضافة اليدوية
            </p>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">الوحدات المتاحة</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'المتعلمون', count: stats.totalStudents },
              { label: 'المواكبة النفسية', count: stats.psychologicalCases },
              { label: 'المواكبة الاجتماعية', count: stats.socialCases },
              { label: 'الصحة المدرسية', count: stats.healthRecords },
              { label: 'الأنشطة', count: stats.institutionActivities },
              { label: 'الأندية', count: stats.clubs },
              { label: 'التواصل', count: stats.familyCommunications },
              { label: 'جلسات المواكبة', count: stats.supportSessions },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">{item.label}</span>
                <span className="text-sm font-bold text-primary-600">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
