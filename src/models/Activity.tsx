interface ActivityData {
  id?: string;
  name?: string;
  metValue?: number;
  icon?: string;
}

export class ActivityModel {
  id: string;
  name: string;
  metValue: number;
  icon: string;

  constructor(data: ActivityData = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.metValue = data.metValue ?? 0;
    this.icon = data.icon || '';
  }

  get displayMetValue(): string {
    return this.metValue.toFixed(1);
  }
}
