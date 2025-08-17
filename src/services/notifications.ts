export type ChannelConfig = {
  email: boolean;
  push: boolean;
  sms: boolean;
};

export type ScheduleConfig =
  | { kind: 'none' }
  | { kind: 'daily'; time: string } // '09:00'
  | { kind: 'weekly'; weekday: number; time: string } // 0-6 neděle-sobota
  | { kind: 'monthly'; day: number; time: string } // 1-28/30/31
  | { kind: 'cron'; expr: string };

export type RecipientRule =
  | { type: 'all' }
  | { type: 'role'; roleId: string }
  | { type: 'emails'; list: string[] };

export type EventTrigger =
  | { type: 'event'; eventKey: 'payroll_prepared' | 'payroll_approved' | 'payroll_paid' | 'employee_terminated' }
  | { type: 'schedule'; schedule: ScheduleConfig };

export type NotificationRule = {
  id: string;
  name: string;
  description?: string;
  channels: ChannelConfig;
  recipients: RecipientRule;
  trigger: EventTrigger;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'notificationRules';

const defaults: NotificationRule[] = [];

function load(): NotificationRule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr;
    return defaults;
  } catch {
    return defaults;
  }
}

function saveAll(items: NotificationRule[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const notificationsService = {
  getAll(): NotificationRule[] {
    return load();
  },
  create(data: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt'>): NotificationRule {
    const now = new Date().toISOString();
    const item: NotificationRule = { ...data, id: Math.random().toString(36).slice(2), createdAt: now, updatedAt: now };
    const all = load();
    saveAll([item, ...all]);
    return item;
  },
  update(id: string, patch: Partial<NotificationRule>): NotificationRule | undefined {
    const all = load();
    const idx = all.findIndex(r => r.id === id);
    if (idx === -1) return undefined;
    const now = new Date().toISOString();
    const merged = { ...all[idx], ...patch, updatedAt: now } as NotificationRule;
    all[idx] = merged;
    saveAll(all);
    return merged;
  },
  remove(id: string) {
    const all = load();
    saveAll(all.filter(r => r.id !== id));
  }
};
