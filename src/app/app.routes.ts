import { Routes } from '@angular/router';
import { JsonEditorComponent } from './components/json-editor/json-editor.component';

export const routes: Routes = [
  { path: '', component: JsonEditorComponent },
  { path: '**', redirectTo: '' }
];
