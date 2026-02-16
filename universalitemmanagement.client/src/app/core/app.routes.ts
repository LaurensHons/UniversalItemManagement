import { Routes } from '@angular/router';
import { RecordComponent } from '../components/record/record.component';
import { NewRecordComponent } from '../components/new-record/new-record.component';
import { PropertyCreatorComponent } from '../components/property-creator/property-creator.component';
import { FieldMoverComponent } from '../components/field-mover/field-mover.component';

export const routes: Routes = [
  { path: 'record/:id', component: RecordComponent },
  { path: 'new', component: NewRecordComponent },
  { path: 'property-creator', component: PropertyCreatorComponent },
  { path: 'field-mover', component: FieldMoverComponent },
];
