import {
  Component,
  output,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { JsonEditorService } from '../../services/json-editor.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent {
  fileUploaded = output<boolean>();
  jsonEditorService = inject(JsonEditorService);

  isLoading = signal(false);
  errorMessage = signal('');
  isDragging = signal(false);

  constructor() {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.processFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        this.processFile(file);
      } else {
        this.errorMessage.set('Please upload a JSON file.');
      }
    }
  }

  private processFile(file: File): void {
    if (!this.isValidFile(file)) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        this.jsonEditorService.setJsonData(json);
        this.fileUploaded.emit(true);
      } catch (error) {
        this.errorMessage.set(
          'Invalid JSON file. Please check the format and try again.'
        );
      } finally {
        this.isLoading.set(false);
      }
    };

    reader.onerror = () => {
      this.errorMessage.set('Error reading the file. Please try again.');
      this.isLoading.set(false);
    };

    reader.readAsText(file);
  }

  private isValidFile(file: File): boolean {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      this.errorMessage.set('Please upload a JSON file.');
      return false;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.errorMessage.set('File size exceeds 5MB limit.');
      return false;
    }

    return true;
  }

  loadSampleData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    setTimeout(() => {
      try {
        this.jsonEditorService.loadSampleData();
        this.fileUploaded.emit(true);
      } catch (error) {
        this.errorMessage.set('Error loading sample data. Please try again.');
      } finally {
        this.isLoading.set(false);
      }
    }, 500); // Simulate loading for better UX
  }

  clearError(): void {
    this.errorMessage.set('');
  }
}
