// ============================================================
// SANAD 1.0 - Types & Interfaces
// ============================================================

// ---- Student (المتعلم) ----
export interface Student {
  student_id: string;
  massar_code: string;
  first_name: string;
  last_name: string;
  full_name: string;
  gender: 'male' | 'female';
  date_of_birth: string;
  place_of_birth: string;
  nationality: string;
  address: string;
  phone: string;
  guardian_name: string;
  guardian_phone: string;
  cycle: string;
  level: string;
  stream: string;
  specialty: string;
  class: string;
  school_year: string;
  status: 'active' | 'archived' | 'transferred';
  created_at: string;
  updated_at: string;
}

export type StudentFormData = Omit<Student, 'student_id' | 'created_at' | 'updated_at'>;

// ---- Health Record (السجل الصحي) ----
export interface HealthRecord {
  health_id: string;
  student_id: string;
  blood_type: string;
  allergies: string;
  chronic_conditions: string;
  disabilities: string;
  medications: string;
  vaccination_notes: string;
  emergency_contact: string;
  health_notes: string;
  last_update: string;
  created_at: string;
  updated_at: string;
}

// ---- Psychological Case (الحالة النفسية) ----
export interface PsychologicalCase {
  case_id: string;
  student_id: string;
  case_date: string;
  case_type: string;
  reason: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'closed' | 'archived';
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface PsychologicalAction {
  action_id: string;
  case_id: string;
  action_date: string;
  action_type: string;
  description: string;
  result: string;
  next_step: string;
  notes: string;
  created_at: string;
}

// ---- Social Case (الحالة الاجتماعية) ----
export interface SocialCase {
  case_id: string;
  student_id: string;
  case_date: string;
  case_type: string;
  reason: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'closed' | 'archived';
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface SocialAction {
  action_id: string;
  case_id: string;
  action_date: string;
  action_type: string;
  description: string;
  result: string;
  next_step: string;
  notes: string;
  created_at: string;
}

// ---- Family Communication (التواصل مع الأسر) ----
export interface FamilyCommunication {
  communication_id: string;
  student_id: string;
  date: string;
  communication_type: 'phone_call' | 'direct_meeting' | 'summons' | 'visit' | 'correspondence' | 'other';
  contact_person: string;
  relationship: string;
  phone: string;
  subject: string;
  reason: string;
  summary: string;
  outcome: string;
  follow_up_date: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

// ---- Club (النادي) ----
export interface Club {
  club_id: string;
  name: string;
  description: string;
  creation_date: string;
  status: 'active' | 'archived';
  supervisor: string;
  objectives: string;
  created_at: string;
  updated_at: string;
}

export interface ClubMember {
  member_id: string;
  club_id: string;
  student_id: string;
  join_date: string;
  role: 'member' | 'leader' | 'supervisor';
  status: 'active' | 'inactive';
}

export interface ClubActivity {
  activity_id: string;
  club_id: string;
  title: string;
  activity_date: string;
  type: string;
  location: string;
  description: string;
  objectives: string;
  results: string;
  participants_count: number;
  notes: string;
  created_at: string;
}

// ---- Activity (النشاط) ----
export interface Activity {
  activity_id: string;
  title: string;
  activity_date: string;
  activity_type: string;
  location: string;
  organizer: string;
  objectives: string;
  description: string;
  results: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityParticipant {
  id: string;
  activity_id: string;
  student_id: string;
  role: string;
}

// ---- Health Activity (النشاط الصحي) ----
export interface HealthActivity {
  activity_id: string;
  title: string;
  activity_date: string;
  activity_type: string;
  location: string;
  organizer: string;
  partners: string;
  description: string;
  beneficiaries_count: number;
  notes: string;
  created_at: string;
}

// ---- Social Parallel Activity (النشاط الموازي الاجتماعي) ----
export interface SocialActivity {
  activity_id: string;
  title: string;
  activity_date: string;
  location: string;
  organizer: string;
  partners: string;
  target_group: string;
  beneficiaries_count: number;
  objectives: string;
  description: string;
  results: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

// ---- Import History (سجل الاستيراد) ----
export interface ImportHistory {
  import_id: string;
  import_date: string;
  file_name: string;
  total_records: number;
  new_records: number;
  updated_records: number;
  deleted_records: number;
  error_count: number;
  errors: string;
}

// ---- Settings (الإعدادات) ----
export interface Settings {
  id: string;
  institution_name: string;
  directorate: string;
  academy: string;
  specialist_name: string;
  school_year: string;
  report_header: string;
  report_logo: string;
}

// ---- Statistics ----
export interface DashboardStats {
  totalStudents: number;
  maleStudents: number;
  femaleStudents: number;
  psychologicalCases: number;
  socialCases: number;
  healthRecords: number;
  supportSessions: number;
  institutionActivities: number;
  clubs: number;
  familyCommunications: number;
}

// ---- Filter/Pagination ----
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, string>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
