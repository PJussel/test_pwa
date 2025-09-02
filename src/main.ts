import './style.css';
import type { Activity } from './types/Activity';
import { DatabaseService } from './services/DatabaseService';
import { UIService } from './services/UIService';

class FitnessTracker {
  private currentDate: Date = new Date();
  private readonly db: DatabaseService;
  private readonly ui: UIService;

  constructor() {
    this.db = new DatabaseService();
    this.ui = new UIService(
      (id) => this.deleteActivity(id),
      (type) => this.handleActivityClick(type)
    );

    this.initialize();
  }

  private async initialize() {
    await this.db.init();
    this.setupEventListeners();
    this.updateDateDisplay();
    this.loadActivities();
  }

  private setupEventListeners() {
    this.ui.on('prevDay', () => this.changeDate(-1));
    this.ui.on('nextDay', () => this.changeDate(1));
  }

  private changeDate(days: number) {
    this.currentDate.setDate(this.currentDate.getDate() + days);
    this.updateDateDisplay();
    this.loadActivities();
  }

  private updateDateDisplay() {
    this.ui.updateDateDisplay(this.currentDate);
  }

  private async handleActivityClick(activityType: string) {
    const activity: Activity = {
      id: crypto.randomUUID(),
      type: activityType,
      date: this.currentDate.toISOString().split('T')[0]
    };
    
    await this.db.saveActivity(activity);
    this.loadActivities();
  }

  private async deleteActivity(id: string) {
    await this.db.deleteActivity(id);
    this.loadActivities();
  }

  private async loadActivities() {
    const dateString = this.currentDate.toISOString().split('T')[0];
    const activities = await this.db.getActivitiesByDate(dateString);
    this.ui.displayActivities(activities);
  }
}

// Initialize the app
new FitnessTracker();
