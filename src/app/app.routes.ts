import { Routes } from '@angular/router';
import { JsonEditorComponent } from './pages/json-editor/json-editor.component';

export const routes: Routes = [
  { path: '', component: JsonEditorComponent },
  { path: '**', redirectTo: '' }
];
