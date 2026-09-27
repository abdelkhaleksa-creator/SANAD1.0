// ============================================================
// SANAD 1.0 - Social Activities Page
// ============================================================
import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, UsersRound } from 'lucide-react';
import { PageHeader, Button, Card, Modal, FormField, Input, Textarea, EmptyState, ConfirmDialog } from '../components';
import { socialActivityRepository } from '../repositories';
import type { SocialActivity } from '../types';
import { formatDate } from '../utils';

export function SocialActivitiesPage() {
  const [activities, setActivities] = useState<SocialActivity[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SocialActivity | null>(null);
  const [showDelete, setShowDelete] = useState<string | null>(null);

  const [form, setForm] = useState({ title: '', activity_date: new Date().toISOString().split('T')[0], location: '', organizer: '', partners: '', target_group: '', beneficiaries_count: 0, objectives: '', description: '', results: '', notes: '' });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { const a = await socialActivityRepository.getAll(); setActivities(a); };

  const openCreate = () => { setEditing(null); setForm({ title: '', activity_date: new Date().toISOString().split('T')[0], location: '', organizer: '', partners: '', target_group: '', beneficiaries_count: 0, objectives: '', description: '', results: '', notes: '' }); setShowForm(true); };
  const openEdit = (a: SocialActivity) => { setEditing(a); setForm({ title: a.title, activity_date: a.activity_date, location: a.location, organizer: a.organizer, partners: a.partners, target_group: a.target_group, beneficiaries_count: a.beneficiaries_count, objectives: a.objectives, description: a.description, results: a.results, notes: a.notes }); setShowForm(true); };

  const handleSubmit = async () => {
    if (!form.title) return;
    if (editing) await socialActivityRepository.update(editing.activity_id, form);
    else await socialActivityRepository.create(form);
    setShowForm(false);
    loadData();
  };

  const handleDelete = async (id: string) => { await socialActivityRepository.delete(id); loadData(); };

  return (
    <div>
      <PageHeader title="الأنشطة الموازية الاجتماعية" description={`إجمالي الأنشطة: ${activities.length}`}
        action={<Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>إضافة نشاط</Button>} />

      {activities.length === 0 ? (
        <EmptyState title="لا توجد أنشطة" description="أضف نشاط موازي اجتماعي" icon={<UsersRound className="w-8 h-8 text-gray-400" />} action={<Button onClick={openCreate}>إضافة نشاط</Button>} />
      ) : (
        <div className="grid gap-4">
          {activities.map(a => (
            <Card key={a.activity_id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{a.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{a.description}</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                    <span>📅 {formatDate(a.activity_date)}</span>
                    <span>📍 {a.location}</span>
                    <span>🏢 {a.organizer}</span>
                    {a.target_group && <span>👥 {a.target_group}</span>}
                    {a.beneficiaries_count > 0 && <span>📊 {a.beneficiaries_count} مستفيد</span>}
                  </div>
                  {a.partners && <p className="text-xs text-gray-500 mt-2">الشركاء: {a.partners}</p>}
                  {a.objectives && <p className="text-xs text-gray-500 mt-1">الأهداف: {a.objectives}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(a)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => setShowDelete(a.activity_id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'تعديل النشاط' : 'إضافة نشاط موازي'} size="lg">
        <div className="space-y-4">
          <FormField label="العنوان" required><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="التاريخ"><Input type="date" value={form.activity_date} onChange={e => setForm({...form, activity_date: e.target.value})} /></FormField>
            <FormField label="المكان"><Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="الجهة المنظمة"><Input value={form.organizer} onChange={e => setForm({...form, organizer: e.target.value})} /></FormField>
            <FormField label="الشركاء"><Input value={form.partners} onChange={e => setForm({...form, partners: e.target.value})} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="الفئة المستفيدة"><Input value={form.target_group} onChange={e => setForm({...form, target_group: e.target.value})} /></FormField>
            <FormField label="عدد المستفيدين"><Input type="number" value={form.beneficiaries_count} onChange={e => setForm({...form, beneficiaries_count: parseInt(e.target.value) || 0})} /></FormField>
          </div>
          <FormField label="الأهداف"><Textarea value={form.objectives} onChange={e => setForm({...form, objectives: e.target.value})} /></FormField>
          <FormField label="الوصف"><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></FormField>
          <FormField label="النتائج"><Textarea value={form.results} onChange={e => setForm({...form, results: e.target.value})} /></FormField>
          <FormField label="ملاحظات"><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></FormField>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="secondary" onClick={() => setShowForm(false)}>إلغاء</Button>
          <Button onClick={handleSubmit} disabled={!form.title}>حفظ</Button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!showDelete} onClose={() => setShowDelete(null)} onConfirm={() => showDelete && handleDelete(showDelete)} title="حذف" message="هل أنت متأكد؟" variant="danger" />
    </div>
  );
}
