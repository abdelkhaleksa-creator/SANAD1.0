// ============================================================
// SANAD 1.0 - Reports Page
// ============================================================
import React, { useState, useEffect } from 'react';
import { FileText, Printer, BarChart3 } from 'lucide-react';
import { PageHeader, Button, Card, SelectField, FormField } from '../components';
import { useDashboardStore, useSettingsStore } from '../stores';
import { studentRepository } from '../repositories/studentRepository';
import { psychologicalRepository, socialRepository, communicationRepository, clubRepository, activityRepository } from '../repositories';

type ReportType = 'statistics' | 'psychological' | 'social' | 'health' | 'communication' | 'clubs' | 'activities' | 'student';

export function ReportsPage() {
  const { stats, fetchStats } = useDashboardStore();
  const { settings, fetchSettings } = useSettingsStore();
  const [reportType, setReportType] = useState<ReportType>('statistics');
  const [reportContent, setReportContent] = useState('');

  useEffect(() => { fetchStats(); fetchSettings(); }, []);

  const generateReport = async () => {
    const header = `${settings?.report_header || 'المملكة المغربية - وزارة التربية الوطنية'}\n${settings?.academy || ''}\n${settings?.directorate || ''}\n${settings?.institution_name || ''}\nالمختص: ${settings?.specialist_name || ''}\nالتاريخ: ${new Date().toLocaleDateString('ar-MA')}`;
    const footer = `\n\n_____________________\nإمضاء المختص\n\n_____________________\nإمضاء الإدارة\n\nالخاتم`;

    let content = '';
    switch (reportType) {
      case 'statistics':
        content = `تقرير إحصائي للمؤسسة\n\n` +
          `عدد المتعلمين: ${stats.totalStudents}\n` +
          `عدد الذكور: ${stats.maleStudents}\n` +
          `عدد الإناث: ${stats.femaleStudents}\n` +
          `الحالات النفسية: ${stats.psychologicalCases}\n` +
          `الحالات الاجتماعية: ${stats.socialCases}\n` +
          `السجلات الصحية: ${stats.healthRecords}\n` +
          `جلسات المواكبة: ${stats.supportSessions}\n` +
          `أنشطة المؤسسة: ${stats.institutionActivities}\n` +
          `الأندية التربوية: ${stats.clubs}\n` +
          `التواصل مع الأسر: ${stats.familyCommunications}`;
        break;
      case 'psychological':
        const psychCases = await psychologicalRepository.getAll();
        content = `تقرير الحالات النفسية\n\nعدد الحالات: ${psychCases.length}\n\n`;
        psychCases.forEach((c, i) => {
          content += `${i + 1}. نوع: ${c.case_type} | التاريخ: ${c.case_date} | الأولوية: ${c.priority} | الحالة: ${c.status}\n`;
        });
        break;
      case 'social':
        const socialCases = await socialRepository.getAll();
        content = `تقرير الحالات الاجتماعية\n\nعدد الحالات: ${socialCases.length}\n\n`;
        socialCases.forEach((c, i) => {
          content += `${i + 1}. نوع: ${c.case_type} | التاريخ: ${c.case_date} | الأولوية: ${c.priority} | الحالة: ${c.status}\n`;
        });
        break;
      case 'communication':
        const comms = await communicationRepository.getAll();
        content = `تقرير التواصل مع الأسر\n\nعدد العمليات: ${comms.length}\n\n`;
        comms.forEach((c, i) => {
          content += `${i + 1}. الموضوع: ${c.subject} | النوع: ${c.communication_type} | التاريخ: ${c.date}\n`;
        });
        break;
      case 'clubs':
        const clubs = await clubRepository.getAll();
        content = `تقرير الأندية التربوية\n\nعدد الأندية: ${clubs.length}\n\n`;
        clubs.forEach((c, i) => {
          content += `${i + 1}. ${c.name} | المؤطر: ${c.supervisor} | الحالة: ${c.status}\n`;
        });
        break;
      case 'activities':
        const acts = await activityRepository.getAll();
        content = `تقرير الأنشطة التربوية\n\nعدد الأنشطة: ${acts.length}\n\n`;
        acts.forEach((a, i) => {
          content += `${i + 1}. ${a.title} | التاريخ: ${a.activity_date} | المكان: ${a.location}\n`;
        });
        break;
      default:
        content = 'اختر نوع التقرير';
    }

    setReportContent(`${header}\n\n${'='.repeat(50)}\n\n${content}\n${footer}`);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl"><head><title>تقرير - SANAD</title>
        <style>body{font-family:'IBM Plex Sans Arabic',sans-serif;padding:40px;line-height:1.8;white-space:pre-wrap;}</style></head>
        <body>${reportContent}</body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div>
      <PageHeader title="التقارير" description="إنشاء وطباعة التقارير" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">إعداد التقرير</h3>
          <div className="space-y-4">
            <FormField label="نوع التقرير">
              <SelectField value={reportType} onChange={v => setReportType(v as ReportType)}
                options={[
                  { value: 'statistics', label: 'تقرير إحصائي' },
                  { value: 'psychological', label: 'تقرير الحالات النفسية' },
                  { value: 'social', label: 'تقرير الحالات الاجتماعية' },
                  { value: 'communication', label: 'تقرير التواصل مع الأسر' },
                  { value: 'clubs', label: 'تقرير الأندية' },
                  { value: 'activities', label: 'تقرير الأنشطة' },
                ]} />
            </FormField>
            <Button onClick={generateReport} icon={<FileText className="w-4 h-4" />} className="w-full">إنشاء التقرير</Button>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">معاينة التقرير</h3>
            {reportContent && (
              <Button variant="secondary" size="sm" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>طباعة</Button>
            )}
          </div>
          {reportContent ? (
            <pre className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed border border-gray-200 max-h-[500px] overflow-y-auto">
              {reportContent}
            </pre>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>اختر نوع التقرير واضغط "إنشاء التقرير"</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
