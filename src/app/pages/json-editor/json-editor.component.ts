import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { FileUploadComponent } from '../../components/file-upload/file-upload.component';
import { FieldEditorComponent } from '../../components/field-editor/field-editor.component';
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
  // service injection
  jsonEditorService = inject(JsonEditorService);

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

  constructor() {
    this.initForms();
  }

  initForms(): void {
    this.sectionForm = new FormGroup({
      sectionName: new FormControl(''),
    });

    this.fieldForm = new FormGroup({
      fieldName: new FormControl('', Validators.required),
      fieldType: new FormControl('text'),
      displayName: new FormControl(''),
      description: new FormControl(''),
      units: new FormControl(''),
      isRequired: new FormControl(false),
      isDropdown: new FormControl(false),

      // Type-specific controls
      defaultValue: new FormControl(''),

      // Number limits
      minValue: new FormControl(null),
      maxValue: new FormControl(null),

      // Date limits
      minDate: new FormControl(''),
      maxDate: new FormControl(''),

      // Dropdown options
      dropdownOptions: new FormArray([new FormControl('')]),
    });

    this.fieldForm.get('fieldType')?.valueChanges.subscribe((type) => {
      this.onFieldTypeChange(type);
    });

    this.fieldForm.get('isDropdown')?.valueChanges.subscribe((isDropdown) => {
      this.onDropdownToggle(isDropdown);
    });
  }

  createDropdownOption(option = ''): FormControl {
    return new FormControl(option);
  }

  get dropdownOptions(): FormArray {
    return this.fieldForm.get('dropdownOptions') as FormArray;
  }

  addDropdownOption(): void {
    this.dropdownOptions.push(this.createDropdownOption());
  }

  removeDropdownOption(index: number): void {
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

    let sectionName: string = this.sectionForm.get('sectionName')?.value;
    sectionName = sectionName?.toLowerCase().split(' ').join('_');

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
    } else {
      alert('Section name already exists.');
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
        isDropdown: false,
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

    if (this.isEditMode && this.editingFieldName === fieldName) {
      // save conditions
      this.isEditMode = false;
      this.editingFieldName = '';
      this.showAddFieldForm = false;
      return;
    }

    this.isEditMode = true;
    this.editingFieldName = fieldName;
    this.showAddFieldForm = false;

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
      defaultValue: field.default !== undefined ? field.default : '',
    });

    // Handle type-specific fields
    if (field.datatype === 'number' && field.limits) {
      this.fieldForm.patchValue({
        minValue: field.limits.min !== undefined ? field.limits.min : null,
        maxValue: field.limits.max !== undefined ? field.limits.max : null,
      });
    } else if (field.datatype === 'date' && field.limits) {
      // Convert ISO dates to YYYY-MM-DD format for date inputs
      const minDate = field.limits.min
        ? new Date(field.limits.min).toISOString().split('T')[0]
        : '';
      const maxDate = field.limits.max
        ? new Date(field.limits.max).toISOString().split('T')[0]
        : '';

      this.fieldForm.patchValue({
        minDate: minDate,
        maxDate: maxDate,
      });
    }

    if (isDropdown && field.dropdown.length > 0) {
      while (this.dropdownOptions.length) {
        this.dropdownOptions.removeAt(0);
      }

      field.dropdown.forEach((option: string) => {
        this.dropdownOptions.push(this.createDropdownOption(option));
      });
    }

    // Wait for the next tick to ensure the DOM has updated
    setTimeout(() => {
      // Find the field element and scroll to it
      const fieldElement = document.querySelector(
        `.field-item[data-field-name="${fieldName}"]`
      );
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

    const fieldTemplate: any = {
      datatype: formValues.fieldType,
      required: formValues.isRequired,
      field_name: formValues.displayName || formValues.fieldName,
      description: formValues.description || '',
    };

    if (formValues?.units) {
      fieldTemplate.units = formValues.units;
    }

    if (formValues?.fieldType === 'number') {
      fieldTemplate.default =
        formValues.defaultValue !== ''
          ? parseFloat(formValues.defaultValue)
          : 0;

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
      if (formValues.defaultValue) {
        const date = new Date(formValues.defaultValue);
        fieldTemplate.default = date.toISOString();
      } else {
        fieldTemplate.default = new Date().toISOString();
      }

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
      fieldTemplate.default = formValues.defaultValue || '';

      if (formValues.isDropdown && formValues.dropdownOptions.length > 0) {
        const validOptions = formValues.dropdownOptions.filter(
          (opt: string) => opt.trim() !== ''
        );
        if (validOptions.length > 0) {
          fieldTemplate.dropdown = validOptions;
          if (!fieldTemplate.default) {
            fieldTemplate.default = validOptions[0];
          }
        }
      }
    }

    if (this.isEditMode) {
      this.jsonEditorService.deleteField(
        this.activeSection,
        null,
        this.editingFieldName
      );
    }

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

  formatSectionName(name: string): string {
    return name
      ?.split('_')
      .map((np) => `${np.charAt(0).toUpperCase()}${np.slice(1)}`)
      .join(' ');
  }
}
