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
import { RecordComponent } from '../record/record.component';
import { NewRecordComponent } from '../new-record/new-record.component';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';

@Component({
  selector: 'app-record-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './record-list.component.html',
  styleUrls: ['./record-list.component.scss'],
})
export class RecordListComponent {
  public records: Record[] = [];

  connectionTested = false;

  editingRecord: Record | null = null;
  newRecord = false;

  constructor(private recordService: RecordFacade, router: Router) {}

  ngOnInit(): void {
    this.recordService.getEntities(RecordEntities.Record).subscribe();
    this.recordService
      .entities$<Record>(RecordEntities.Record)
      .subscribe((records) => {
        this.records = records;
      });
  }

  editRecord(record: Record) {
    this.editingRecord = record;
    this.newRecord = false;
  }

  startNewRecord() {
    this.newRecord = true;
    this.editingRecord = null;
  }
}
