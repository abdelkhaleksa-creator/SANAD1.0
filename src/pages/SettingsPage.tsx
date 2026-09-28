// ============================================================
// SANAD 1.0 - Settings Page
// ============================================================
import React, { useEffect, useState } from 'react';
import { Save, Settings as SettingsIcon, CheckCircle } from 'lucide-react';
import { PageHeader, Button, Card, FormField, Input } from '../components';
import { useSettingsStore } from '../stores';

export function SettingsPage() {
  const { settings, fetchSettings, updateSettings } = useSettingsStore();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    institution_name: '', directorate: '', academy: '',
    specialist_name: '', school_year: '', report_header: ''
  });

  useEffect(() => { fetchSettings(); }, []);

  useEffect(() => {
    if (settings) {
      setForm({
        institution_name: settings.institution_name,
        directorate: settings.directorate,
        academy: settings.academy,
        specialist_name: settings.specialist_name,
        school_year: settings.school_year,
        report_header: settings.report_header
      });
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <PageHeader title="الإعدادات" description="إعدادات المؤسسة والتقارير" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-gray-500" />
            معلومات المؤسسة
          </h3>
          <div className="space-y-4">
            <FormField label="اسم المؤسسة">
              <Input value={form.institution_name} onChange={e => setForm({...form, institution_name: e.target.value})} placeholder="الثانوية التأهيلية..." />
            </FormField>
            <FormField label="المديرية الإقليمية">
              <Input value={form.directorate} onChange={e => setForm({...form, directorate: e.target.value})} placeholder="مديرية..." />
            </FormField>
            <FormField label="الأكاديمية الجهوية">
              <Input value={form.academy} onChange={e => setForm({...form, academy: e.target.value})} placeholder="الأكاديمية الجهوية..." />
            </FormField>
            <FormField label="اسم المختص">
              <Input value={form.specialist_name} onChange={e => setForm({...form, specialist_name: e.target.value})} />
            </FormField>
            <FormField label="السنة الدراسية">
              <Input value={form.school_year} onChange={e => setForm({...form, school_year: e.target.value})} placeholder="2024/2025" />
            </FormField>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">إعدادات التقارير</h3>
          <div className="space-y-4">
            <FormField label="رأس التقرير">
              <Input value={form.report_header} onChange={e => setForm({...form, report_header: e.target.value})} placeholder="المملكة المغربية - وزارة التربية الوطنية" />
            </FormField>
            <div className="bg-blue-50 rounded-lg p-4 mt-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">معاينة رأس التقرير</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>{form.report_header || 'المملكة المغربية - وزارة التربية الوطنية'}</p>
                <p>{form.academy || 'الأكاديمية الجهوية...'}</p>
                <p>{form.directorate || 'المديرية الإقليمية...'}</p>
                <p>{form.institution_name || 'اسم المؤسسة...'}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <Button onClick={handleSave} icon={<Save className="w-4 h-4" />}>حفظ الإعدادات</Button>
        {saved && (
          <span className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            تم الحفظ بنجاح
          </span>
        )}
      </div>
    </div>
  );
}
