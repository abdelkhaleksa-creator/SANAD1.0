// ============================================================
// SANAD 1.0 - All Repositories
// ============================================================
import { db } from '../database';
import type {
  HealthRecord, PsychologicalCase, PsychologicalAction,
  SocialCase, SocialAction, FamilyCommunication, Club, ClubMember,
  ClubActivity, Activity, ActivityParticipant, HealthActivity,
  SocialActivity, ImportHistory, Settings
} from '../types';
import { generateId, getCurrentTimestamp } from '../utils';

// ---- Health Repository ----
export const healthRepository = {
  async getByStudentId(studentId: string): Promise<HealthRecord | undefined> {
    return db.healthRecords.where('student_id').equals(studentId).first();
  },
  async create(data: Omit<HealthRecord, 'health_id' | 'created_at' | 'updated_at'>): Promise<string> {
    const now = getCurrentTimestamp();
    const record: HealthRecord = { ...data, health_id: generateId(), created_at: now, updated_at: now };
    await db.healthRecords.add(record);
    return record.health_id;
  },
  async update(id: string, data: Partial<HealthRecord>): Promise<void> {
    await db.healthRecords.update(id, { ...data, updated_at: getCurrentTimestamp() });
  },
  async delete(id: string): Promise<void> {
    await db.healthRecords.delete(id);
  },
  async count(): Promise<number> {
    return db.healthRecords.count();
  }
};

// ---- Psychological Repository ----
export const psychologicalRepository = {
  async getAll(): Promise<PsychologicalCase[]> {
    return db.psychologicalCases.toArray();
  },
  async getByStudentId(studentId: string): Promise<PsychologicalCase[]> {
    return db.psychologicalCases.where('student_id').equals(studentId).toArray();
  },
  async getById(id: string): Promise<PsychologicalCase | undefined> {
    return db.psychologicalCases.get(id);
  },
  async create(data: Omit<PsychologicalCase, 'case_id' | 'created_at' | 'updated_at'>): Promise<string> {
    const now = getCurrentTimestamp();
    const caseItem: PsychologicalCase = { ...data, case_id: generateId(), created_at: now, updated_at: now };
    await db.psychologicalCases.add(caseItem);
    return caseItem.case_id;
  },
  async update(id: string, data: Partial<PsychologicalCase>): Promise<void> {
    await db.psychologicalCases.update(id, { ...data, updated_at: getCurrentTimestamp() });
  },
  async delete(id: string): Promise<void> {
    await db.psychologicalActions.where('case_id').equals(id).delete();
    await db.psychologicalCases.delete(id);
  },
  async count(): Promise<number> {
    return db.psychologicalCases.count();
  },
  // Actions
  async getActionsByCaseId(caseId: string): Promise<PsychologicalAction[]> {
    return db.psychologicalActions.where('case_id').equals(caseId).toArray();
  },
  async addAction(data: Omit<PsychologicalAction, 'action_id' | 'created_at'>): Promise<string> {
    const action: PsychologicalAction = { ...data, action_id: generateId(), created_at: getCurrentTimestamp() };
    await db.psychologicalActions.add(action);
    return action.action_id;
  },
  async deleteAction(id: string): Promise<void> {
    await db.psychologicalActions.delete(id);
  }
};

// ---- Social Repository ----
export const socialRepository = {
  async getAll(): Promise<SocialCase[]> {
    return db.socialCases.toArray();
  },
  async getByStudentId(studentId: string): Promise<SocialCase[]> {
    return db.socialCases.where('student_id').equals(studentId).toArray();
  },
  async getById(id: string): Promise<SocialCase | undefined> {
    return db.socialCases.get(id);
  },
  async create(data: Omit<SocialCase, 'case_id' | 'created_at' | 'updated_at'>): Promise<string> {
    const now = getCurrentTimestamp();
    const caseItem: SocialCase = { ...data, case_id: generateId(), created_at: now, updated_at: now };
    await db.socialCases.add(caseItem);
    return caseItem.case_id;
  },
  async update(id: string, data: Partial<SocialCase>): Promise<void> {
    await db.socialCases.update(id, { ...data, updated_at: getCurrentTimestamp() });
  },
  async delete(id: string): Promise<void> {
    await db.socialActions.where('case_id').equals(id).delete();
    await db.socialCases.delete(id);
  },
  async count(): Promise<number> {
    return db.socialCases.count();
  },
  async getActionsByCaseId(caseId: string): Promise<SocialAction[]> {
    return db.socialActions.where('case_id').equals(caseId).toArray();
  },
  async addAction(data: Omit<SocialAction, 'action_id' | 'created_at'>): Promise<string> {
    const action: SocialAction = { ...data, action_id: generateId(), created_at: getCurrentTimestamp() };
    await db.socialActions.add(action);
    return action.action_id;
  },
  async deleteAction(id: string): Promise<void> {
    await db.socialActions.delete(id);
  }
};

// ---- Communication Repository ----
export const communicationRepository = {
  async getAll(): Promise<FamilyCommunication[]> {
    return db.familyCommunications.toArray();
  },
  async getByStudentId(studentId: string): Promise<FamilyCommunication[]> {
    return db.familyCommunications.where('student_id').equals(studentId).toArray();
  },
  async getById(id: string): Promise<FamilyCommunication | undefined> {
    return db.familyCommunications.get(id);
  },
  async create(data: Omit<FamilyCommunication, 'communication_id' | 'created_at' | 'updated_at'>): Promise<string> {
    const now = getCurrentTimestamp();
    const comm: FamilyCommunication = { ...data, communication_id: generateId(), created_at: now, updated_at: now };
    await db.familyCommunications.add(comm);
    return comm.communication_id;
  },
  async update(id: string, data: Partial<FamilyCommunication>): Promise<void> {
    await db.familyCommunications.update(id, { ...data, updated_at: getCurrentTimestamp() });
  },
  async delete(id: string): Promise<void> {
    await db.familyCommunications.delete(id);
  },
  async count(): Promise<number> {
    return db.familyCommunications.count();
  }
};

// ---- Club Repository ----
export const clubRepository = {
  async getAll(): Promise<Club[]> {
    return db.clubs.toArray();
  },
  async getById(id: string): Promise<Club | undefined> {
    return db.clubs.get(id);
  },
  async create(data: Omit<Club, 'club_id' | 'created_at' | 'updated_at'>): Promise<string> {
    const now = getCurrentTimestamp();
    const club: Club = { ...data, club_id: generateId(), created_at: now, updated_at: now };
    await db.clubs.add(club);
    return club.club_id;
  },
  async update(id: string, data: Partial<Club>): Promise<void> {
    await db.clubs.update(id, { ...data, updated_at: getCurrentTimestamp() });
  },
  async delete(id: string): Promise<void> {
    await db.clubMembers.where('club_id').equals(id).delete();
    await db.clubActivities.where('club_id').equals(id).delete();
    await db.clubs.delete(id);
  },
  async count(): Promise<number> {
    return db.clubs.where('status').equals('active').count();
  },
  // Members
  async getMembers(clubId: string): Promise<ClubMember[]> {
    return db.clubMembers.where('club_id').equals(clubId).toArray();
  },
  async addMember(data: Omit<ClubMember, 'member_id'>): Promise<string> {
    const member: ClubMember = { ...data, member_id: generateId() };
    await db.clubMembers.add(member);
    return member.member_id;
  },
  async removeMember(id: string): Promise<void> {
    await db.clubMembers.delete(id);
  },
  // Activities
  async getActivities(clubId: string): Promise<ClubActivity[]> {
    return db.clubActivities.where('club_id').equals(clubId).toArray();
  },
  async addActivity(data: Omit<ClubActivity, 'activity_id' | 'created_at'>): Promise<string> {
    const activity: ClubActivity = { ...data, activity_id: generateId(), created_at: getCurrentTimestamp() };
    await db.clubActivities.add(activity);
    return activity.activity_id;
  },
  async deleteActivity(id: string): Promise<void> {
    await db.clubActivities.delete(id);
  }
};

// ---- Activity Repository ----
export const activityRepository = {
  async getAll(): Promise<Activity[]> {
    return db.activities.toArray();
  },
  async getById(id: string): Promise<Activity | undefined> {
    return db.activities.get(id);
  },
  async create(data: Omit<Activity, 'activity_id' | 'created_at' | 'updated_at'>): Promise<string> {
    const now = getCurrentTimestamp();
    const activity: Activity = { ...data, activity_id: generateId(), created_at: now, updated_at: now };
    await db.activities.add(activity);
    return activity.activity_id;
  },
  async update(id: string, data: Partial<Activity>): Promise<void> {
    await db.activities.update(id, { ...data, updated_at: getCurrentTimestamp() });
  },
  async delete(id: string): Promise<void> {
    await db.activityParticipants.where('activity_id').equals(id).delete();
    await db.activities.delete(id);
  },
  async getParticipants(activityId: string): Promise<ActivityParticipant[]> {
    return db.activityParticipants.where('activity_id').equals(activityId).toArray();
  },
  async addParticipant(data: Omit<ActivityParticipant, 'id'>): Promise<string> {
    const p: ActivityParticipant = { ...data, id: generateId() };
    await db.activityParticipants.add(p);
    return p.id;
  },
  async removeParticipant(id: string): Promise<void> {
    await db.activityParticipants.delete(id);
  },
  async count(): Promise<number> {
    return db.activities.count();
  }
};

// ---- Health Activity Repository ----
export const healthActivityRepository = {
  async getAll(): Promise<HealthActivity[]> {
    return db.healthActivities.toArray();
  },
  async create(data: Omit<HealthActivity, 'activity_id' | 'created_at'>): Promise<string> {
    const activity: HealthActivity = { ...data, activity_id: generateId(), created_at: getCurrentTimestamp() };
    await db.healthActivities.add(activity);
    return activity.activity_id;
  },
  async update(id: string, data: Partial<HealthActivity>): Promise<void> {
    await db.healthActivities.update(id, data);
  },
  async delete(id: string): Promise<void> {
    await db.healthActivities.delete(id);
  }
};

// ---- Social Activity Repository ----
export const socialActivityRepository = {
  async getAll(): Promise<SocialActivity[]> {
    return db.socialActivities.toArray();
  },
  async create(data: Omit<SocialActivity, 'activity_id' | 'created_at' | 'updated_at'>): Promise<string> {
    const now = getCurrentTimestamp();
    const activity: SocialActivity = { ...data, activity_id: generateId(), created_at: now, updated_at: now };
    await db.socialActivities.add(activity);
    return activity.activity_id;
  },
  async update(id: string, data: Partial<SocialActivity>): Promise<void> {
    await db.socialActivities.update(id, { ...data, updated_at: getCurrentTimestamp() });
  },
  async delete(id: string): Promise<void> {
    await db.socialActivities.delete(id);
  }
};

// ---- Import History Repository ----
export const importHistoryRepository = {
  async getAll(): Promise<ImportHistory[]> {
    return db.importHistory.orderBy('import_date').reverse().toArray();
  },
  async create(data: Omit<ImportHistory, 'import_id'>): Promise<string> {
    const record: ImportHistory = { ...data, import_id: generateId() };
    await db.importHistory.add(record);
    return record.import_id;
  }
};

// ---- Settings Repository ----
export const settingsRepository = {
  async get(): Promise<Settings | undefined> {
    return db.settings.get('default');
  },
  async update(data: Partial<Settings>): Promise<void> {
    await db.settings.update('default', data);
  }
};
