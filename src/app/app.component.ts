import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PatientService } from './services/patient.service';
import { Patient } from './models/patient';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <div class="card">
        <div class="toolbar">
          <input
            placeholder="Search by PID or name..."
            [(ngModel)]="q"
            (keyup.enter)="search()"
          />
          <button class="primary" (click)="openCreate()">+ New Patient</button>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>PID</th>
              <th>Name</th>
              <th>DOB</th>
              <th>Gender</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of patients(); trackBy: trackById">
              <td>{{ p.pid }}</td>
              <td>{{ p.firstName }} {{ p.lastName }}</td>
              <td>{{ p.dateOfBirth }}</td>
              <td>{{ p.gender }}</td>
              <td>{{ p.phone }}</td>
              <td>
                {{ p.address?.address }},
                {{ p.address?.suburb }},
                {{ p.address?.state }}
                {{ p.address?.postcode }}
              </td>
              <td class="actions">
                <button (click)="openEdit(p)">Edit</button>
                <button (click)="remove(p)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="pager">
          <button (click)="prev()" [disabled]="page === 0">Prev</button>
          <span>Page {{ page + 1 }}</span>
          <button (click)="next()" [disabled]="!hasMore()">Next</button>
        </div>
      </div>
    </div>

    <!-- Dialog -->
    <div *ngIf="dialogOpen()" class="dialog-backdrop">
      <div class="dialog">
        <h3>{{ editingId ? 'Edit' : 'Create' }} Patient</h3>
        <form [formGroup]="frm" (ngSubmit)="save()">
          <div class="form-grid">
            <label>PID <input formControlName="pid" [readonly]="!!editingId" /></label>
            <label>First Name <input formControlName="firstName" /></label>
            <label>Last Name <input formControlName="lastName" /></label>
            <label>DOB <input type="date" formControlName="dateOfBirth" /></label>
            <label>
              Gender
              <select formControlName="gender">
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </label>
            <label>Phone <input formControlName="phone" /></label>
            <label style="grid-column:1 / -1">
              Address <input formControlName="address_line" placeholder="Street address" />
            </label>
            <label>Suburb <input formControlName="suburb" /></label>
            <label>State <input formControlName="state" /></label>
            <label>Postcode <input formControlName="postcode" /></label>
          </div>

          <div class="footer">
            <button type="button" (click)="close()">Cancel</button>
            <button class="primary" type="submit" [disabled]="frm.invalid">
              {{ editingId ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class AppComponent {
  private readonly api = inject(PatientService);
  private readonly fb = inject(FormBuilder);

  q = '';
  page = 0;
  size = 10;

  private readonly _patients = signal<Patient[]>([]);
  patients = this._patients.asReadonly();

  private readonly _total = signal(0);
  hasMore = computed(() => (this.page + 1) * this.size < this._total());

  dialogOpen = signal(false);
  editingId: number | null = null;

  frm = this.fb.group({
    pid: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    dateOfBirth: ['', Validators.required],
    gender: ['MALE', Validators.required],
    phone: ['', Validators.required],
    address_line: ['', Validators.required],
    suburb: ['', Validators.required],
    state: ['', Validators.required],
    postcode: ['', Validators.required],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api
      .list(this.q, this.page, this.size, 'lastName,asc')
      .subscribe({
        next: (res) => {
          this._patients.set(res.content);
          this._total.set(res.totalElements);
        },
        error: (err) => {
          console.error(err);
          alert('Failed to load patients.');
        },
      });
  }

  search(): void {
    this.page = 0;
    this.load();
  }

  next(): void {
    this.page++;
    this.load();
  }

  prev(): void {
    this.page = Math.max(0, this.page - 1);
    this.load();
  }

  openCreate(): void {
    this.editingId = null;
    this.frm.reset({ gender: 'MALE' });
    this.dialogOpen.set(true);
  }

  openEdit(p: Patient): void {
    this.editingId = p.id!;
    this.frm.setValue({
      pid: p.pid,
      firstName: p.firstName,
      lastName: p.lastName,
      dateOfBirth: p.dateOfBirth,
      gender: p.gender,
      phone: p.phone,
      address_line: p.address?.address ?? '',
      suburb: p.address?.suburb ?? '',
      state: p.address?.state ?? '',
      postcode: p.address?.postcode ?? '',
    });
    this.dialogOpen.set(true);
  }

  close(): void {
    this.dialogOpen.set(false);
  }

  save(): void {
    const v = this.frm.value as {
      pid: string;
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      gender: 'MALE' | 'FEMALE' | 'OTHER';
      phone: string;
      address_line: string;
      suburb: string;
      state: string;
      postcode: string;
    };

    const payload = {
      pid: v.pid,
      firstName: v.firstName,
      lastName: v.lastName,
      dateOfBirth: v.dateOfBirth,
      gender: v.gender,
      phone: v.phone,
      address: {
        address: v.address_line,
        suburb: v.suburb,
        state: v.state,
        postcode: v.postcode,
      },
    };

    const req$ = this.editingId
      ? this.api.update(this.editingId, payload as unknown as Patient)
      : this.api.create(payload as unknown as Patient);

    req$.subscribe({
      next: () => {
        this.close();
        this.load();
      },
      error: (err) => {
        console.error(err);
        alert('Save failed.');
      },
    });
  }

  remove(p: Patient): void {
    if (!confirm(`Delete ${p.pid}?`)) return;
    this.api.delete(p.id!).subscribe({
      next: () => this.load(),
      error: (err) => {
        console.error(err);
        alert('Delete failed.');
      },
    });
  }

  trackById(_: number, p: Patient): number | undefined {
    return p.id;
  }
}
