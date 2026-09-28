// ============================================================
// SANAD 1.0 - Students Page
// ============================================================
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Archive, Eye, Users } from 'lucide-react';
import { PageHeader, Button, SearchBar, Modal, FormField, Input, SelectField, Pagination, EmptyState, LoadingState, ConfirmDialog, Badge } from '../components';
import { useStudentsStore } from '../stores';
import { studentRepository } from '../repositories/studentRepository';
import type { StudentFormData } from '../types';
import { getGenderLabel, getStatusLabel, getStatusColor, getSchoolYear } from '../utils';

const emptyForm: StudentFormData = {
  massar_code: '', first_name: '', last_name: '', full_name: '',
  gender: 'male', date_of_birth: '', place_of_birth: '', nationality: 'مغربية',
  address: '', phone: '', guardian_name: '', guardian_phone: '',
  cycle: '', level: '', stream: '', specialty: '', class: '',
  school_year: getSchoolYear(), status: 'active'
};

export function StudentsPage() {
  const navigate = useNavigate();
  const { students, total, page, totalPages, search, loading, fetchStudents, setSearch, setPage, deleteStudent, archiveStudent } = useStudentsStore();
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<StudentFormData>(emptyForm);
  const [showDelete, setShowDelete] = useState<string | null>(null);
  const [showArchive, setShowArchive] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterGender, setFilterGender] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents, search, page]);

  useEffect(() => {
    fetchStudents({ filters: { ...(filterStatus ? { status: filterStatus } : {}), ...(filterGender ? { gender: filterGender } : {}) } });
  }, [filterStatus, filterGender]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, [setSearch]);

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = async (id: string) => {
    const student = await studentRepository.getById(id);
    if (student) {
      const { student_id, created_at, updated_at, ...formData } = student;
      setForm(formData);
      setEditingId(id);
      setShowForm(true);
    }
  };

  const handleSubmit = async () => {
    const fullName = `${form.first_name} ${form.last_name}`;
    const data = { ...form, full_name: fullName };
    
    if (editingId) {
      await studentRepository.update(editingId, data);
    } else {
      await studentRepository.create(data);
    }
    setShowForm(false);
    fetchStudents();
  };

  const handleDelete = async (id: string) => {
    await deleteStudent(id);
  };

  const handleArchive = async (id: string) => {
    await archiveStudent(id);
  };

  return (
    <div>
      <PageHeader
        title="المتعلمون"
        description={`إجمالي المتعلمين: ${total}`}
        action={
          <Button icon={<Plus className="w-4 h-4" />} onClick={openCreateForm}>
            إضافة متعلم
          </Button>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <SearchBar value={search} onChange={handleSearch} placeholder="بحث بالاسم، رقم مسار، القسم..." />
          </div>
          <SelectField
            value={filterStatus}
            onChange={setFilterStatus}
            placeholder="الحالة"
            options={[
              { value: 'active', label: 'نشط' },
              { value: 'archived', label: 'مؤرشف' },
              { value: 'transferred', label: 'محول' },
            ]}
          />
          <SelectField
            value={filterGender}
            onChange={setFilterGender}
            placeholder="الجنس"
            options={[
              { value: 'male', label: 'ذكر' },
              { value: 'female', label: 'أنثى' },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingState />
      ) : students.length === 0 ? (
        <EmptyState
          title="لا يوجد متعلمون"
          description="ابدأ بإضافة متعلم أو استيراد ملف مسار"
          icon={<Users className="w-8 h-8 text-gray-400" />}
          action={
            <Button onClick={openCreateForm} icon={<Plus className="w-4 h-4" />}>
              إضافة متعلم
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">رقم مسار</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">الاسم الكامل</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">الجنس</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">المستوى</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">القسم</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">الحالة</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map(student => (
                  <tr key={student.student_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-gray-700">{student.massar_code}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.full_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{getGenderLabel(student.gender)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{student.level}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{student.class}</td>
                    <td className="px-4 py-3">
                      <Badge className={getStatusColor(student.status)}>
                        {getStatusLabel(student.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => navigate(`/students/${student.student_id}`)}
                          className="p-1.5 hover:bg-primary-50 rounded-lg text-primary-600"
                          title="ملف المتعلم"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditForm(student.student_id)}
                          className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowArchive(student.student_id)}
                          className="p-1.5 hover:bg-yellow-50 rounded-lg text-yellow-600"
                          title="أرشفة"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDelete(student.student_id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingId ? 'تعديل بيانات المتعلم' : 'إضافة متعلم جديد'} size="xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="رقم مسار" required>
            <Input value={form.massar_code} onChange={e => setForm({...form, massar_code: e.target.value})} placeholder="مثال: A123456789" />
          </FormField>
          <FormField label="الاسم" required>
            <Input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} />
          </FormField>
          <FormField label="النسب" required>
            <Input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} />
          </FormField>
          <FormField label="الجنس" required>
            <SelectField value={form.gender} onChange={v => setForm({...form, gender: v as 'male' | 'female'})} options={[{value:'male',label:'ذكر'},{value:'female',label:'أنثى'}]} />
          </FormField>
          <FormField label="تاريخ الازدياد">
            <Input type="date" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} />
          </FormField>
          <FormField label="مكان الازدياد">
            <Input value={form.place_of_birth} onChange={e => setForm({...form, place_of_birth: e.target.value})} />
          </FormField>
          <FormField label="الجنسية">
            <Input value={form.nationality} onChange={e => setForm({...form, nationality: e.target.value})} />
          </FormField>
          <FormField label="الهاتف">
            <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </FormField>
          <FormField label="العنوان" >
            <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
          </FormField>
          <FormField label="اسم الولي">
            <Input value={form.guardian_name} onChange={e => setForm({...form, guardian_name: e.target.value})} />
          </FormField>
          <FormField label="هاتف الولي">
            <Input value={form.guardian_phone} onChange={e => setForm({...form, guardian_phone: e.target.value})} />
          </FormField>
          <FormField label="السلك">
            <Input value={form.cycle} onChange={e => setForm({...form, cycle: e.target.value})} placeholder="إعدادي / تأهيلي" />
          </FormField>
          <FormField label="المستوى">
            <Input value={form.level} onChange={e => setForm({...form, level: e.target.value})} placeholder="الأولى باك / الثانية باك..." />
          </FormField>
          <FormField label="الشعبة">
            <Input value={form.stream} onChange={e => setForm({...form, stream: e.target.value})} />
          </FormField>
          <FormField label="المسلك">
            <Input value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})} />
          </FormField>
          <FormField label="القسم">
            <Input value={form.class} onChange={e => setForm({...form, class: e.target.value})} />
          </FormField>
          <FormField label="السنة الدراسية">
            <Input value={form.school_year} onChange={e => setForm({...form, school_year: e.target.value})} />
          </FormField>
          <FormField label="الحالة">
            <SelectField value={form.status} onChange={v => setForm({...form, status: v as any})} options={[{value:'active',label:'نشط'},{value:'archived',label:'مؤرشف'},{value:'transferred',label:'محول'}]} />
          </FormField>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="secondary" onClick={() => setShowForm(false)}>إلغاء</Button>
          <Button onClick={handleSubmit} disabled={!form.massar_code || !form.first_name || !form.last_name}>
            {editingId ? 'تحديث' : 'حفظ'}
          </Button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!showDelete}
        onClose={() => setShowDelete(null)}
        onConfirm={() => showDelete && handleDelete(showDelete)}
        title="حذف المتعلم"
        message="هل أنت متأكد من حذف هذا المتعلم؟ سيتم حذف جميع البيانات المرتبطة به."
        confirmText="حذف"
        variant="danger"
      />

      {/* Archive Confirm */}
      <ConfirmDialog
        isOpen={!!showArchive}
        onClose={() => setShowArchive(null)}
        onConfirm={() => showArchive && handleArchive(showArchive)}
        title="أرشفة المتعلم"
        message="هل أنت متأكد من أرشفة هذا المتعلم؟"
        confirmText="أرشفة"
        variant="warning"
      />
    </div>
  );
}
