import type { Activity } from '../types/Activity';
import { ACTIVITY_EMOJIS } from '../constants';

export class UIService {
  constructor(
    private readonly onDelete: (id: string) => void,
    private readonly onActivityClick: (type: string) => void
  ) {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    document.getElementById('prev-day')?.addEventListener('click', () => this.emit('prevDay'));
    document.getElementById('next-day')?.addEventListener('click', () => this.emit('nextDay'));

    const buttons = document.querySelectorAll('.activity-btn');
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        const activity = (e.currentTarget as HTMLButtonElement).dataset.activity;
        if (activity) this.onActivityClick(activity);
      });
    });
  }

  updateDateDisplay(date: Date) {
    const dateElem = document.getElementById('current-date');
    if (dateElem) {
      dateElem.textContent = date.toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }

  displayActivities(activities: Activity[]) {
    const listElement = document.getElementById('activities-list');
    if (!listElement) return;

    listElement.innerHTML = activities.map(activity => `
      <div class="activity-item">
        <span>${ACTIVITY_EMOJIS[activity.type] || ''} ${activity.type}</span>
        <button class="delete-btn" data-id="${activity.id}">❌</button>
      </div>
    `).join('');

    listElement.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        const id = btn.dataset.id;
        if (id) this.onDelete(id);
      });
    });
  }

  private eventListeners: Record<string, (() => void)[]> = {
    prevDay: [],
    nextDay: []
  };

  on(event: 'prevDay' | 'nextDay', callback: () => void) {
    this.eventListeners[event].push(callback);
  }

  private emit(event: 'prevDay' | 'nextDay') {
    this.eventListeners[event].forEach(callback => callback());
  }
}
