import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JsonEditorService {
  private jsonDataSubject = new BehaviorSubject<any>(null);
  public jsonData$ = this.jsonDataSubject.asObservable();

  // Store original field for comparison
  private originalJson: any = null;

  constructor() {}

  setJsonData(data: any): void {
    this.originalJson = JSON.parse(JSON.stringify(data)); // Create a deep copy
    this.jsonDataSubject.next(data);
  }

  getJsonData(): any {
    return this.jsonDataSubject.value;
  }

  getOriginalJson(): any {
    return this.originalJson;
  }

  loadSampleData(): void {
    const sampleData = {
      sections: {
        overview: {
          zip: {
            units: 'units_text',
            default: '10115',
            datatype: 'text',
            required: true,
            field_name: 'zip_name',
            description: 'zip_desc',
          },
          city: {
            units: 'units_text',
            default: 'Berlin',
            datatype: 'text',
            required: true,
            field_name: 'city_name',
            description: 'city_desc',
          },
          address: {
            units: 'units_text',
            default: 'Germany, Berlin',
            datatype: 'text',
            required: true,
            field_name: 'address_name',
            description: 'address_desc',
          },
        },
        financial: {
          asset_cost: {
            units: 'units_euro_per_kwh',
            limits: {
              max: 1000000,
              min: 0,
            },
            default: 200,
            datatype: 'number',
            required: true,
            field_name: 'asset_cost_name',
            description: 'asset_cost_desc',
          },
        },
        technical: {
          asset_type: {
            default: 'Li-ion',
            datatype: 'text',
            dropdown: ['Li-ion'],
            required: true,
            field_name: 'asset_type_name',
            description: 'asset_type_desc',
          },
        },
        analysis_settings: {
          currency: {
            default: 'Euro',
            datatype: 'text',
            dropdown: ['Euro'],
            required: true,
            field_name: 'currency_name',
            description: 'currency_desc',
          },
          end_date: {
            limits: {
              max: '2050-12-31T23:00:00Z',
              min: '2019-12-31T23:00:00Z',
            },
            default: '2024-07-31T22:00:00Z',
            datatype: 'date',
            required: true,
            field_name: 'end_date_name',
            description: 'end_date_desc',
          },
        },
      },
    };

    this.setJsonData(sampleData);
  }

  addField(
    section: string,
    subsection: string | null,
    fieldName: string,
    fieldData: any
  ): void {
    const currentData = this.getJsonData();

    if (!currentData || !currentData.sections) {
      console.error('Invalid JSON structure');
      return;
    }

    if (!currentData.sections[section]) {
      currentData.sections[section] = {};
    }

    if (subsection) {
      if (!currentData.sections[section][subsection]) {
        currentData.sections[section][subsection] = {};
      }
      currentData.sections[section][subsection][fieldName] = fieldData;
    } else {
      currentData.sections[section][fieldName] = fieldData;
    }

    this.jsonDataSubject.next({ ...currentData });
  }

  updateField(
    section: string,
    subsection: string | null,
    fieldName: string,
    fieldData: any
  ): void {
    const currentData = this.getJsonData();
    if (!currentData) return;

    if (subsection) {
      // Update in nested subsection
      currentData.sections[section][subsection][fieldName] = fieldData;
    } else {
      // Update directly in section
      currentData.sections[section][fieldName] = fieldData;
    }

    this.jsonDataSubject.next(currentData);
  }

  updateFieldValue(
    section: string,
    subsection: string | null,
    fieldName: string,
    path: string[],
    value: any
  ): void {
    const currentData = this.getJsonData();
    if (!currentData) return;

    let fieldObj;
    if (subsection) {
      // Get field in nested subsection
      fieldObj = currentData.sections[section][subsection][fieldName];
    } else {
      // Get field directly in section
      fieldObj = currentData.sections[section][fieldName];
    }

    // Update the value at the specified path
    let current = fieldObj;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;

    // Update the data
    this.jsonDataSubject.next(currentData);
  }

  deleteField(
    section: string,
    subsection: string | null,
    fieldName: string
  ): void {
    const currentData = this.getJsonData();

    if (
      !currentData ||
      !currentData.sections ||
      !currentData.sections[section]
    ) {
      console.error('Invalid path or section does not exist');
      return;
    }

    if (subsection) {
      if (!currentData.sections[section][subsection]) {
        console.error('Subsection does not exist');
        return;
      }
      if (currentData.sections[section][subsection][fieldName]) {
        delete currentData.sections[section][subsection][fieldName];
      }
    } else {
      if (currentData.sections[section][fieldName]) {
        delete currentData.sections[section][fieldName];
      }
    }

    this.jsonDataSubject.next({ ...currentData });
  }

  getSections(): string[] {
    const currentData = this.getJsonData();
    if (!currentData || !currentData.sections) {
      return [];
    }
    return Object.keys(currentData.sections);
  }

  getFieldsInSection(section: string, subsection: string | null = null): any {
    const currentData = this.getJsonData();
    if (
      !currentData ||
      !currentData.sections ||
      !currentData.sections[section]
    ) {
      return {};
    }

    if (subsection) {
      return currentData.sections[section][subsection] || {};
    }

    return currentData.sections[section];
  }

  generateFieldTemplate(dataType: string = 'text'): any {
    const template: any = {
      datatype: dataType,
      required: false,
      field_name: '',
      description: '',
    };

    switch (dataType) {
      case 'number':
        template.units = 'units_text';
        template.limits = {
          max: 100,
          min: 0,
        };
        template.default = 0;
        break;
      case 'text':
        template.units = 'units_text';
        template.default = '';
        break;
      case 'date':
        template.units = 'units_date';
        template.limits = {
          max: new Date().toISOString(),
          min: new Date(
            new Date().setFullYear(new Date().getFullYear() - 10)
          ).toISOString(),
        };
        template.default = new Date().toISOString();
        break;
      default:
        template.default = '';
    }

    return template;
  }

  exportJsonData(): string {
    const currentData = this.getJsonData();
    return JSON.stringify(currentData, null, 2);
  }
}
