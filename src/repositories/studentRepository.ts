// ============================================================
// SANAD 1.0 - Student Repository
// ============================================================
import { db } from '../database';
import type { Student, StudentFormData, PaginatedResult, PaginationParams } from '../types';
import { generateId, getCurrentTimestamp } from '../utils';

export const studentRepository = {
  async getAll(params: PaginationParams): Promise<PaginatedResult<Student>> {
    const { page = 1, limit = 20, search = '', sortBy = 'full_name', sortOrder = 'asc', filters = {} } = params;
    
    let collection = db.students.toCollection();
    
    // Apply search
    if (search) {
      const allStudents = await db.students.toArray();
      const filtered = allStudents.filter(s => 
        s.full_name.includes(search) ||
        s.massar_code.includes(search) ||
        s.class.includes(search) ||
        s.level.includes(search)
      );
      
      // Apply filters
      let result = filtered;
      if (filters.status) result = result.filter(s => s.status === filters.status);
      if (filters.gender) result = result.filter(s => s.gender === filters.gender);
      if (filters.level) result = result.filter(s => s.level === filters.level);
      if (filters.class) result = result.filter(s => s.class === filters.class);
      
      // Sort
      result.sort((a, b) => {
        const aVal = (a as any)[sortBy] || '';
        const bVal = (b as any)[sortBy] || '';
        return sortOrder === 'asc' ? aVal.localeCompare(bVal, 'ar') : bVal.localeCompare(aVal, 'ar');
      });
      
      const total = result.length;
      const data = result.slice((page - 1) * limit, page * limit);
      
      return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    
    // Apply filters without search
    if (filters.status) collection = db.students.where('status').equals(filters.status);
    
    const allStudents = await collection.toArray();
    let filtered = allStudents;
    
    if (filters.gender) filtered = filtered.filter(s => s.gender === filters.gender);
    if (filters.level) filtered = filtered.filter(s => s.level === filters.level);
    if (filters.class) filtered = filtered.filter(s => s.class === filters.class);
    
    // Sort
    filtered.sort((a, b) => {
      const aVal = (a as any)[sortBy] || '';
      const bVal = (b as any)[sortBy] || '';
      return sortOrder === 'asc' ? aVal.localeCompare(bVal, 'ar') : bVal.localeCompare(aVal, 'ar');
    });
    
    const total = filtered.length;
    const data = filtered.slice((page - 1) * limit, page * limit);
    
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async getById(id: string): Promise<Student | undefined> {
    return db.students.get(id);
  },

  async getByMassarCode(massarCode: string): Promise<Student | undefined> {
    return db.students.where('massar_code').equals(massarCode).first();
  },

  async create(data: StudentFormData): Promise<string> {
    const now = getCurrentTimestamp();
    const student: Student = {
      ...data,
      student_id: generateId(),
      created_at: now,
      updated_at: now
    };
    await db.students.add(student);
    return student.student_id;
  },

  async update(id: string, data: Partial<StudentFormData>): Promise<void> {
    await db.students.update(id, {
      ...data,
      updated_at: getCurrentTimestamp()
    });
  },

  async delete(id: string): Promise<void> {
    await db.students.delete(id);
  },

  async archive(id: string): Promise<void> {
    await db.students.update(id, {
      status: 'archived',
      updated_at: getCurrentTimestamp()
    });
  },

  async count(): Promise<{ total: number; male: number; female: number; active: number }> {
    const all = await db.students.where('status').notEqual('archived').toArray();
    return {
      total: all.length,
      male: all.filter(s => s.gender === 'male').length,
      female: all.filter(s => s.gender === 'female').length,
      active: all.filter(s => s.status === 'active').length
    };
  },

  async getClasses(): Promise<string[]> {
    const all = await db.students.toArray();
    const classes = [...new Set(all.map(s => s.class).filter(Boolean))];
    return classes.sort((a, b) => a.localeCompare(b, 'ar'));
  },

  async getLevels(): Promise<string[]> {
    const all = await db.students.toArray();
    const levels = [...new Set(all.map(s => s.level).filter(Boolean))];
    return levels.sort((a, b) => a.localeCompare(b, 'ar'));
  },

  async bulkUpsert(students: StudentFormData[]): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;
    
    await db.transaction('rw', db.students, async () => {
      for (const data of students) {
        const existing = await db.students.where('massar_code').equals(data.massar_code).first();
        if (existing) {
          await db.students.update(existing.student_id, {
            ...data,
            updated_at: getCurrentTimestamp()
          });
          updated++;
        } else {
          const now = getCurrentTimestamp();
          await db.students.add({
            ...data,
            student_id: generateId(),
            created_at: now,
            updated_at: now
          });
          created++;
        }
      }
    });
    
    return { created, updated };
  }
};
