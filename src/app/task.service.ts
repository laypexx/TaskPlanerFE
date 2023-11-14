import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

interface Task {
  id: number;
  description: string;
  dueDate: string;
  isCompleted: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  baseUrl: string = 'http://localhost:8080/';
  pendingTasks: Task[] = [];

  constructor(private httpClient: HttpClient) {}

  getTasksFromApi(): Observable<Task[]> {
    return this.httpClient.get<Task[]>(this.baseUrl + 'tasks/getAllTasks');
  }

  markTaskAsCompleted(taskid: number): Observable<any> {
    const configUrl = this.baseUrl + 'tasks/completeTask/' + taskid;
    return this.httpClient.put(configUrl, null);
  }

  deleteTask(taskid: number): Observable<any> {
    const configUrl = this.baseUrl + 'tasks/deleteTask/' + taskid;
    return this.httpClient.delete(configUrl);
  }

  createTask(taskDescription: string, taskDate: string): Observable<any> {
    const configUrl = this.baseUrl + 'tasks/createTask';
    return this.httpClient.post(configUrl, {
      description: taskDescription,
      dueDate: taskDate,
    });
  }

  editTask(
    taskid: number,
    taskDescription: string,
    taskDate: string
  ): Observable<any> {
    const configUrl = this.baseUrl + 'tasks/updateTask/' + taskid;
    return this.httpClient.put(configUrl, {
      description: taskDescription,
      dueDate: taskDate,
    });
  }
}
