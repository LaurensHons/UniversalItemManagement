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

import { Record } from 'src/app/core/models/record.model';
import {
  RecordEntities,
  RecordFacade,
} from 'src/app/core/domain/store/record/record.state';

@Component({
  selector: 'app-record-list',
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
  templateUrl: './record-list.component.html',
  styleUrls: ['./record-list.component.css'],
})
export class RecordListComponent {
  public records: Record[] = [];

  form!: FormGroup;
  connectionTested = false;

  editingRecord: Record | null = null;

  constructor(private recordService: RecordFacade) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl('', [Validators.required]),
      description: new FormControl(''),
    });
    this.recordService.getEntities(RecordEntities.Record).subscribe();
    this.recordService.entity$(RecordEntities.Record).subscribe((records) => {
      this.records = records;
    });
  }

  saveRecord() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const record = this.editingRecord
      ? new Record({ ...this.editingRecord, ...this.form.value })
      : new Record(this.form.value);
    this.editingRecord
      ? this.recordService
          .updateEntity(RecordEntities.Record, record)
          .subscribe((record) => {
            this.editingRecord = null;
            this.form.reset();
          })
      : this.recordService.addEntity(RecordEntities.Record, record).subscribe();
  }

  editRecord(record: Record) {
    this.editingRecord = record;
    this.form.setValue({
      name: record.name,
      description: record.description,
    });
  }
}
