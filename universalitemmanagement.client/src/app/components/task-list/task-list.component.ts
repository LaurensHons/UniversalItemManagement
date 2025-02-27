import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UtaskService } from 'src/app/core/services/entity.services';
import { EntityService } from 'src/app/core/services/entity.service';
import {
  TaskEntities,
  UTaskFacade,
} from 'src/app/core/domain/store/task/task.state';
import { UTask } from 'src/app/core/models/utask.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
})
export class TaskListComponent {
  public tasks: UTask[] = [];

  form!: FormGroup;
  connectionTested = false;

  editingTask: UTask | null = null;

  constructor(private taskService: UTaskFacade) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl('', [Validators.required]),
      description: new FormControl(''),
    });
    this.taskService.getEntities(TaskEntities.UTask).subscribe();
    this.taskService.entity$(TaskEntities.UTask).subscribe((tasks) => {
      this.tasks = tasks;
    });
  }

  saveTask() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const task = this.editingTask
      ? new UTask({ ...this.editingTask, ...this.form.value })
      : new UTask(this.form.value);
    this.editingTask
      ? this.taskService
          .updateEntity(TaskEntities.UTask, task)
          .subscribe((task) => {
            this.editingTask = null;
            this.form.reset();
          })
      : this.taskService.addEntity(TaskEntities.UTask, task).subscribe();
  }

  editTask(task: UTask) {
    this.editingTask = task;
    this.form.setValue({
      name: task.name,
      description: task.description,
    });
  }
}
