import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { RefreshService } from '../refresh.service';
import { TaskService } from '../task.service';
import { MessageService } from 'primeng/api';

interface Task {
  id: number;
  description: string;
  dueDate: string;
  isCompleted: boolean;
}

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
  providers: [MessageService],
})
export class TaskComponent implements OnInit, OnDestroy {
  pendingTasks: Task[] = [];
  doneTasks: Task[] = [];
  expiredTasks: Task[] = [];

  toastDescription = '';
  inputValueDescription: string = '';
  title: string = '';
  baseUrl = 'http://localhost:8080/';

  createTaskTitle: string = 'Aufgabe erstellen: ';
  editTaskTitle: string = 'Aufgabe bearbeiten: ';
  editTaskId: number = 0;

  dateFromDatePicker: Date = new Date();
  formattedDate: string = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private refreshService: RefreshService,
    private taskService: TaskService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.title = this.createTaskTitle;
    this.refreshService.setRefresh(true);
    this.refreshService.getRefresh().subscribe((value: boolean) => {
      if (value) {
        this.getPendingTasks();
        this.getDoneTasks();
        this.getExpiredTasks();
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  getPendingTasks() {
    const today = new Date();
    this.taskService.getTasksFromApi().subscribe((data) => {
      this.pendingTasks = data.filter(
        (task) => task.isCompleted === false && new Date(task.dueDate) >= today
      );
    });
  }

  getDoneTasks() {
    this.taskService.getTasksFromApi().subscribe((data) => {
      this.doneTasks = data.filter((task) => task.isCompleted === true);
    });
  }

  getExpiredTasks() {
    const today = new Date();
    this.taskService.getTasksFromApi().subscribe((data) => {
      this.expiredTasks = data.filter((task) => new Date(task.dueDate) < today);
    });
  }

  markTaskAsCompleted(taskid: number): void {
    this.subscriptions.push(
      this.taskService.markTaskAsCompleted(taskid).subscribe({
        next: () => {
          this.refreshService.setRefresh(true);
        },
        error: (err) => {
          console.log(err);
        },
      })
    );
    this.messageService.add({
      severity: 'success',
      summary: 'Erfolgreich',
      detail: 'Aufgabe erfolgreich als erledigt markiert.',
    });
  }

  editTask(task: {
    description: string;
    dueDate: string;
    taskId: number;
  }): void {
    this.title = this.editTaskTitle;
    this.inputValueDescription = task.description;
    this.dateFromDatePicker = new Date(task.dueDate);
    this.editTaskId = task.taskId;

    this.messageService.add({
      severity: 'info',
      summary: 'Bearbeiten aktiviert',
      detail: 'Aufgabe kann jetzt UNTEN bearbeitet werden.',
    });
  }

  deleteTask(taskid: number): void {
    this.subscriptions.push(
      this.taskService.deleteTask(taskid).subscribe({
        next: () => {
          this.refreshService.setRefresh(true);
        },
        error: (err) => {
          console.log(err);
        },
      })
    );

    this.messageService.add({
      severity: 'success',
      summary: 'Erfolgreich',
      detail: 'Aufgabe erfolgreich gelöscht.',
    });
  }

  saveTask(): void {
    this.formattedDate =
      this.dateFromDatePicker.getFullYear() +
      '-' +
      this.checkNumber(this.dateFromDatePicker.getMonth() + 1) +
      '-' +
      this.checkNumber(this.dateFromDatePicker.getDate());

    if (this.title === this.createTaskTitle) {
      this.subscriptions.push(
        this.taskService
          .createTask(this.inputValueDescription, this.formattedDate)
          .subscribe({
            next: () => {
              this.refreshService.setRefresh(true);
              this.inputValueDescription = '';
              this.dateFromDatePicker = new Date();
              this.messageService.add({
                severity: 'success',
                summary: 'Erfolgreich',
                detail: 'Aufgabe erfolgreich erstellt.',
              });
            },
            error: (err) => {
              console.log(err);
              this.refreshService.setRefresh(true);
              this.inputValueDescription = '';
              this.dateFromDatePicker = new Date();
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Aufgabe konnte nicht erstellt werden!',
              });
            },
          })
      );
    } else if (this.title === this.editTaskTitle) {
      this.subscriptions.push(
        this.taskService
          .editTask(
            this.editTaskId,
            this.inputValueDescription,
            this.formattedDate
          )
          .subscribe({
            next: () => {
              this.title = this.createTaskTitle;
              this.refreshService.setRefresh(true);
              this.inputValueDescription = '';
              this.dateFromDatePicker = new Date();
              this.messageService.add({
                severity: 'success',
                summary: 'Erfolgreich',
                detail: 'Aufgabe erfolgreich bearbeitet.',
              });
            },
            error: (err) => {
              console.log(err);
              this.refreshService.setRefresh(true);
              this.inputValueDescription = '';
              this.dateFromDatePicker = new Date();
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Aufgabe konnte nicht bearbeitet werden!',
              });
            },
          })
      );
    }
  }

  checkNumber(number: number): string {
    if (number < 10) {
      return '0' + number;
    }
    return number + '';
  }
}
