import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { FieldEditorComponent } from '../field-editor/field-editor.component';
import { JsonEditorService } from '../../services/json-editor.service';

@Component({
  selector: 'app-json-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FileUploadComponent,
    FieldEditorComponent,
  ],
  templateUrl: './json-editor.component.html',
  styleUrls: ['./json-editor.component.scss'],
})
export class JsonEditorComponent implements OnInit {
  // File upload state
  fileUploaded = false;

  // Tab management
  sections: string[] = [];
  activeSection: string = '';

  // Field management
  currentFields: any = {};
  
  // Form states
  showAddSectionForm: boolean = false;
  showAddFieldForm: boolean = false;
  isEditMode: boolean = false;
  editingFieldName: string = '';
  
  // Reactive forms
  sectionForm!: FormGroup;
  fieldForm!: FormGroup;

  constructor(
    private jsonEditorService: JsonEditorService,
    private fb: FormBuilder
  ) {
    this.initForms();
  }

  initForms(): void {
    // Section form
    this.sectionForm = this.fb.group({
      sectionName: ['', Validators.required]
    });

    // Field form
    this.fieldForm = this.fb.group({
      fieldName: ['', Validators.required],
      fieldType: ['text'],
      displayName: [''],
      description: [''],
      units: [''],
      isRequired: [false],
      isDropdown: [false],
      
      // Type-specific controls
      defaultValue: [''],
      
      // Number limits
      minValue: [null],
      maxValue: [null],
      
      // Date limits
      minDate: [''],
      maxDate: [''],
      
      // Dropdown options
      dropdownOptions: this.fb.array([this.createDropdownOption()])
    });

    // Listen for changes to update form conditionally
    this.fieldForm.get('fieldType')?.valueChanges.subscribe(type => {
      this.onFieldTypeChange(type);
    });

    this.fieldForm.get('isDropdown')?.valueChanges.subscribe(isDropdown => {
      this.onDropdownToggle(isDropdown);
    });
  }

  createDropdownOption() {
    return this.fb.control('');
  }

  get dropdownOptions() {
    return this.fieldForm.get('dropdownOptions') as FormArray;
  }

  addDropdownOption() {
    this.dropdownOptions.push(this.createDropdownOption());
  }

  removeDropdownOption(index: number) {
    if (this.dropdownOptions.length > 1) {
      this.dropdownOptions.removeAt(index);
    }
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  ngOnInit(): void {
    this.jsonEditorService.jsonData$.subscribe((data) => {
      if (data) {
        this.fileUploaded = true;
        this.loadSections();
      }
    });
  }

  loadSections(): void {
    this.sections = this.jsonEditorService.getSections();
    if (this.sections.length > 0 && !this.activeSection) {
      this.selectSection(this.sections[0]);
    }
  }

  selectSection(section: string): void {
    this.activeSection = section;
    this.loadSectionFields(section);
    this.showAddFieldForm = false;
    this.showAddSectionForm = false;
  }

  loadSectionFields(section: string): void {
    this.currentFields = this.jsonEditorService.getFieldsInSection(section);
  }

  toggleAddSectionForm(): void {
    this.showAddSectionForm = !this.showAddSectionForm;
    this.showAddFieldForm = false;
    
    if (this.showAddSectionForm) {
      this.sectionForm.reset({ sectionName: '' });
    }
  }

  addNewSection(): void {
    if (this.sectionForm.invalid) {
      return;
    }

    const sectionName = this.sectionForm.get('sectionName')?.value;
    
    if (!sectionName || sectionName.trim().length === 0) {
      return;
    }

    const currentData = this.jsonEditorService.getJsonData();
    if (!currentData.sections[sectionName]) {
      currentData.sections[sectionName] = {};
      this.jsonEditorService.setJsonData(currentData);
      this.loadSections();
      this.selectSection(sectionName);
      this.showAddSectionForm = false;
      this.sectionForm.reset();
    }
  }

  toggleAddFieldForm(): void {
    this.showAddFieldForm = !this.showAddFieldForm;
    this.showAddSectionForm = false;
    this.isEditMode = false;
    
    if (this.showAddFieldForm) {
      this.fieldForm.reset({
        fieldType: 'text',
        isRequired: false,
        isDropdown: false
      });
      
      // Reset dropdown options
      this.resetDropdownOptions();
    }
  }
  
  resetDropdownOptions(): void {
    while (this.dropdownOptions.length) {
      this.dropdownOptions.removeAt(0);
    }
    this.dropdownOptions.push(this.createDropdownOption());
  }
  
  onFieldTypeChange(type: string): void {
    // Reset type-specific values when type changes
    const defaultValueControl = this.fieldForm.get('defaultValue');
    
    if (type === 'text') {
      defaultValueControl?.setValue('');
    } else if (type === 'number') {
      defaultValueControl?.setValue(0);
      this.fieldForm.get('minValue')?.setValue(null);
      this.fieldForm.get('maxValue')?.setValue(null);
    } else if (type === 'date') {
      defaultValueControl?.setValue(new Date().toISOString().split('T')[0]);
      this.fieldForm.get('minDate')?.setValue('');
      this.fieldForm.get('maxDate')?.setValue('');
    } else if (type === 'boolean') {
      defaultValueControl?.setValue(false);
      
      // Disable dropdown for boolean type
      this.fieldForm.get('isDropdown')?.setValue(false);
    }
    
    // Reset dropdown if changing type from text to something else
    if (type !== 'text') {
      this.fieldForm.get('isDropdown')?.setValue(false);
    }
  }
  
  onDropdownToggle(isDropdown: boolean): void {
    if (isDropdown && this.dropdownOptions.length === 0) {
      this.dropdownOptions.push(this.createDropdownOption());
    }
  }
  
  editField(fieldName: string): void {
    const field = this.currentFields[fieldName];
    if (!field) return;
    
    this.isEditMode = true;
    this.editingFieldName = fieldName;
    this.showAddFieldForm = false; // First close the form, we'll open it in the field-editor
    
    // Reset dropdown options
    this.resetDropdownOptions();
    
    // Populate form with field data
    const isDropdown = !!field.dropdown && Array.isArray(field.dropdown);
    
    this.fieldForm.patchValue({
      fieldName: fieldName,
      fieldType: field.datatype || 'text',
      displayName: field.field_name || fieldName,
      description: field.description || '',
      units: field.units || '',
      isRequired: !!field.required,
      isDropdown: isDropdown,
      defaultValue: field.default !== undefined ? field.default : ''
    });
    
    // Handle type-specific fields
    if (field.datatype === 'number' && field.limits) {
      this.fieldForm.patchValue({
        minValue: field.limits.min !== undefined ? field.limits.min : null,
        maxValue: field.limits.max !== undefined ? field.limits.max : null
      });
    } else if (field.datatype === 'date' && field.limits) {
      // Convert ISO dates to YYYY-MM-DD format for date inputs
      const minDate = field.limits.min ? new Date(field.limits.min).toISOString().split('T')[0] : '';
      const maxDate = field.limits.max ? new Date(field.limits.max).toISOString().split('T')[0] : '';
      
      this.fieldForm.patchValue({
        minDate: minDate,
        maxDate: maxDate
      });
    }
    
    // Handle dropdown options
    if (isDropdown && field.dropdown.length > 0) {
      // Clear the default form array
      while (this.dropdownOptions.length) {
        this.dropdownOptions.removeAt(0);
      }
      
      // Add each option
      field.dropdown.forEach((option: string) => {
        this.dropdownOptions.push(this.fb.control(option));
      });
    }
    
    // Wait for the next tick to ensure the DOM has updated
    setTimeout(() => {
      // Find the field element and scroll to it
      const fieldElement = document.querySelector(`.field-item[data-field-name="${fieldName}"]`);
      if (fieldElement) {
        fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  saveField(): void {
    if (this.fieldForm.invalid) {
      return;
    }

    const formValues = this.fieldForm.value;
    const fieldName = formValues.fieldName;
    
    if (!fieldName || fieldName.trim().length === 0 || !this.activeSection) {
      return;
    }

    // Create the field template based on the form values
    const fieldTemplate: any = {
      datatype: formValues.fieldType,
      required: formValues.isRequired,
      field_name: formValues.displayName || formValues.fieldName,
      description: formValues.description || '',
    };
    
    // Add units if provided
    if (formValues.units) {
      fieldTemplate.units = formValues.units;
    }
    
    // Add default value based on type
    if (formValues.fieldType === 'number') {
      fieldTemplate.default = formValues.defaultValue !== '' 
        ? parseFloat(formValues.defaultValue) 
        : 0;
      
      // Add limits if provided
      if (formValues.minValue !== null || formValues.maxValue !== null) {
        fieldTemplate.limits = {};
        if (formValues.minValue !== null) {
          fieldTemplate.limits.min = formValues.minValue;
        }
        if (formValues.maxValue !== null) {
          fieldTemplate.limits.max = formValues.maxValue;
        }
      }
    } else if (formValues.fieldType === 'date') {
      // Convert date to ISO string
      if (formValues.defaultValue) {
        const date = new Date(formValues.defaultValue);
        fieldTemplate.default = date.toISOString();
      } else {
        fieldTemplate.default = new Date().toISOString();
      }
      
      // Add date limits if provided
      if (formValues.minDate || formValues.maxDate) {
        fieldTemplate.limits = {};
        if (formValues.minDate) {
          const minDate = new Date(formValues.minDate);
          fieldTemplate.limits.min = minDate.toISOString();
        }
        if (formValues.maxDate) {
          const maxDate = new Date(formValues.maxDate);
          fieldTemplate.limits.max = maxDate.toISOString();
        }
      }
    } else if (formValues.fieldType === 'boolean') {
      fieldTemplate.default = !!formValues.defaultValue;
    } else {
      // Text type
      fieldTemplate.default = formValues.defaultValue || '';
      
      // Add dropdown options if it's a dropdown
      if (formValues.isDropdown && formValues.dropdownOptions.length > 0) {
        // Filter out empty options
        const validOptions = formValues.dropdownOptions.filter((opt: string) => opt.trim() !== '');
        if (validOptions.length > 0) {
          fieldTemplate.dropdown = validOptions;
          // Set default to first option if not set
          if (!fieldTemplate.default) {
            fieldTemplate.default = validOptions[0];
          }
        }
      }
    }

    if (this.isEditMode) {
      // If we're editing, delete the old field first
      this.jsonEditorService.deleteField(this.activeSection, null, this.editingFieldName);
    }
    
    // Add the new or updated field
    this.jsonEditorService.addField(
      this.activeSection,
      null,
      fieldName,
      fieldTemplate
    );
    
    this.loadSectionFields(this.activeSection);
    this.showAddFieldForm = false;
    this.isEditMode = false;
    this.editingFieldName = '';
  }

  deleteField(fieldName: string): void {
    if (confirm(`Are you sure you want to delete field "${fieldName}"?`)) {
      this.jsonEditorService.deleteField(this.activeSection, null, fieldName);
      this.loadSectionFields(this.activeSection);
    }
  }

  deleteSection(): void {
    if (!this.activeSection || this.sections.length <= 1) {
      return;
    }

    if (
      confirm(
        `Are you sure you want to delete section "${this.activeSection}"?`
      )
    ) {
      const currentData = this.jsonEditorService.getJsonData();
      delete currentData.sections[this.activeSection];
      this.jsonEditorService.setJsonData(currentData);

      this.loadSections();
      if (this.sections.length > 0) {
        this.selectSection(this.sections[0]);
      } else {
        this.activeSection = '';
        this.currentFields = {};
      }
    }
  }

  exportJson(): void {
    const jsonData = this.jsonEditorService.exportJsonData();
    const blob = new Blob([jsonData], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'standalone_updated.json';
    link.click();

    URL.revokeObjectURL(link.href);
  }

  onFileUploaded(success: boolean): void {
    this.fileUploaded = success;
    if (success) {
      this.loadSections();
    }
  }
}
