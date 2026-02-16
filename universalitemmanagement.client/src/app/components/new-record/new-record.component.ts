import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  RecordEntities,
  RecordFacade,
} from 'src/app/core/domain/store/record/record.state';
import { Record } from 'src/app/core/models/record.model';

@Component({
  selector: 'app-new-record',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './new-record.component.html',
  styleUrls: ['./new-record.component.scss'],
})
export class NewRecordComponent {
  constructor(
    private recordService: RecordFacade,
    private router: Router
  ) {}
  form!: FormGroup;

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl('', [Validators.required]),
      description: new FormControl(''),
    });
  }

  saveRecord() {
    let record = new Record({ ...this.form.value });
    this.recordService
      .addEntity(record)
      .subscribe(() => {
        this.form.reset();
      });
  }

  navigateToPropertyCreator(): void {
    this.router.navigate(['/property-creator']);
  }

  ngOnDestroy(): void {
    this.form.reset();
  }
}
