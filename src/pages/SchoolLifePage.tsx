// ============================================================
// SANAD 1.0 - School Life / Clubs Page
// ============================================================
import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Users, Calendar, UserPlus } from 'lucide-react';
import { PageHeader, Button, Card, Modal, FormField, Input, Textarea, SelectField, Badge, EmptyState, ConfirmDialog } from '../components';
import { clubRepository } from '../repositories';
import { studentRepository } from '../repositories/studentRepository';
import type { Club, ClubMember, ClubActivity, Student } from '../types';
import { formatDate } from '../utils';

export function SchoolLifePage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showClubForm, setShowClubForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [activities, setActivities] = useState<ClubActivity[]>([]);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [showDelete, setShowDelete] = useState<string | null>(null);

  const [clubForm, setClubForm] = useState({ name: '', description: '', creation_date: new Date().toISOString().split('T')[0], status: 'active' as 'active' | 'archived', supervisor: '', objectives: '' });
  const [memberForm, setMemberForm] = useState({ student_id: '', role: 'member' as 'member' | 'leader' | 'supervisor', status: 'active' as 'active' | 'inactive' });
  const [activityForm, setActivityForm] = useState({ title: '', activity_date: new Date().toISOString().split('T')[0], type: '', location: '', description: '', objectives: '', results: '', participants_count: 0, notes: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [c, s] = await Promise.all([clubRepository.getAll(), studentRepository.getAll({ page: 1, limit: 10000 })]);
    setClubs(c);
    setStudents(s.data);
  };

  const openClubForm = (club?: Club) => {
    if (club) { setEditingClub(club); setClubForm({ name: club.name, description: club.description, creation_date: club.creation_date, status: club.status, supervisor: club.supervisor, objectives: club.objectives }); }
    else { setEditingClub(null); setClubForm({ name: '', description: '', creation_date: new Date().toISOString().split('T')[0], status: 'active', supervisor: '', objectives: '' }); }
    setShowClubForm(true);
  };

  const handleSaveClub = async () => {
    if (!clubForm.name) return;
    if (editingClub) await clubRepository.update(editingClub.club_id, clubForm);
    else await clubRepository.create(clubForm);
    setShowClubForm(false);
    loadData();
  };

  const openClubDetail = async (club: Club) => {
    setSelectedClub(club);
    const [m, a] = await Promise.all([clubRepository.getMembers(club.club_id), clubRepository.getActivities(club.club_id)]);
    setMembers(m);
    setActivities(a);
  };

  const handleAddMember = async () => {
    if (!selectedClub || !memberForm.student_id) return;
    await clubRepository.addMember({ club_id: selectedClub.club_id, student_id: memberForm.student_id, join_date: new Date().toISOString().split('T')[0], role: memberForm.role, status: memberForm.status });
    setShowMemberForm(false);
    const m = await clubRepository.getMembers(selectedClub.club_id);
    setMembers(m);
  };

  const handleAddActivity = async () => {
    if (!selectedClub || !activityForm.title) return;
    await clubRepository.addActivity({ ...activityForm, club_id: selectedClub.club_id });
    setShowActivityForm(false);
    setActivityForm({ title: '', activity_date: new Date().toISOString().split('T')[0], type: '', location: '', description: '', objectives: '', results: '', participants_count: 0, notes: '' });
    const a = await clubRepository.getActivities(selectedClub.club_id);
    setActivities(a);
  };

  const handleDeleteClub = async (id: string) => { await clubRepository.delete(id); loadData(); };
  const handleRemoveMember = async (id: string) => { if (!selectedClub) return; await clubRepository.removeMember(id); const m = await clubRepository.getMembers(selectedClub.club_id); setMembers(m); };

  const getStudentName = (id: string) => students.find(s => s.student_id === id)?.full_name || 'غير معروف';

  return (
    <div>
      <PageHeader title="الحياة المدرسية - الأندية التربوية" description={`إجمالي الأندية: ${clubs.filter(c => c.status === 'active').length}`}
        action={<Button icon={<Plus className="w-4 h-4" />} onClick={() => openClubForm()}>إضافة نادي</Button>} />

      {clubs.length === 0 ? (
        <EmptyState title="لا توجد أندية" description="أنشئ نادي تربوي جديد" icon={<Users className="w-8 h-8 text-gray-400" />} action={<Button onClick={() => openClubForm()}>إضافة نادي</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map(club => (
            <Card key={club.club_id} className="hover:shadow-md transition-shadow cursor-pointer" padding={false}>
              <div className="p-5" onClick={() => openClubDetail(club)}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{club.name}</h3>
                  <Badge className={club.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {club.status === 'active' ? 'نشط' : 'مؤرشف'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{club.description}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span>المؤطر: {club.supervisor || '—'}</span>
                  <span>{formatDate(club.creation_date)}</span>
                </div>
              </div>
              <div className="border-t border-gray-100 px-5 py-3 flex gap-2" onClick={e => e.stopPropagation()}>
                <button onClick={() => openClubForm(club)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600"><Edit className="w-4 h-4" /></button>
                <button onClick={() => setShowDelete(club.club_id)} className="p-1.5 hover:bg-red-50 rounded text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Club Form */}
      <Modal isOpen={showClubForm} onClose={() => setShowClubForm(false)} title={editingClub ? 'تعديل النادي' : 'إضافة نادي'} size="lg">
        <div className="space-y-4">
          <FormField label="اسم النادي" required><Input value={clubForm.name} onChange={e => setClubForm({...clubForm, name: e.target.value})} /></FormField>
          <FormField label="الوصف"><Textarea value={clubForm.description} onChange={e => setClubForm({...clubForm, description: e.target.value})} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="تاريخ التأسيس"><Input type="date" value={clubForm.creation_date} onChange={e => setClubForm({...clubForm, creation_date: e.target.value})} /></FormField>
            <FormField label="الحالة"><SelectField value={clubForm.status} onChange={v => setClubForm({...clubForm, status: v as any})} options={[{value:'active',label:'نشط'},{value:'archived',label:'مؤرشف'}]} /></FormField>
          </div>
          <FormField label="المؤطر"><Input value={clubForm.supervisor} onChange={e => setClubForm({...clubForm, supervisor: e.target.value})} /></FormField>
          <FormField label="الأهداف"><Textarea value={clubForm.objectives} onChange={e => setClubForm({...clubForm, objectives: e.target.value})} /></FormField>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="secondary" onClick={() => setShowClubForm(false)}>إلغاء</Button>
          <Button onClick={handleSaveClub} disabled={!clubForm.name}>حفظ</Button>
        </div>
      </Modal>

      {/* Club Detail */}
      <Modal isOpen={!!selectedClub} onClose={() => setSelectedClub(null)} title={selectedClub?.name || ''} size="xl">
        {selectedClub && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div><p className="text-xs text-gray-500">المؤطر</p><p className="font-medium">{selectedClub.supervisor || '—'}</p></div>
              <div><p className="text-xs text-gray-500">تاريخ التأسيس</p><p className="font-medium">{formatDate(selectedClub.creation_date)}</p></div>
            </div>
            {selectedClub.objectives && <div className="mb-6"><p className="text-xs text-gray-500 mb-1">الأهداف</p><p className="text-sm">{selectedClub.objectives}</p></div>}

            {/* Members Section */}
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">الأعضاء ({members.length})</h4>
              <Button size="sm" icon={<UserPlus className="w-3 h-3" />} onClick={() => setShowMemberForm(true)}>إضافة عضو</Button>
            </div>
            {members.length > 0 ? (
              <div className="space-y-2 mb-6">
                {members.map(m => (
                  <div key={m.member_id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{getStudentName(m.student_id)}</span>
                      <Badge className="bg-blue-100 text-blue-800">{m.role === 'leader' ? 'قائد' : m.role === 'supervisor' ? 'مؤطر' : 'عضو'}</Badge>
                    </div>
                    <button onClick={() => handleRemoveMember(m.member_id)} className="p-1 hover:bg-red-50 rounded text-red-500"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-500 mb-6">لا يوجد أعضاء</p>}

            {/* Activities Section */}
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">الأنشطة ({activities.length})</h4>
              <Button size="sm" icon={<Calendar className="w-3 h-3" />} onClick={() => setShowActivityForm(true)}>إضافة نشاط</Button>
            </div>
            {activities.length > 0 ? (
              <div className="space-y-2">
                {activities.map(a => (
                  <div key={a.activity_id} className="p-3 border border-gray-100 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{a.title}</span>
                      <span className="text-xs text-gray-400">{formatDate(a.activity_date)}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{a.description}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-500">لا توجد أنشطة</p>}
          </div>
        )}
      </Modal>

      {/* Member Form */}
      <Modal isOpen={showMemberForm} onClose={() => setShowMemberForm(false)} title="إضافة عضو" size="md">
        <div className="space-y-4">
          <FormField label="المتعلم" required>
            <SelectField value={memberForm.student_id} onChange={v => setMemberForm({...memberForm, student_id: v})} placeholder="اختر متعلم..."
              options={students.map(s => ({ value: s.student_id, label: `${s.full_name} - ${s.class}` }))} />
          </FormField>
          <FormField label="الدور">
            <SelectField value={memberForm.role} onChange={v => setMemberForm({...memberForm, role: v as any})} options={[{value:'member',label:'عضو'},{value:'leader',label:'قائد'},{value:'supervisor',label:'مؤطر'}]} />
          </FormField>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="secondary" onClick={() => setShowMemberForm(false)}>إلغاء</Button>
          <Button onClick={handleAddMember} disabled={!memberForm.student_id}>إضافة</Button>
        </div>
      </Modal>

      {/* Activity Form */}
      <Modal isOpen={showActivityForm} onClose={() => setShowActivityForm(false)} title="إضافة نشاط" size="lg">
        <div className="space-y-4">
          <FormField label="العنوان" required><Input value={activityForm.title} onChange={e => setActivityForm({...activityForm, title: e.target.value})} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="التاريخ"><Input type="date" value={activityForm.activity_date} onChange={e => setActivityForm({...activityForm, activity_date: e.target.value})} /></FormField>
            <FormField label="النوع"><Input value={activityForm.type} onChange={e => setActivityForm({...activityForm, type: e.target.value})} /></FormField>
          </div>
          <FormField label="المكان"><Input value={activityForm.location} onChange={e => setActivityForm({...activityForm, location: e.target.value})} /></FormField>
          <FormField label="الوصف"><Textarea value={activityForm.description} onChange={e => setActivityForm({...activityForm, description: e.target.value})} /></FormField>
          <FormField label="الأهداف"><Textarea value={activityForm.objectives} onChange={e => setActivityForm({...activityForm, objectives: e.target.value})} /></FormField>
          <FormField label="النتائج"><Textarea value={activityForm.results} onChange={e => setActivityForm({...activityForm, results: e.target.value})} /></FormField>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="secondary" onClick={() => setShowActivityForm(false)}>إلغاء</Button>
          <Button onClick={handleAddActivity} disabled={!activityForm.title}>حفظ</Button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!showDelete} onClose={() => setShowDelete(null)} onConfirm={() => showDelete && handleDeleteClub(showDelete)}
        title="حذف النادي" message="سيتم حذف النادي وجميع أعضائه وأنشطته. هل أنت متأكد؟" variant="danger" />
    </div>
  );
}
