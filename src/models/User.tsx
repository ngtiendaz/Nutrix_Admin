interface UserData {
  id?: string;
  userId?: string;
  email?: string;
  name?: string;
  age?: number | null;
  gender?: string;
  height?: number | null;
  weight?: number | null;
  activityLevel?: string;
  goal?: string;
  healthNote?: string;
  createdAt?: { toDate: () => Date } | Date | null;
}

const GOAL_MAP: Record<string, string> = {
  weight_loss: 'Giảm cân',
  muscle_gain: 'Tăng cơ',
  maintain: 'Duy trì',
};

const ACTIVITY_LEVEL_MAP: Record<string, string> = {
  sedentary: 'Ít vận động',
  light: 'Nhẹ',
  moderate: 'Vừa phải',
  active: 'Tích cực',
  very_active: 'Rất tích cực',
};

const GENDER_MAP: Record<string, string> = {
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
};

export class UserModel {
  id: string;
  userId: string;
  email: string;
  name: string;
  age: number | null;
  gender: string;
  height: number | null;
  weight: number | null;
  activityLevel: string;
  goal: string;
  healthNote: string;
  createdAt: { toDate: () => Date } | Date | null;

  constructor(data: UserData = {}) {
    this.id = data.id || '';
    this.userId = data.userId || '';
    this.email = data.email || '';
    this.name = data.name || '';
    this.age = data.age ?? null;
    this.gender = data.gender || '';
    this.height = data.height ?? null;
    this.weight = data.weight ?? null;
    this.activityLevel = data.activityLevel || '';
    this.goal = data.goal || '';
    this.healthNote = data.healthNote || '';
    this.createdAt = data.createdAt || null;
  }

  get displayGoal(): string {
    return GOAL_MAP[this.goal] || this.goal;
  }

  get displayActivityLevel(): string {
    return ACTIVITY_LEVEL_MAP[this.activityLevel] || this.activityLevel;
  }

  get displayGender(): string {
    return GENDER_MAP[this.gender] || this.gender;
  }

  get displayCreatedAt(): string {
    if (!this.createdAt) return '—';
    try {
      if (typeof this.createdAt === 'object' && typeof (this.createdAt as any).toDate === 'function') {
        return (this.createdAt as any).toDate().toLocaleDateString('vi-VN');
      }
      const date = new Date(this.createdAt as any);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('vi-VN');
      }
    } catch (e) {
      console.error(e);
    }
    return '—';
  }
}
