import './style.css'

interface Activity {
  id: string;
  type: string;
  date: string;
}

class FitnessTracker {
  private currentDate: Date = new Date();
  private db: IDBDatabase | null = null;

  constructor() {
    this.initializeDB();
    this.setupEventListeners();
    this.updateDateDisplay();
  }

  private initializeDB() {
    const request = indexedDB.open('FitnessTrackerDB', 1);

    request.onerror = () => {
      console.error('Error opening database');
    };

    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
      this.loadActivities();
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const store = db.createObjectStore('activities', { keyPath: 'id' });
      store.createIndex('date', 'date', { unique: false });
    };
  }

  private setupEventListeners() {
    document.getElementById('prev-day')?.addEventListener('click', () => this.changeDate(-1));
    document.getElementById('next-day')?.addEventListener('click', () => this.changeDate(1));

    const buttons = document.querySelectorAll('.activity-btn');
    buttons.forEach(button => {
      button.addEventListener('click', (e) => this.handleActivityClick(e));
    });
  }

  private changeDate(days: number) {
    this.currentDate.setDate(this.currentDate.getDate() + days);
    this.updateDateDisplay();
    this.loadActivities();
  }

  private updateDateDisplay() {
    const dateElem = document.getElementById('current-date');
    if (dateElem) {
      dateElem.textContent = this.currentDate.toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }

  private handleActivityClick(event: Event) {
    const button = event.currentTarget as HTMLButtonElement;
    const activity = button.dataset.activity;
    
    if (activity) {
      this.saveActivity({
        id: crypto.randomUUID(),
        type: activity,
        date: this.currentDate.toISOString().split('T')[0]
      });
    }
  }

  private saveActivity(activity: Activity) {
    if (!this.db) return;

    const transaction = this.db.transaction(['activities'], 'readwrite');
    const store = transaction.objectStore('activities');
    
    store.add(activity);
    transaction.oncomplete = () => {
      this.loadActivities();
    };
  }

  private deleteActivity(id: string) {
    if (!this.db) return;

    const transaction = this.db.transaction(['activities'], 'readwrite');
    const store = transaction.objectStore('activities');
    
    store.delete(id);
    transaction.oncomplete = () => {
      this.loadActivities();
    };
  }

  private loadActivities() {
    if (!this.db) return;

    const transaction = this.db.transaction(['activities'], 'readonly');
    const store = transaction.objectStore('activities');
    const dateIndex = store.index('date');
    
    const dateString = this.currentDate.toISOString().split('T')[0];
    const request = dateIndex.getAll(dateString);

    request.onsuccess = () => {
      this.displayActivities(request.result);
    };
  }

  private readonly activityEmojis: { [key: string]: string } = {
    biking: '🚲',
    mountainbiking: '🚵',
    hiking: '🏃‍♂️',
    fitness: '💪',
    skating: '⛸️',
    hockey: '🏒',
    walking: '🚶‍♂️'
  };

  private displayActivities(activities: Activity[]) {
    const listElement = document.getElementById('activities-list');
    if (!listElement) return;

    listElement.innerHTML = activities.map(activity => `
      <div class="activity-item">
        <span>${this.activityEmojis[activity.type] || ''} ${activity.type}</span>
        <button class="delete-btn" data-id="${activity.id}">❌</button>
      </div>
    `).join('');

    // Event-Listener für Delete-Buttons
    listElement.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        const id = btn.dataset.id;
        if (id) this.deleteActivity(id);
      });
    });
  }
}

// Initialize the app
new FitnessTracker();
