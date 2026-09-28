// ============================================================
// SANAD 1.0 - Activities Page
// ============================================================
import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Palette } from 'lucide-react';
import { PageHeader, Button, Card, Modal, FormField, Input, Textarea, EmptyState, ConfirmDialog } from '../components';
import { activityRepository } from '../repositories';
import type { Activity } from '../types';
import { formatDate } from '../utils';

export function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [showDelete, setShowDelete] = useState<string | null>(null);

  const [form, setForm] = useState({ title: '', activity_date: new Date().toISOString().split('T')[0], activity_type: '', location: '', organizer: '', objectives: '', description: '', results: '', notes: '' });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { const a = await activityRepository.getAll(); setActivities(a); };

  const openCreate = () => { setEditing(null); setForm({ title: '', activity_date: new Date().toISOString().split('T')[0], activity_type: '', location: '', organizer: '', objectives: '', description: '', results: '', notes: '' }); setShowForm(true); };
  const openEdit = (a: Activity) => { setEditing(a); setForm({ title: a.title, activity_date: a.activity_date, activity_type: a.activity_type, location: a.location, organizer: a.organizer, objectives: a.objectives, description: a.description, results: a.results, notes: a.notes }); setShowForm(true); };

  const handleSubmit = async () => {
    if (!form.title) return;
    if (editing) await activityRepository.update(editing.activity_id, form);
    else await activityRepository.create(form);
    setShowForm(false);
    loadData();
  };

  const handleDelete = async (id: string) => { await activityRepository.delete(id); loadData(); };

  return (
    <div>
      <PageHeader title="الأنشطة التربوية" description={`إجمالي الأنشطة: ${activities.length}`}
        action={<Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>إضافة نشاط</Button>} />

      {activities.length === 0 ? (
        <EmptyState title="لا توجد أنشطة" description="أضف نشاط تربوي جديد" icon={<Palette className="w-8 h-8 text-gray-400" />} action={<Button onClick={openCreate}>إضافة نشاط</Button>} />
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
                    {a.activity_type && <span>🏷️ {a.activity_type}</span>}
                  </div>
                  {a.objectives && <p className="text-xs text-gray-500 mt-2">الأهداف: {a.objectives}</p>}
                  {a.results && <p className="text-xs text-gray-500 mt-1">النتائج: {a.results}</p>}
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

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'تعديل النشاط' : 'إضافة نشاط'} size="lg">
        <div className="space-y-4">
          <FormField label="العنوان" required><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="التاريخ"><Input type="date" value={form.activity_date} onChange={e => setForm({...form, activity_date: e.target.value})} /></FormField>
            <FormField label="النوع"><Input value={form.activity_type} onChange={e => setForm({...form, activity_type: e.target.value})} placeholder="ورشة، يوم دراسي، مسابقة..." /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="المكان"><Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></FormField>
            <FormField label="المنظم"><Input value={form.organizer} onChange={e => setForm({...form, organizer: e.target.value})} /></FormField>
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

      <ConfirmDialog isOpen={!!showDelete} onClose={() => setShowDelete(null)} onConfirm={() => showDelete && handleDelete(showDelete)} title="حذف النشاط" message="هل أنت متأكد؟" variant="danger" />
    </div>
  );
}
