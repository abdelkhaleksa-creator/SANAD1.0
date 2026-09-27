// ============================================================
// SANAD 1.0 - Database Layer (Dexie/IndexedDB)
// ============================================================
import Dexie, { type Table } from 'dexie';
import type {
  Student, HealthRecord, PsychologicalCase, PsychologicalAction,
  SocialCase, SocialAction, FamilyCommunication, Club, ClubMember,
  ClubActivity, Activity, ActivityParticipant, HealthActivity,
  SocialActivity, ImportHistory, Settings
} from '../types';

export class SanadDatabase extends Dexie {
  students!: Table<Student, string>;
  healthRecords!: Table<HealthRecord, string>;
  psychologicalCases!: Table<PsychologicalCase, string>;
  psychologicalActions!: Table<PsychologicalAction, string>;
  socialCases!: Table<SocialCase, string>;
  socialActions!: Table<SocialAction, string>;
  familyCommunications!: Table<FamilyCommunication, string>;
  clubs!: Table<Club, string>;
  clubMembers!: Table<ClubMember, string>;
  clubActivities!: Table<ClubActivity, string>;
  activities!: Table<Activity, string>;
  activityParticipants!: Table<ActivityParticipant, string>;
  healthActivities!: Table<HealthActivity, string>;
  socialActivities!: Table<SocialActivity, string>;
  importHistory!: Table<ImportHistory, string>;
  settings!: Table<Settings, string>;

  constructor() {
    super('SanadDB');

    this.version(1).stores({
      students: 'student_id, massar_code, full_name, gender, level, class, school_year, status, [first_name+last_name]',
      healthRecords: 'health_id, student_id',
      psychologicalCases: 'case_id, student_id, case_date, status, priority',
      psychologicalActions: 'action_id, case_id, action_date',
      socialCases: 'case_id, student_id, case_date, status, priority',
      socialActions: 'action_id, case_id, action_date',
      familyCommunications: 'communication_id, student_id, date, communication_type',
      clubs: 'club_id, name, status',
      clubMembers: 'member_id, club_id, student_id, [club_id+student_id]',
      clubActivities: 'activity_id, club_id, activity_date',
      activities: 'activity_id, activity_date, activity_type',
      activityParticipants: 'id, activity_id, student_id, [activity_id+student_id]',
      healthActivities: 'activity_id, activity_date, activity_type',
      socialActivities: 'activity_id, activity_date',
      importHistory: 'import_id, import_date',
      settings: 'id'
    });
  }
}

export const db = new SanadDatabase();

// Initialize default settings
export async function initializeDatabase() {
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.add({
      id: 'default',
      institution_name: '',
      directorate: '',
      academy: '',
      specialist_name: '',
      school_year: new Date().getFullYear() + '/' + (new Date().getFullYear() + 1),
      report_header: 'المملكة المغربية - وزارة التربية الوطنية',
      report_logo: ''
    });
  }
}
