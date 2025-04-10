import {
  Component,
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
    effect(
      () => {
        this.initializeFieldData(this.field());
      },
      { allowSignalWrites: true }
    );
  }

  private initializeFieldData(fieldValue: any): void {
    this.fieldData.set({ ...fieldValue });

    if (
      !this.fieldData()?.limits &&
      (this.fieldData()?.datatype === 'number' ||
        this.fieldData()?.datatype === 'date')
    ) {
      this.fieldData.update((p) => ({
        ...p,
        ...{ min: null, max: null },
      }));
    }

    if (!this.fieldData()?.dropdown && this.fieldData()?.datatype === 'text') {
      this.fieldData.update((p) => ({ ...p, dropdown: [] }));
    }

    this.value.set(
      this.fieldData()?.default !== undefined ? this.fieldData()?.default : ''
    );
    this.fieldType.set(this.fieldData?.().datatype || 'text');

    this.isDropdown.set(
      !!this.fieldData()?.dropdown &&
        Array.isArray(this.fieldData().dropdown) &&
        this.fieldData()?.dropdown?.length > 0
    );

    if (this.fieldType() === 'date' && this.value()) {
      this.formattedDate.set(this.formatDateForInput(this.value()));
    }
  }

  updateFieldValue(event: Event, path: string = 'default'): void {
    if (!event || !event.target) return;

    const target = event.target as HTMLInputElement | HTMLSelectElement;
    let newValue: any = target.value;

    if (this.fieldType() === 'number') {
      newValue = target.value === '' ? null : parseFloat(target.value);
    } else if (this.fieldType() === 'boolean') {
      newValue = (target as HTMLInputElement).checked;
    }

    this.value.set(newValue);
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
    this.dataChanged.emit(this.fieldData());

    this.jsonEditorService.updateFieldValue(
      this.section(),
      this.subsection(),
      this.fieldName(),
      [],
      this.fieldData()
    );
  }

  addDropdownOption(): void {
    if (!this.fieldData()?.dropdown) {
      this.fieldData.update((p) => ({ ...p, dropdown: [] }));
    }
    this.fieldData.update((p) => ({ ...p, dropdown: [''] }));
    this.updateFieldData();
  }

  removeDropdownOption(index: number): void {
    if (
      this.fieldData()?.dropdown &&
      index >= 0 &&
      index < this.fieldData()?.dropdown?.length
    ) {
      this.fieldData.update((p) => ({
        ...p,
        dropdown: p?.dropdown?.splice(index, 1),
      }));
      this.updateFieldData();
    }
  }

  useTranslation(fieldKey: string = ''): string {
    return this.jsonEditorService.useTranslation(fieldKey);
  }

  get datatype(): string {
    return this.fieldData().datatype;
  }
  
  set datatype(value: string) {
    this.fieldData.update((p) => ({
      ...p,
      datatype: value
    }));
  }

  get default(): any {
    return this.fieldData().default;
  }
  
  set default(value: any) {
    this.fieldData.update((p) => ({
      ...p,
      default: value
    }));
  }

  get required(): boolean {
    return this.fieldData().required;
  }
  
  set required(value: boolean) {
    this.fieldData.update((p) => ({
      ...p,
      required: value
    }));
  }

  get field_name(): string {
    return this.fieldData().field_name;
  }
  
  set field_name(value: string) {
    this.fieldData.update((p) => ({
      ...p,
      field_name: value
    }));
  }

  get description(): string {
    return this.fieldData().description;
  }
  
  set description(value: string) {
    this.fieldData.update((p) => ({
      ...p,
      description: value
    }));
  }

  get limits(): { min: number, max: number } {
    return this.fieldData().limits;
  }
  
  set limits(value: { min: number, max: number }) {
    this.fieldData.update((p) => ({
      ...p,
      limits: value
    }));
  }

  get limitsMin(): number {
    return this.fieldData().limits?.min;
  }
  
  set limitsMin(value: number) {
    this.fieldData.update((p) => ({
      ...p,
      limits: { ...p.limits, min: value }
    }));
  }

  get limitsMax(): number {
    return this.fieldData().limits?.max;
  }
  
  set limitsMax(value: number) {
    this.fieldData.update((p) => ({
      ...p,
      limits: { ...p.limits, max: value }
    }));
  }

  get units(): string {
    return this.fieldData().units;
  }
  
  set units(value: string) {
    this.fieldData.update((p) => ({
      ...p,
      units: value
    }));
  }
  
  get dropdown() {
    return this.fieldData()?.dropdown || [];
  }
  
  setDropdown(index: number, value: string) {
    const current = this.fieldData();
    const updatedDropdown = [...current.dropdown];
    updatedDropdown[index] = value;
    this.fieldData.set({ ...current, dropdown: updatedDropdown });
  }
  
}
