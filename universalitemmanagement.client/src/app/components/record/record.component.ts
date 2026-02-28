import { Component, Input } from '@angular/core';
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
import { RecordFacade } from 'src/app/core/domain/store/record/record.state';
import {
  filter,
  forkJoin,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FieldGridComponent } from '../field-grid/field-grid.component';
import { FieldPropertyFacade } from 'src/app/core/domain/store/fields/field-property.state';
import { FieldProperty } from 'src/app/core/models/field-property.model';
import { FieldFacade } from 'src/app/core/domain/store/fields/field.state';
import { Field } from 'src/app/core/models/field.model';

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
    FieldGridComponent,
  ],
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.scss'],
})
export class RecordComponent {
  recordId = new Subject<string>();
  form!: FormGroup;

  record?: Record;
  fieldPropertiesMap = new Map<string, FieldProperty>();

  @Input()
  set id(id: string) {
    this.recordId.next(id);
  }

  constructor(
    private recordService: RecordFacade,
    private route: ActivatedRoute,
    private fieldPropertyFacade: FieldPropertyFacade,
    private fieldFacade: FieldFacade
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
        switchMap((v) => this.recordService.entity$(v!)),
        tap((record) => {
          this.record = record;
          if (this.form.get('id')?.value !== record.id) {
            this.form.setValue({
              id: record.id,
              name: record.name,
              description: record.description,
            });
          }
        }),
        switchMap((record) => this.loadFieldPropertiesForRecord(record))
      )
      .subscribe();
  }

  loadFieldPropertiesForRecord(record: Record): Observable<FieldProperty[]> {
    const uniquePropertyIds = [...new Set(record.fields.map((field) => field.fieldPropertyId))];

    if (uniquePropertyIds.length === 0) {
      this.fieldPropertiesMap.clear();
      return of([]);
    }

    return this.fieldPropertyFacade.entities$().pipe(
      switchMap((propertiesInState) => {
        const propertiesInStateMap = new Map<string, FieldProperty>(
          propertiesInState.map((p) => [p.id, p])
        );

        const missingPropertyIds = uniquePropertyIds.filter(
          (id) => !propertiesInStateMap.has(id)
        );

        if (missingPropertyIds.length === 0) {
          const properties = uniquePropertyIds.map((id) => propertiesInStateMap.get(id)!);
          this.fieldPropertiesMap = new Map(
            properties.map((property) => [property.id, property])
          );
          return of(properties);
        }

        const propertyRequests = missingPropertyIds.map((propertyId) =>
          this.fieldPropertyFacade.getEntity(propertyId)
        );

        return forkJoin(propertyRequests).pipe(
          map((fetchedProperties) => {
            const allProperties = [
              ...uniquePropertyIds
                .filter((id) => propertiesInStateMap.has(id))
                .map((id) => propertiesInStateMap.get(id)!),
              ...fetchedProperties,
            ];

            this.fieldPropertiesMap = new Map(
              allProperties.map((property) => [property.id, property])
            );

            return allProperties;
          })
        );
      })
    );
  }

  saveRecord() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const record = new Record(this.form.value);
    this.recordService
      .updateEntity(record)
      .subscribe(() => {
        this.form.reset();
      });
  }

  onFieldAdded(event: { propertyId: string; x: number; y: number; width: number; height: number }): void {
    if (!this.record) return;

    const newField = new Field({
      x: event.x,
      y: event.y,
      width: event.width,
      height: event.height,
      fieldPropertyId: event.propertyId,
      fieldPropertyName: '',
      fieldPropertyType: '',
      recordId: this.record.id,
      hasValue: false
    } as Field);

    this.fieldFacade.addEntity(newField).subscribe((createdField: Field) => {
      this.addFieldToRecord(createdField);
    });
  }

  onFieldMoved(event: { fieldId: string; x: number; y: number }): void {
    if (!this.record) return;

    const field = this.record.fields.find(f => f.id === event.fieldId);
    if (!field) return;

    const updatedField = new Field({
      ...field,
      x: event.x,
      y: event.y
    } as Field);

    this.updateFieldAndRecord(updatedField);
  }

  onFieldResized(event: { fieldId: string; width: number; height: number }): void {
    if (!this.record) return;

    const field = this.record.fields.find(f => f.id === event.fieldId);
    if (!field) return;

    const updatedField = new Field({
      ...field,
      width: event.width,
      height: event.height,
    } as Field);

    this.updateFieldAndRecord(updatedField);
  }

  onFieldDeleted(fieldId: string): void {
    if (!this.record) return;

    this.fieldFacade.removeEntity(fieldId).subscribe(() => {
      this.removeFieldFromRecord(fieldId);
    });
  }

  onFieldValueChanged(updatedField: Field): void {
    if (!this.record) return;
    this.replaceFieldInRecord(updatedField);
  }

  private updateFieldAndRecord(updatedField: Field): void {
    this.fieldFacade.updateEntity(updatedField).subscribe((savedField: Field) => {
      this.replaceFieldInRecord(savedField);
    });
  }

  private addFieldToRecord(field: Field): void {
    if (!this.record) return;

    const updatedRecord = new Record({
      ...this.record,
      fields: [...this.record.fields, field]
    });

    this.recordService.updateEntity(updatedRecord).subscribe();
  }

  private replaceFieldInRecord(updatedField: Field): void {
    if (!this.record) return;

    const updatedRecord = new Record({
      ...this.record,
      fields: this.record.fields.map(f =>
        f.id === updatedField.id ? updatedField : f
      )
    });

    this.recordService.updateEntity(updatedRecord).subscribe();
  }

  private removeFieldFromRecord(fieldId: string): void {
    if (!this.record) return;

    const updatedRecord = new Record({
      ...this.record,
      fields: this.record.fields.filter(f => f.id !== fieldId)
    });

    this.recordService.updateEntity(updatedRecord).subscribe();
  }
}
