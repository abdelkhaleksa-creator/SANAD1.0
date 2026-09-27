// ============================================================
// SANAD 1.0 - Zustand Stores
// ============================================================
import { create } from 'zustand';
import type { Student, DashboardStats, Settings, PaginationParams } from '../types';
import { studentRepository } from '../repositories/studentRepository';
import {
  psychologicalRepository, socialRepository, healthRepository,
  communicationRepository, clubRepository, activityRepository,
  settingsRepository
} from '../repositories';

// ---- App Store ----
interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));

// ---- Students Store ----
interface StudentsState {
  students: Student[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  search: string;
  filters: Record<string, string>;
  loading: boolean;
  selectedStudent: Student | null;
  
  setSearch: (search: string) => void;
  setFilters: (filters: Record<string, string>) => void;
  setPage: (page: number) => void;
  setLoading: (loading: boolean) => void;
  setSelectedStudent: (student: Student | null) => void;
  fetchStudents: (params?: Partial<PaginationParams>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  archiveStudent: (id: string) => Promise<void>;
}

export const useStudentsStore = create<StudentsState>((set, get) => ({
  students: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
  search: '',
  filters: {},
  loading: false,
  selectedStudent: null,

  setSearch: (search) => set({ search, page: 1 }),
  setFilters: (filters) => set({ filters, page: 1 }),
  setPage: (page) => set({ page }),
  setLoading: (loading) => set({ loading }),
  setSelectedStudent: (student) => set({ selectedStudent: student }),

  fetchStudents: async (params) => {
    set({ loading: true });
    try {
      const state = get();
      const result = await studentRepository.getAll({
        page: params?.page || state.page,
        limit: params?.limit || state.limit,
        search: params?.search ?? state.search,
        filters: params?.filters || state.filters,
        sortBy: params?.sortBy || 'full_name',
        sortOrder: params?.sortOrder || 'asc',
      });
      set({
        students: result.data,
        total: result.total,
        totalPages: result.totalPages,
        page: result.page,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching students:', error);
      set({ loading: false });
    }
  },

  deleteStudent: async (id) => {
    await studentRepository.delete(id);
    await get().fetchStudents();
  },

  archiveStudent: async (id) => {
    await studentRepository.archive(id);
    await get().fetchStudents();
  },
}));

// ---- Dashboard Store ----
interface DashboardState {
  stats: DashboardStats;
  loading: boolean;
  fetchStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: {
    totalStudents: 0,
    maleStudents: 0,
    femaleStudents: 0,
    psychologicalCases: 0,
    socialCases: 0,
    healthRecords: 0,
    supportSessions: 0,
    institutionActivities: 0,
    clubs: 0,
    familyCommunications: 0,
  },
  loading: false,
  fetchStats: async () => {
    set({ loading: true });
    try {
      const [studentCount, psychCount, socialCount, healthCount, commCount, clubCount, actCount] = await Promise.all([
        studentRepository.count(),
        psychologicalRepository.count(),
        socialRepository.count(),
        healthRepository.count(),
        communicationRepository.count(),
        clubRepository.count(),
        activityRepository.count(),
      ]);
      set({
        stats: {
          totalStudents: studentCount.total,
          maleStudents: studentCount.male,
          femaleStudents: studentCount.female,
          psychologicalCases: psychCount,
          socialCases: socialCount,
          healthRecords: healthCount,
          supportSessions: psychCount + socialCount,
          institutionActivities: actCount,
          clubs: clubCount,
          familyCommunications: commCount,
        },
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      set({ loading: false });
    }
  },
}));

// ---- Settings Store ----
interface SettingsState {
  settings: Settings | null;
  loading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: Partial<Settings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  loading: false,
  fetchSettings: async () => {
    set({ loading: true });
    try {
      const settings = await settingsRepository.get();
      set({ settings, loading: false });
    } catch (error) {
      console.error('Error fetching settings:', error);
      set({ loading: false });
    }
  },
  updateSettings: async (data) => {
    await settingsRepository.update(data);
    const settings = await settingsRepository.get();
    set({ settings });
  },
}));
