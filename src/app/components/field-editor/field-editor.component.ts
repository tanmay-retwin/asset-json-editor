import {
  Component,
  Input,
  OnInit,
  output,
  input,
  inject,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { JsonEditorService } from '../../services/json-editor.service';

@Component({
  selector: 'app-field-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './field-editor.component.html',
  styleUrls: ['./field-editor.component.scss'],
})
export class FieldEditorComponent {
  // private _field: any = {};
  // @Input()
  // set field(value: any) {
  //   this._field = value;
  //   this.initializeFieldData();
  //   // console.log('Field changed:', this.fieldName, this.fieldData);
  // }
  // get field(): any {
  //   return this._field;
  // }

  field = input<any>({});
  fieldName = input<string>('');
  section = input<string>('');
  subsection = input<string | null>(null);
  isEditing = input<boolean>(false);
  dataChanged = output<any>();

  jsonEditorService = inject(JsonEditorService);

  // Field data for editing and display
  fieldData = signal<any>({});

  // State handling
  value = signal<any>(null);
  fieldType = signal('text');
  isDropdown = signal(false);
  formattedDate = signal('');

  constructor() {
    effect(() => {
      const fieldValue = this.field();
      this.initializeFieldData(fieldValue);
    });
  }

  private initializeFieldData(fieldValue: any): void {
    this.fieldData = { ...fieldValue };

    if (
      !this.fieldData().limits &&
      (this.fieldData().datatype === 'number' ||
        this.fieldData().datatype === 'date')
    ) {
      this.fieldData().limits = { min: null, max: null };
    }

    if (!this.fieldData().dropdown && this.fieldData().datatype === 'text') {
      this.fieldData().dropdown = [];
    }

    this.value =
      this.fieldData?.().default !== undefined ? this.fieldData().default : '';
    this.fieldType = this.fieldData?.().datatype || 'text';

    this.isDropdown.set(
      !!this.fieldData?.().dropdown &&
        Array.isArray(this.fieldData().dropdown) &&
        this.fieldData().dropdown.length > 0
    );

    if (this.fieldType() === 'date' && this.value) {
      this.formattedDate.set(this.formatDateForInput(this.value()));
    }
  }

  updateFieldValue(event: Event, path: string = 'default'): void {
    if (!event || !event.target) return;

    const target = event.target as HTMLInputElement | HTMLSelectElement;
    let newValue: any = target.value;

    // Type conversion based on field type
    if (this.fieldType() === 'number') {
      newValue = target.value === '' ? null : parseFloat(target.value);
    } else if (this.fieldType() === 'boolean') {
      newValue = (target as HTMLInputElement).checked;
    }

    this.value = newValue;
    this.updateNestedValue(path, newValue);

    this.notifyValueChange(path, newValue);
  }

  private updateNestedValue(path: string, value: any): void {
    const pathArr = path.split('.');
    this.updateValueAtPath(this.fieldData, pathArr, value);
  }

  private updateValueAtPath(obj: any, path: string[], value: any): void {
    const key = path[0];
    if (path.length === 1) {
      obj[key] = value;
    } else {
      if (!obj[key]) {
        obj[key] = {};
      }
      this.updateValueAtPath(obj[key], path.slice(1), value);
    }
  }

  private notifyValueChange(path: string, value: any): void {
    const pathArr = path.split('.');

    this.jsonEditorService.updateFieldValue(
      this.section(),
      this.subsection(),
      this.fieldName(),
      pathArr,
      value
    );
  }

  updateDateField(event: Event, path: string = 'default'): void {
    if (!event || !event.target) return;

    const target = event.target as HTMLInputElement;
    const dateString = target.value;

    if (dateString) {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const isoString = date.toISOString();

        // Update the value at the specified path
        this.updateNestedValue(path, isoString);

        if (path === 'default') {
          this.value.set(isoString);
          this.formattedDate.set(dateString);
        }

        // Notify service of the change
        this.notifyValueChange(path, isoString);
      }
    }
  }

  formatDateForInput(dateStr: string | undefined): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  updateFieldData(): void {
    this.dataChanged.emit(this.fieldData);

    this.jsonEditorService.updateFieldValue(
      this.section(),
      this.subsection(),
      this.fieldName(),
      [],
      this.fieldData
    );
  }

  addDropdownOption(): void {
    if (!this.fieldData().dropdown) {
      this.fieldData().dropdown = [];
    }
    this.fieldData().dropdown.push('');
    this.updateFieldData();
  }

  removeDropdownOption(index: number): void {
    if (
      this.fieldData().dropdown &&
      index >= 0 &&
      index < this.fieldData().dropdown.length
    ) {
      this.fieldData().dropdown.splice(index, 1);
      this.updateFieldData();
    }
  }

  useTranslation(fieldKey: string = ''): string {
    return this.jsonEditorService.useTranslation(fieldKey);
  }
}
