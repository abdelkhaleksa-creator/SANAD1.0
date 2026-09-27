// ============================================================
// SANAD 1.0 - Family Communication Page
// ============================================================
import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Phone } from 'lucide-react';
import { PageHeader, Button, Card, Modal, FormField, Input, Textarea, SelectField, Badge, EmptyState, ConfirmDialog } from '../components';
import { communicationRepository } from '../repositories';
import { studentRepository } from '../repositories/studentRepository';
import type { FamilyCommunication, Student } from '../types';
import { formatDate, getCommunicationTypeLabel } from '../utils';

export function FamilyPage() {
  const [communications, setCommunications] = useState<FamilyCommunication[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FamilyCommunication | null>(null);
  const [showDelete, setShowDelete] = useState<string | null>(null);

  const [form, setForm] = useState({
    student_id: '', date: new Date().toISOString().split('T')[0],
    communication_type: 'phone_call' as FamilyCommunication['communication_type'],
    contact_person: '', relationship: '', phone: '', subject: '',
    reason: '', summary: '', outcome: '', follow_up_date: '', notes: ''
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [c, s] = await Promise.all([communicationRepository.getAll(), studentRepository.getAll({ page: 1, limit: 10000 })]);
    setCommunications(c);
    setStudents(s.data);
  };

  const getStudentName = (id: string) => students.find(s => s.student_id === id)?.full_name || 'غير معروف';

  const openCreate = () => {
    setEditing(null);
    setForm({ student_id: '', date: new Date().toISOString().split('T')[0], communication_type: 'phone_call', contact_person: '', relationship: '', phone: '', subject: '', reason: '', summary: '', outcome: '', follow_up_date: '', notes: '' });
    setShowForm(true);
  };

  const openEdit = (c: FamilyCommunication) => {
    setEditing(c);
    setForm({ student_id: c.student_id, date: c.date, communication_type: c.communication_type, contact_person: c.contact_person, relationship: c.relationship, phone: c.phone, subject: c.subject, reason: c.reason, summary: c.summary, outcome: c.outcome, follow_up_date: c.follow_up_date, notes: c.notes });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.student_id) return;
    if (editing) await communicationRepository.update(editing.communication_id, form);
    else await communicationRepository.create(form);
    setShowForm(false);
    loadData();
  };

  const handleDelete = async (id: string) => { await communicationRepository.delete(id); loadData(); };

  return (
    <div>
      <PageHeader title="التواصل مع الأسر" description={`إجمالي العمليات: ${communications.length}`}
        action={<Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>إضافة تواصل</Button>} />

      {communications.length === 0 ? (
        <EmptyState title="لا توجد عمليات تواصل" description="سجل عمليات التواصل مع الأسر" icon={<Phone className="w-8 h-8 text-gray-400" />} action={<Button onClick={openCreate}>إضافة تواصل</Button>} />
      ) : (
        <div className="grid gap-4">
          {communications.map(c => (
            <Card key={c.communication_id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900">{getStudentName(c.student_id)}</span>
                    <Badge className="bg-blue-100 text-blue-800">{getCommunicationTypeLabel(c.communication_type)}</Badge>
                  </div>
                  <p className="text-sm font-medium text-gray-700">{c.subject}</p>
                  <p className="text-sm text-gray-600 mt-1">{c.summary}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>{formatDate(c.date)}</span>
                    <span>{c.contact_person} ({c.relationship})</span>
                    {c.outcome && <span>النتيجة: {c.outcome}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(c)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => setShowDelete(c.communication_id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'تعديل' : 'إضافة تواصل مع الأسرة'} size="lg">
        <div className="space-y-4">
          <FormField label="المتعلم" required>
            <SelectField value={form.student_id} onChange={v => setForm({...form, student_id: v})} placeholder="اختر متعلم..."
              options={students.map(s => ({ value: s.student_id, label: `${s.full_name} - ${s.massar_code}` }))} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="التاريخ"><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></FormField>
            <FormField label="نوع التواصل">
              <SelectField value={form.communication_type} onChange={v => setForm({...form, communication_type: v as any})}
                options={[{value:'phone_call',label:'اتصال هاتفي'},{value:'direct_meeting',label:'لقاء مباشر'},{value:'summons',label:'استدعاء'},{value:'visit',label:'زيارة'},{value:'correspondence',label:'مراسلة'},{value:'other',label:'نوع آخر'}]} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="الشخص المتصل"><Input value={form.contact_person} onChange={e => setForm({...form, contact_person: e.target.value})} /></FormField>
            <FormField label="صلة القرابة"><Input value={form.relationship} onChange={e => setForm({...form, relationship: e.target.value})} placeholder="أب، أم، ولي..." /></FormField>
          </div>
          <FormField label="الهاتف"><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></FormField>
          <FormField label="الموضوع" required><Input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} /></FormField>
          <FormField label="السبب"><Input value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} /></FormField>
          <FormField label="الملخص"><Textarea value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} /></FormField>
          <FormField label="النتيجة"><Textarea value={form.outcome} onChange={e => setForm({...form, outcome: e.target.value})} /></FormField>
          <FormField label="تاريخ المتابعة"><Input type="date" value={form.follow_up_date} onChange={e => setForm({...form, follow_up_date: e.target.value})} /></FormField>
          <FormField label="ملاحظات"><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></FormField>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="secondary" onClick={() => setShowForm(false)}>إلغاء</Button>
          <Button onClick={handleSubmit} disabled={!form.student_id || !form.subject}>حفظ</Button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!showDelete} onClose={() => setShowDelete(null)} onConfirm={() => showDelete && handleDelete(showDelete)}
        title="حذف" message="هل أنت متأكد من حذف هذا السجل؟" variant="danger" />
    </div>
  );
}
