// ============================================================
// SANAD 1.0 - Psychological Support Page
// ============================================================
import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, Brain } from 'lucide-react';
import { PageHeader, Button, Card, Modal, FormField, Input, Textarea, SelectField, Badge, EmptyState, ConfirmDialog, Tabs } from '../components';
import { psychologicalRepository } from '../repositories';
import { studentRepository } from '../repositories/studentRepository';
import type { PsychologicalCase, PsychologicalAction, Student } from '../types';
import { getStatusLabel, getStatusColor, getPriorityColor, formatDate, generateId, getCurrentTimestamp, getSchoolYear } from '../utils';

export function PsychologicalPage() {
  const [cases, setCases] = useState<PsychologicalCase[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showActionForm, setShowActionForm] = useState(false);
  const [editingCase, setEditingCase] = useState<PsychologicalCase | null>(null);
  const [selectedCase, setSelectedCase] = useState<PsychologicalCase | null>(null);
  const [actions, setActions] = useState<PsychologicalAction[]>([]);
  const [showDelete, setShowDelete] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');

  // Form state
  const [form, setForm] = useState({
    student_id: '', case_date: new Date().toISOString().split('T')[0],
    case_type: '', reason: '', description: '', priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: 'open' as 'open' | 'in_progress' | 'closed' | 'archived', notes: ''
  });
  const [actionForm, setActionForm] = useState({
    action_date: new Date().toISOString().split('T')[0], action_type: '',
    description: '', result: '', next_step: '', notes: ''
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [c, s] = await Promise.all([psychologicalRepository.getAll(), studentRepository.getAll({ page: 1, limit: 10000 })]);
    setCases(c);
    setStudents(s.data);
  };

  const filteredCases = filterStatus ? cases.filter(c => c.status === filterStatus) : cases;

  const getStudentName = (id: string) => students.find(s => s.student_id === id)?.full_name || 'غير معروف';

  const openCreate = () => {
    setEditingCase(null);
    setForm({ student_id: '', case_date: new Date().toISOString().split('T')[0], case_type: '', reason: '', description: '', priority: 'medium', status: 'open', notes: '' });
    setShowForm(true);
  };

  const openEdit = (c: PsychologicalCase) => {
    setEditingCase(c);
    setForm({ student_id: c.student_id, case_date: c.case_date, case_type: c.case_type, reason: c.reason, description: c.description, priority: c.priority, status: c.status, notes: c.notes });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.student_id) return;
    if (editingCase) {
      await psychologicalRepository.update(editingCase.case_id, form);
    } else {
      await psychologicalRepository.create(form);
    }
    setShowForm(false);
    loadData();
  };

  const openCaseDetail = async (c: PsychologicalCase) => {
    setSelectedCase(c);
    const a = await psychologicalRepository.getActionsByCaseId(c.case_id);
    setActions(a);
  };

  const handleAddAction = async () => {
    if (!selectedCase) return;
    await psychologicalRepository.addAction({ ...actionForm, case_id: selectedCase.case_id });
    setShowActionForm(false);
    const a = await psychologicalRepository.getActionsByCaseId(selectedCase.case_id);
    setActions(a);
    setActionForm({ action_date: new Date().toISOString().split('T')[0], action_type: '', description: '', result: '', next_step: '', notes: '' });
  };

  const handleDelete = async (id: string) => {
    await psychologicalRepository.delete(id);
    loadData();
  };

  return (
    <div>
      <PageHeader
        title="المواكبة النفسية"
        description={`إجمالي الحالات: ${cases.length}`}
        action={<Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>إضافة حالة</Button>}
      />

      <div className="flex gap-4 mb-4">
        <SelectField value={filterStatus} onChange={setFilterStatus} placeholder="تصفية حسب الحالة"
          options={[{value:'open',label:'مفتوح'},{value:'in_progress',label:'قيد المعالجة'},{value:'closed',label:'مغلق'},{value:'archived',label:'مؤرشف'}]} />
      </div>

      {filteredCases.length === 0 ? (
        <EmptyState title="لا توجد حالات نفسية" description="ابدأ بإضافة حالة نفسية جديدة" icon={<Brain className="w-8 h-8 text-gray-400" />} action={<Button onClick={openCreate}>إضافة حالة</Button>} />
      ) : (
        <div className="grid gap-4">
          {filteredCases.map(c => (
            <Card key={c.case_id} className="hover:shadow-md transition-shadow cursor-pointer" padding={false}>
              <div className="p-4 flex items-center justify-between" onClick={() => openCaseDetail(c)}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-gray-900">{getStudentName(c.student_id)}</span>
                    <Badge className={getPriorityColor(c.priority)}>{getStatusLabel(c.priority)}</Badge>
                    <Badge className={getStatusColor(c.status)}>{getStatusLabel(c.status)}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{c.case_type} - {c.reason}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(c.case_date)}</p>
                </div>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => openEdit(c)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => setShowDelete(c.case_id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Case Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingCase ? 'تعديل الحالة' : 'إضافة حالة نفسية'} size="lg">
        <div className="space-y-4">
          <FormField label="المتعلم" required>
            <SelectField value={form.student_id} onChange={v => setForm({...form, student_id: v})} placeholder="اختر متعلم..."
              options={students.map(s => ({ value: s.student_id, label: `${s.full_name} - ${s.massar_code}` }))} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="تاريخ الحالة"><Input type="date" value={form.case_date} onChange={e => setForm({...form, case_date: e.target.value})} /></FormField>
            <FormField label="نوع الحالة"><Input value={form.case_type} onChange={e => setForm({...form, case_type: e.target.value})} placeholder="مثال: قلق، انطواء..." /></FormField>
          </div>
          <FormField label="سبب الإحالة"><Input value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} /></FormField>
          <FormField label="وصف الحالة"><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="الأولوية"><SelectField value={form.priority} onChange={v => setForm({...form, priority: v as any})} options={[{value:'low',label:'منخفض'},{value:'medium',label:'متوسط'},{value:'high',label:'مرتفع'},{value:'urgent',label:'عاجل'}]} /></FormField>
            <FormField label="الحالة"><SelectField value={form.status} onChange={v => setForm({...form, status: v as any})} options={[{value:'open',label:'مفتوح'},{value:'in_progress',label:'قيد المعالجة'},{value:'closed',label:'مغلق'},{value:'archived',label:'مؤرشف'}]} /></FormField>
          </div>
          <FormField label="ملاحظات"><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></FormField>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="secondary" onClick={() => setShowForm(false)}>إلغاء</Button>
          <Button onClick={handleSubmit} disabled={!form.student_id}>{editingCase ? 'تحديث' : 'حفظ'}</Button>
        </div>
      </Modal>

      {/* Case Detail Modal */}
      <Modal isOpen={!!selectedCase} onClose={() => setSelectedCase(null)} title="تفاصيل الحالة النفسية" size="xl">
        {selectedCase && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div><p className="text-xs text-gray-500">المتعلم</p><p className="font-medium">{getStudentName(selectedCase.student_id)}</p></div>
              <div><p className="text-xs text-gray-500">التاريخ</p><p className="font-medium">{formatDate(selectedCase.case_date)}</p></div>
              <div><p className="text-xs text-gray-500">النوع</p><p className="font-medium">{selectedCase.case_type}</p></div>
              <div><p className="text-xs text-gray-500">السبب</p><p className="font-medium">{selectedCase.reason}</p></div>
            </div>
            <div className="mb-6"><p className="text-xs text-gray-500 mb-1">الوصف</p><p className="text-sm text-gray-700">{selectedCase.description}</p></div>
            
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">الإجراءات المتخذة</h4>
              <Button size="sm" icon={<Plus className="w-3 h-3" />} onClick={() => setShowActionForm(true)}>إضافة إجراء</Button>
            </div>
            {actions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">لا توجد إجراءات</p>
            ) : (
              <div className="space-y-3">
                {actions.map(a => (
                  <div key={a.action_id} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{a.action_type}</span>
                      <span className="text-xs text-gray-400">{formatDate(a.action_date)}</span>
                    </div>
                    <p className="text-sm text-gray-600">{a.description}</p>
                    {a.result && <p className="text-xs text-gray-500 mt-1">النتيجة: {a.result}</p>}
                    {a.next_step && <p className="text-xs text-blue-600 mt-1">الخطوة التالية: {a.next_step}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Action Form Modal */}
      <Modal isOpen={showActionForm} onClose={() => setShowActionForm(false)} title="إضافة إجراء" size="md">
        <div className="space-y-4">
          <FormField label="التاريخ"><Input type="date" value={actionForm.action_date} onChange={e => setActionForm({...actionForm, action_date: e.target.value})} /></FormField>
          <FormField label="نوع الإجراء"><Input value={actionForm.action_type} onChange={e => setActionForm({...actionForm, action_type: e.target.value})} placeholder="جلسة، تقييم، إحالة..." /></FormField>
          <FormField label="الوصف"><Textarea value={actionForm.description} onChange={e => setActionForm({...actionForm, description: e.target.value})} /></FormField>
          <FormField label="النتيجة"><Textarea value={actionForm.result} onChange={e => setActionForm({...actionForm, result: e.target.value})} /></FormField>
          <FormField label="الخطوة التالية"><Input value={actionForm.next_step} onChange={e => setActionForm({...actionForm, next_step: e.target.value})} /></FormField>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="secondary" onClick={() => setShowActionForm(false)}>إلغاء</Button>
          <Button onClick={handleAddAction}>حفظ الإجراء</Button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!showDelete} onClose={() => setShowDelete(null)} onConfirm={() => showDelete && handleDelete(showDelete)}
        title="حذف الحالة" message="هل أنت متأكد من حذف هذه الحالة وجميع إجراءاتها؟" variant="danger" />
    </div>
  );
}
