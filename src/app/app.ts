import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Task } from './models/task.model';
import { TaskService } from './services/task.service';

@Component({
  imports: [FormsModule],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly service = inject(TaskService);

  readonly tasks = this.service.tasks;
  readonly loading = this.service.loading;
  readonly serviceError = this.service.error;

  readonly newTitle = signal('');
  readonly editingId = signal<string | null>(null);
  readonly editedTitle = signal('');
  readonly formError = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);

  readonly doneCount = computed(() => this.tasks().filter((t) => t.completed).length);
  readonly totalCount = computed(() => this.tasks().length);

  async add(): Promise<void> {
    this.formError.set(null);
    const title = this.newTitle().trim();
    if (!title) {
      this.formError.set('Écris un titre avant de cliquer sur Ajouter.');
      return;
    }
    try {
      await this.service.addTask(title);
      this.newTitle.set('');
    } catch (e) {
      this.formError.set(`Ajout impossible : ${(e as Error).message}`);
    }
  }

  async toggle(task: Task): Promise<void> {
    this.actionError.set(null);
    try {
      await this.service.toggleCompleted(task);
    } catch (e) {
      this.actionError.set(`Basule impossible : ${(e as Error).message}`);
    }
  }

  startEdit(task: Task): void {
    this.editingId.set(task.id ?? null);
    this.editedTitle.set(task.title);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.editedTitle.set('');
  }

  async saveEdit(task: Task): Promise<void> {
    this.actionError.set(null);
    const title = this.editedTitle().trim();
    if (!title) {
      this.actionError.set('Le nouveau titre ne peut pas être vide.');
      return;
    }
    try {
      await this.service.renameTask(task, title);
      this.cancelEdit();
    } catch (e) {
      this.actionError.set(`Modification impossible : ${(e as Error).message}`);
    }
  }

  async remove(task: Task): Promise<void> {
    this.actionError.set(null);
    try {
      await this.service.deleteTask(task);
      if (this.editingId() === task.id) this.cancelEdit();
    } catch (e) {
      this.actionError.set(`Suppression impossible : ${(e as Error).message}`);
    }
  }
}
