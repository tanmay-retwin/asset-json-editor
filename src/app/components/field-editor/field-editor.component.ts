import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { JsonEditorService } from '../../services/json-editor.service';

@Component({
  selector: 'app-field-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './field-editor.component.html',
  styleUrls: ['./field-editor.component.scss']
})
export class FieldEditorComponent implements OnInit, OnChanges {
  @Input() field: any = {};
  @Input() fieldName: string = '';
  @Input() section: string = '';
  @Input() subsection: string | null = null;
  @Input() isEditing: boolean = false;
  @Output() dataChanged = new EventEmitter<any>();

  // Field data for editing and display
  fieldData: any = {};

  // State handling
  value: any;
  fieldType: string = 'text';
  isDropdown: boolean = false;
  formattedDate: string = '';
  
  constructor(
    private jsonEditorService: JsonEditorService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeFieldData();
    console.log('Field initialized:', this.fieldName, this.fieldData);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['field']) {
      this.initializeFieldData();
      console.log('Field changed:', this.fieldName, this.fieldData);
    }
  }

  private initializeFieldData(): void {
    // Initialize fieldData from input field
    this.fieldData = { ...this.field };
    
    // Initialize limits and dropdown if not present
    if (!this.fieldData.limits && (this.fieldData.datatype === 'number' || this.fieldData.datatype === 'date')) {
      this.fieldData.limits = { min: null, max: null };
    }
    
    if (!this.fieldData.dropdown && this.fieldData.datatype === 'text') {
      this.fieldData.dropdown = [];
    }
    
    // Set field value and type
    this.value = this.fieldData?.default !== undefined ? this.fieldData.default : '';
    this.fieldType = this.fieldData?.datatype || 'text';
    
    // Check if it's a dropdown
    this.isDropdown = !!this.fieldData?.dropdown && Array.isArray(this.fieldData.dropdown) && this.fieldData.dropdown.length > 0;

    // Format date if it's a date field
    if (this.fieldType === 'date' && this.value) {
      this.formattedDate = this.formatDateForInput(this.value);
    }
  }

  /**
   * Updates field value and notifies the parent service
   */
  updateFieldValue(event: Event, path: string = 'default'): void {
    if (!event || !event.target) return;
    
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    let newValue: any = target.value;

    // Type conversion based on field type
    if (this.fieldType === 'number') {
      newValue = target.value === '' ? null : parseFloat(target.value);
    } else if (this.fieldType === 'boolean') {
      newValue = (target as HTMLInputElement).checked;
    }

    // Update the value at the specified path
    this.value = newValue;
    this.updateNestedValue(path, newValue);
    
    // Notify service of the change
    this.notifyValueChange(path, newValue);
  }

  /**
   * Updates a value at a specific path in the fieldData object
   */
  private updateNestedValue(path: string, value: any): void {
    const pathArr = path.split('.');
    this.updateValueAtPath(this.fieldData, pathArr, value);
  }

  /**
   * Updates a value at a specific path in an object
   */
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

  /**
   * Notifies the service of a value change
   */
  private notifyValueChange(path: string, value: any): void {
    const pathArr = path.split('.');
    
    this.jsonEditorService.updateFieldValue(
      this.section,
      this.subsection,
      this.fieldName,
      pathArr,
      value
    );
  }

  /**
   * Updates date field with proper formatting
   */
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
          this.value = isoString;
          this.formattedDate = dateString;
        }
        
        // Notify service of the change
        this.notifyValueChange(path, isoString);
      }
    }
  }

  /**
   * Format date for input field (YYYY-MM-DD)
   */
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

  /**
   * Check if a value is an array
   */
  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  /**
   * Update field data and emit change event
   */
  updateFieldData(): void {
    // Emit data changed event
    this.dataChanged.emit(this.fieldData);
    
    // Update the service with the full field data
    this.jsonEditorService.updateFieldValue(
      this.section,
      this.subsection,
      this.fieldName,
      [],
      this.fieldData
    );
  }

  /**
   * Add a new dropdown option
   */
  addDropdownOption(): void {
    if (!this.fieldData.dropdown) {
      this.fieldData.dropdown = [];
    }
    this.fieldData.dropdown.push('');
    this.updateFieldData();
  }

  /**
   * Remove a dropdown option
   */
  removeDropdownOption(index: number): void {
    if (this.fieldData.dropdown && index >= 0 && index < this.fieldData.dropdown.length) {
      this.fieldData.dropdown.splice(index, 1);
      this.updateFieldData();
    }
  }
}
