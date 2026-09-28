// ============================================================
// SANAD 1.0 - Health Page
// ============================================================
import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Stethoscope, Activity } from 'lucide-react';
import { PageHeader, Button, Card, Modal, FormField, Input, Textarea, SelectField, Tabs, EmptyState, ConfirmDialog } from '../components';
import { healthRepository, healthActivityRepository } from '../repositories';
import { studentRepository } from '../repositories/studentRepository';
import type { HealthRecord, HealthActivity, Student } from '../types';
import { formatDate } from '../utils';

export function HealthPage() {
  const [activeTab, setActiveTab] = useState('records');
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [healthActivities, setHealthActivities] = useState<HealthActivity[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);

  const [recordForm, setRecordForm] = useState({
    student_id: '', blood_type: '', allergies: '', chronic_conditions: '',
    disabilities: '', medications: '', vaccination_notes: '', emergency_contact: '',
    health_notes: '', last_update: new Date().toISOString().split('T')[0]
  });

  const [activityForm, setActivityForm] = useState({
    title: '', activity_date: new Date().toISOString().split('T')[0], activity_type: '',
    location: '', organizer: '', partners: '', description: '', beneficiaries_count: 0, notes: ''
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [allStudents, allActivities] = await Promise.all([
      studentRepository.getAll({ page: 1, limit: 10000 }),
      healthActivityRepository.getAll()
    ]);
    setStudents(allStudents.data);
    setHealthActivities(allActivities);
    
    // Load health records for all students
    const records: HealthRecord[] = [];
    for (const s of allStudents.data) {
      const r = await healthRepository.getByStudentId(s.student_id);
      if (r) records.push(r);
    }
    setHealthRecords(records);
  };

  const getStudentName = (id: string) => students.find(s => s.student_id === id)?.full_name || 'غير معروف';

  const openRecordForm = (record?: HealthRecord) => {
    if (record) {
      setEditingRecord(record);
      setRecordForm({ student_id: record.student_id, blood_type: record.blood_type, allergies: record.allergies, chronic_conditions: record.chronic_conditions, disabilities: record.disabilities, medications: record.medications, vaccination_notes: record.vaccination_notes, emergency_contact: record.emergency_contact, health_notes: record.health_notes, last_update: record.last_update });
    } else {
      setEditingRecord(null);
      setRecordForm({ student_id: '', blood_type: '', allergies: '', chronic_conditions: '', disabilities: '', medications: '', vaccination_notes: '', emergency_contact: '', health_notes: '', last_update: new Date().toISOString().split('T')[0] });
    }
    setShowRecordForm(true);
  };

  const handleSaveRecord = async () => {
    if (!recordForm.student_id) return;
    if (editingRecord) {
      await healthRepository.update(editingRecord.health_id, recordForm);
    } else {
      await healthRepository.create({ ...recordForm });
    }
    setShowRecordForm(false);
    loadData();
  };

  const handleSaveActivity = async () => {
    await healthActivityRepository.create(activityForm);
    setShowActivityForm(false);
    setActivityForm({ title: '', activity_date: new Date().toISOString().split('T')[0], activity_type: '', location: '', organizer: '', partners: '', description: '', beneficiaries_count: 0, notes: '' });
    loadData();
  };

  const tabs = [
    { id: 'records', label: 'السجلات الصحية', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'activities', label: 'الأنشطة الصحية', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <div>
      <PageHeader title="الصحة المدرسية" />
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'records' && (
          <div>
            <div className="flex justify-end mb-4">
              <Button icon={<Plus className="w-4 h-4" />} onClick={() => openRecordForm()}>إضافة سجل صحي</Button>
            </div>
            {healthRecords.length === 0 ? (
              <EmptyState title="لا توجد سجلات صحية" description="أضف سجل صحي لمتعلم" icon={<Stethoscope className="w-8 h-8 text-gray-400" />} />
            ) : (
              <div className="grid gap-4">
                {healthRecords.map(r => (
                  <Card key={r.health_id}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{getStudentName(r.student_id)}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {r.blood_type && `فصيلة الدم: ${r.blood_type}`}
                          {r.allergies && ` | حساسية: ${r.allergies}`}
                          {r.chronic_conditions && ` | أمراض مزمنة: ${r.chronic_conditions}`}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">آخر تحديث: {formatDate(r.last_update)}</p>
                      </div>
                      <Button size="sm" variant="ghost" icon={<Edit className="w-4 h-4" />} onClick={() => openRecordForm(r)}>تعديل</Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'activities' && (
          <div>
            <div className="flex justify-end mb-4">
              <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowActivityForm(true)}>إضافة نشاط صحي</Button>
            </div>
            {healthActivities.length === 0 ? (
              <EmptyState title="لا توجد أنشطة صحية" description="أضف نشاط صحي للمؤسسة" icon={<Activity className="w-8 h-8 text-gray-400" />} />
            ) : (
              <div className="grid gap-4">
                {healthActivities.map(a => (
                  <Card key={a.activity_id}>
                    <h4 className="font-semibold text-gray-900">{a.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{a.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>{formatDate(a.activity_date)}</span>
                      <span>{a.location}</span>
                      <span>المستفيدون: {a.beneficiaries_count}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Record Form */}
      <Modal isOpen={showRecordForm} onClose={() => setShowRecordForm(false)} title={editingRecord ? 'تعديل السجل الصحي' : 'إضافة سجل صحي'} size="lg">
        <div className="space-y-4">
          <FormField label="المتعلم" required>
            <SelectField value={recordForm.student_id} onChange={v => setRecordForm({...recordForm, student_id: v})} placeholder="اختر متعلم..."
              options={students.map(s => ({ value: s.student_id, label: `${s.full_name} - ${s.massar_code}` }))} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="فصيلة الدم"><Input value={recordForm.blood_type} onChange={e => setRecordForm({...recordForm, blood_type: e.target.value})} placeholder="A+, B-, O+..." /></FormField>
            <FormField label="آخر تحديث"><Input type="date" value={recordForm.last_update} onChange={e => setRecordForm({...recordForm, last_update: e.target.value})} /></FormField>
          </div>
          <FormField label="الحساسية"><Textarea value={recordForm.allergies} onChange={e => setRecordForm({...recordForm, allergies: e.target.value})} /></FormField>
          <FormField label="أمراض مزمنة"><Textarea value={recordForm.chronic_conditions} onChange={e => setRecordForm({...recordForm, chronic_conditions: e.target.value})} /></FormField>
          <FormField label="إعاقات"><Input value={recordForm.disabilities} onChange={e => setRecordForm({...recordForm, disabilities: e.target.value})} /></FormField>
          <FormField label="أدوية"><Input value={recordForm.medications} onChange={e => setRecordForm({...recordForm, medications: e.target.value})} /></FormField>
          <FormField label="ملاحظات التلقيح"><Input value={recordForm.vaccination_notes} onChange={e => setRecordForm({...recordForm, vaccination_notes: e.target.value})} /></FormField>
          <FormField label="جهة الاتصال في الطوارئ"><Input value={recordForm.emergency_contact} onChange={e => setRecordForm({...recordForm, emergency_contact: e.target.value})} /></FormField>
          <FormField label="ملاحظات صحية"><Textarea value={recordForm.health_notes} onChange={e => setRecordForm({...recordForm, health_notes: e.target.value})} /></FormField>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="secondary" onClick={() => setShowRecordForm(false)}>إلغاء</Button>
          <Button onClick={handleSaveRecord} disabled={!recordForm.student_id}>حفظ</Button>
        </div>
      </Modal>

      {/* Activity Form */}
      <Modal isOpen={showActivityForm} onClose={() => setShowActivityForm(false)} title="إضافة نشاط صحي" size="lg">
        <div className="space-y-4">
          <FormField label="عنوان النشاط" required><Input value={activityForm.title} onChange={e => setActivityForm({...activityForm, title: e.target.value})} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="التاريخ"><Input type="date" value={activityForm.activity_date} onChange={e => setActivityForm({...activityForm, activity_date: e.target.value})} /></FormField>
            <FormField label="النوع"><Input value={activityForm.activity_type} onChange={e => setActivityForm({...activityForm, activity_type: e.target.value})} placeholder="تحسيس، فحص، حملة..." /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="المكان"><Input value={activityForm.location} onChange={e => setActivityForm({...activityForm, location: e.target.value})} /></FormField>
            <FormField label="المنظم"><Input value={activityForm.organizer} onChange={e => setActivityForm({...activityForm, organizer: e.target.value})} /></FormField>
          </div>
          <FormField label="الشركاء"><Input value={activityForm.partners} onChange={e => setActivityForm({...activityForm, partners: e.target.value})} /></FormField>
          <FormField label="الوصف"><Textarea value={activityForm.description} onChange={e => setActivityForm({...activityForm, description: e.target.value})} /></FormField>
          <FormField label="عدد المستفيدين"><Input type="number" value={activityForm.beneficiaries_count} onChange={e => setActivityForm({...activityForm, beneficiaries_count: parseInt(e.target.value) || 0})} /></FormField>
          <FormField label="ملاحظات"><Textarea value={activityForm.notes} onChange={e => setActivityForm({...activityForm, notes: e.target.value})} /></FormField>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="secondary" onClick={() => setShowActivityForm(false)}>إلغاء</Button>
          <Button onClick={handleSaveActivity} disabled={!activityForm.title}>حفظ</Button>
        </div>
      </Modal>
    </div>
  );
}
