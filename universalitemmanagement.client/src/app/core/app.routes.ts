import { Routes } from '@angular/router';
import { RecordComponent } from '../components/record/record.component';
import { NewRecordComponent } from '../components/new-record/new-record.component';

export const routes: Routes = [
  { path: 'record/:id', component: RecordComponent },
  { path: 'new', component: NewRecordComponent },
];
