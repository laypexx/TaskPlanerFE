import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RefreshService } from '../refresh.service';

interface Task {
  id: number;
  description: string;
  dueDate: string;
  isCompleted: boolean;
}

@Component({
  selector: 'app-tasklist',
  templateUrl: './tasklist.component.html',
  styleUrls: ['./tasklist.component.css'],
})
export class TasklistComponent {
  baseUrl: string = 'http://localhost:8080/';

  @Input() tasks: Task[] = [];
  @Input() showMarkAsCompletedButton: boolean = true;
  @Input() showEditButton: boolean = true;
  @Input() accordionClosed: boolean = false;

  @Output() markTaskAsCompleted = new EventEmitter<number>();
  @Output() editTask = new EventEmitter<any>();
  @Output() deleteTask = new EventEmitter<number>();

  constructor(
    private httpClient: HttpClient,
    private refreshService: RefreshService
  ) {}

  markAsCompleted(taskid: number): void {
    this.markTaskAsCompleted.emit(taskid);
    this.refreshService.setRefresh(true);
  }

  edit(description: string, dueDate: string, taskId: number): void {
    this.editTask.emit({ description, dueDate, taskId });
  }

  delete(taskid: number): void {
    this.deleteTask.emit(taskid);
    this.refreshService.setRefresh(true);
  }
}
