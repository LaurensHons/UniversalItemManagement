import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Record } from 'src/app/core/models/record.model';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  RecordFacade,
  RecordEntities,
} from 'src/app/core/domain/store/record/record.state';
import {
  BehaviorSubject,
  filter,
  forkJoin,
  map,
  Subject,
  switchMap,
} from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-record',
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
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.scss'],
})
export class RecordComponent {
  recordId = new Subject<string>();
  form!: FormGroup;

  record?: Record;

  @Input()
  set id(id: string) {
    this.recordId.next(id);
  }

  constructor(
    private recordService: RecordFacade,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('', [Validators.required]),
      description: new FormControl(''),
    });
    this.route.paramMap
      .pipe(
        map((p) => p.get('id')),
        filter((v) => !!v),
        switchMap((v) => this.recordService.entity$(RecordEntities.Record, v!))
      )
      .subscribe((record) => {
        this.record = record;
        this.form.setValue({
          id: record.id,
          name: record.name,
          description: record.description,
        });
      });
  }

  saveRecord() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const record = new Record(this.form.value);
    this.recordService
      .updateEntity(RecordEntities.Record, record)
      .subscribe((record) => {
        this.form.reset();
      });
  }
}
