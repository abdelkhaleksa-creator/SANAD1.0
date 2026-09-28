// ============================================================
// SANAD 1.0 - Utility Functions
// ============================================================
import { v4 as uuidv4 } from 'uuid';

export function generateId(): string {
  return uuidv4();
}

export function formatDate(date: string | Date): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ar-MA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export function formatDateTime(date: string | Date): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ar-MA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

export function getSchoolYear(): string {
  const now = new Date();
  const year = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}/${year + 1}`;
}

export function getGenderLabel(gender: string): string {
  return gender === 'male' ? 'ذكر' : 'أنثى';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'نشط',
    archived: 'مؤرشف',
    transferred: 'محول',
    open: 'مفتوح',
    in_progress: 'قيد المعالجة',
    closed: 'مغلق',
    low: 'منخفض',
    medium: 'متوسط',
    high: 'مرتفع',
    urgent: 'عاجل'
  };
  return labels[status] || status;
}

export function getCommunicationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    phone_call: 'اتصال هاتفي',
    direct_meeting: 'لقاء مباشر',
    summons: 'استدعاء',
    visit: 'زيارة',
    correspondence: 'مراسلة',
    other: 'نوع آخر'
  };
  return labels[type] || type;
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    closed: 'bg-gray-100 text-gray-800',
    transferred: 'bg-purple-100 text-purple-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
