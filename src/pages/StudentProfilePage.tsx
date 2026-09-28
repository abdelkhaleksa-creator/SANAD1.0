// ============================================================
// SANAD 1.0 - Student Profile Page
// ============================================================
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Brain, Heart, Stethoscope, Phone, Palette, Users, FileText, ArrowRight } from 'lucide-react';
import { Card, Tabs, Badge, LoadingState, Button } from '../components';
import { studentRepository } from '../repositories/studentRepository';
import { psychologicalRepository, socialRepository, healthRepository, communicationRepository, clubRepository } from '../repositories';
import type { Student, PsychologicalCase, SocialCase, HealthRecord, FamilyCommunication } from '../types';
import { getGenderLabel, formatDate, getStatusLabel, getStatusColor, getPriorityColor, getCommunicationTypeLabel } from '../utils';

export function StudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [psychCases, setPsychCases] = useState<PsychologicalCase[]>([]);
  const [socialCases, setSocialCases] = useState<SocialCase[]>([]);
  const [healthRecord, setHealthRecord] = useState<HealthRecord | null>(null);
  const [communications, setCommunications] = useState<FamilyCommunication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    const [s, psych, social, health, comms] = await Promise.all([
      studentRepository.getById(id),
      psychologicalRepository.getByStudentId(id),
      socialRepository.getByStudentId(id),
      healthRepository.getByStudentId(id),
      communicationRepository.getByStudentId(id),
    ]);
    setStudent(s || null);
    setPsychCases(psych);
    setSocialCases(social);
    setHealthRecord(health || null);
    setCommunications(comms);
    setLoading(false);
  };

  if (loading) return <LoadingState />;
  if (!student) return <div className="text-center py-12 text-gray-500">المتعلم غير موجود</div>;

  const tabs = [
    { id: 'general', label: 'البيانات العامة', icon: <User className="w-4 h-4" /> },
    { id: 'psychological', label: 'النفسية', icon: <Brain className="w-4 h-4" /> },
    { id: 'social', label: 'الاجتماعية', icon: <Heart className="w-4 h-4" /> },
    { id: 'health', label: 'الصحية', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'family', label: 'الأسرة', icon: <Phone className="w-4 h-4" /> },
    { id: 'clubs', label: 'الأندية', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/students')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowRight className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{student.full_name}</h1>
          <p className="text-sm text-gray-500">رقم مسار: {student.massar_code} | {student.class} - {student.level}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'general' && (
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoField label="رقم مسار" value={student.massar_code} />
              <InfoField label="الاسم الكامل" value={student.full_name} />
              <InfoField label="الجنس" value={getGenderLabel(student.gender)} />
              <InfoField label="تاريخ الازدياد" value={formatDate(student.date_of_birth)} />
              <InfoField label="مكان الازدياد" value={student.place_of_birth} />
              <InfoField label="الجنسية" value={student.nationality} />
              <InfoField label="العنوان" value={student.address} />
              <InfoField label="الهاتف" value={student.phone} />
              <InfoField label="اسم الولي" value={student.guardian_name} />
              <InfoField label="هاتف الولي" value={student.guardian_phone} />
              <InfoField label="السلك" value={student.cycle} />
              <InfoField label="المستوى" value={student.level} />
              <InfoField label="الشعبة" value={student.stream} />
              <InfoField label="المسلك" value={student.specialty} />
              <InfoField label="القسم" value={student.class} />
              <InfoField label="السنة الدراسية" value={student.school_year} />
              <InfoField label="الحالة" value={getStatusLabel(student.status)} />
            </div>
          </Card>
        )}

        {activeTab === 'psychological' && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">الحالات النفسية</h3>
              <Button size="sm" onClick={() => navigate(`/psychological?student=${id}`)}>إضافة حالة</Button>
            </div>
            {psychCases.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">لا توجد حالات نفسية مسجلة</p>
            ) : (
              <div className="space-y-3">
                {psychCases.map(c => (
                  <div key={c.case_id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{c.case_type}</span>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(c.priority)}>{getStatusLabel(c.priority)}</Badge>
                        <Badge className={getStatusColor(c.status)}>{getStatusLabel(c.status)}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{c.description}</p>
                    <p className="text-xs text-gray-400 mt-2">{formatDate(c.case_date)}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'social' && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">الحالات الاجتماعية</h3>
              <Button size="sm" onClick={() => navigate(`/social?student=${id}`)}>إضافة حالة</Button>
            </div>
            {socialCases.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">لا توجد حالات اجتماعية مسجلة</p>
            ) : (
              <div className="space-y-3">
                {socialCases.map(c => (
                  <div key={c.case_id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{c.case_type}</span>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(c.priority)}>{getStatusLabel(c.priority)}</Badge>
                        <Badge className={getStatusColor(c.status)}>{getStatusLabel(c.status)}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{c.description}</p>
                    <p className="text-xs text-gray-400 mt-2">{formatDate(c.case_date)}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'health' && (
          <Card>
            <h3 className="text-lg font-semibold mb-4">السجل الصحي</h3>
            {healthRecord ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="فصيلة الدم" value={healthRecord.blood_type} />
                <InfoField label="الحساسية" value={healthRecord.allergies} />
                <InfoField label="أمراض مزمنة" value={healthRecord.chronic_conditions} />
                <InfoField label="إعاقات" value={healthRecord.disabilities} />
                <InfoField label="أدوية" value={healthRecord.medications} />
                <InfoField label="ملاحظات" value={healthRecord.health_notes} />
                <InfoField label="آخر تحديث" value={formatDate(healthRecord.last_update)} />
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">لا يوجد سجل صحي. يمكن إضافته من وحدة الصحة المدرسية.</p>
            )}
          </Card>
        )}

        {activeTab === 'family' && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">سجل التواصل مع الأسرة</h3>
              <Button size="sm" onClick={() => navigate(`/family?student=${id}`)}>إضافة تواصل</Button>
            </div>
            {communications.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">لا توجد عمليات تواصل مسجلة</p>
            ) : (
              <div className="space-y-3">
                {communications.map(c => (
                  <div key={c.communication_id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{c.subject}</span>
                      <Badge className="bg-blue-100 text-blue-800">{getCommunicationTypeLabel(c.communication_type)}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{c.summary}</p>
                    <p className="text-xs text-gray-400 mt-2">{formatDate(c.date)} | {c.contact_person}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'clubs' && (
          <Card>
            <h3 className="text-lg font-semibold mb-4">الأندية</h3>
            <p className="text-gray-500 text-sm text-center py-8">سيتم عرض الأندية المنتمي إليها المتعلم هنا</p>
          </Card>
        )}
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value || '—'}</p>
    </div>
  );
}
