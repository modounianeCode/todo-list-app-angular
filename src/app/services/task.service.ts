import { Injectable, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { Task } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private db: Firestore | null = null;
  readonly tasks = signal<Task[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    const cfg = environment.firebase as Record<string, string>;
    if (!cfg?.['apiKey'] || cfg['apiKey'].includes('your_key_here')) {
      this.loading.set(false);
      this.error.set(
        'Firebase non configuré : colle ta config dans src/environments/environment.ts et environment.development.ts'
      );
      return;
    }
    try {
      const app = initializeApp(environment.firebase);
      this.db = getFirestore(app);
      const col = collection(this.db, 'tasks');
      onSnapshot(
        col,
        (snap) => {
          const list: Task[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Task, 'id'>),
          }));
          list.sort((a, b) => {
            const ta = this.toMillis(a.createdAt);
            const tb = this.toMillis(b.createdAt);
            return tb - ta;
          });
          this.tasks.set(list);
          this.loading.set(false);
        },
        (err) => {
          this.error.set(`Firestore erreur lecture : ${err.message}`);
          this.loading.set(false);
        }
      );
    } catch (e) {
      this.error.set(`Firebase init impossible : ${(e as Error).message}`);
      this.loading.set(false);
    }
  }

  private toMillis(v: unknown): number {
    const t = v as { toMillis?: () => number; seconds?: number } | null;
    if (!t) return 0;
    if (typeof t.toMillis === 'function') return t.toMillis();
    if (typeof t.seconds === 'number') return t.seconds * 1000;
    return 0;
  }

  private requireDb(): Firestore {
    if (!this.db) throw new Error('Firestore non initialisé');
    return this.db;
  }

  async addTask(title: string): Promise<void> {
    const clean = title.trim();
    if (!clean) return;
    await addDoc(collection(this.requireDb(), 'tasks'), {
      title: clean,
      completed: false,
      createdAt: serverTimestamp(),
    });
  }

  async toggleCompleted(task: Task): Promise<void> {
    if (!task.id) return;
    await updateDoc(doc(this.requireDb(), 'tasks', task.id), {
      completed: !task.completed,
    });
  }

  async renameTask(task: Task, newTitle: string): Promise<void> {
    const clean = newTitle.trim();
    if (!task.id || !clean) return;
    await updateDoc(doc(this.requireDb(), 'tasks', task.id), { title: clean });
  }

  async deleteTask(task: Task): Promise<void> {
    if (!task.id) return;
    await deleteDoc(doc(this.requireDb(), 'tasks', task.id));
  }
}
