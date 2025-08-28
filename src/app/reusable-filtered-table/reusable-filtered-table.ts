import { Component, Input, OnChanges, HostListener } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-reusable-filtered-table',
  standalone: true,
  imports: [CommonModule, TableModule, CheckboxModule, InputTextModule, FormsModule, ButtonModule, TitleCasePipe],
  templateUrl: './reusable-filtered-table.html',
  styleUrls: ['./reusable-filtered-table.css']
})
export class ReusableFilteredTable implements OnChanges {
  @Input() data: any[] = [];
  @Input() ignore: string[] = [];
  @Input() filterable: string[] = ['id','status','name'];

  rowsPerPageOptions = [5, 10, 20, 50];
  rowsPerPage = 10;
  currentPage = 1;
  totalPages = 1;
  pagedRows: any[] = [];
  startRow = 0;
  endRow = 0;

  defaultData = [
    { id: 1, name: 'Alpha', status: 'Active', createdAt: '2025-01-01' },
    { id: 2, name: 'Beta', status: 'Inactive', createdAt: '2025-02-10' },
    { id: 3, name: 'Gamma', status: 'Active', createdAt: '2025-03-05' },
    { id: 4, name: 'Delta', status: 'Active', createdAt: '2025-04-12' },
    { id: 5, name: 'Epsilon', status: 'Pending', createdAt: '2025-05-15' },
    { id: 6, name: 'Zeta', status: 'Inactive', createdAt: '2025-06-20' },
    { id: 7, name: 'Eta', status: 'Active', createdAt: '2025-07-08' },
    { id: 8, name: 'Theta', status: 'Pending', createdAt: '2025-08-12' },
    { id: 9, name: 'Iota', status: 'Active', createdAt: '2025-09-03' },
    { id: 10, name: 'Kappa', status: 'Inactive', createdAt: '2025-10-17' },
    { id: 11, name: 'Lambda', status: 'Active', createdAt: '2025-11-25' },
    { id: 12, name: 'Mu', status: 'Pending', createdAt: '2025-12-05' },
    { id: 13, name: 'Nu', status: 'Active', createdAt: '2024-01-30' },
    { id: 14, name: 'Xi', status: 'Inactive', createdAt: '2024-02-14' },
    { id: 15, name: 'Omicron', status: 'Pending', createdAt: '2024-03-22' }
  ];

  searchText: Record<string, string> = {};
  showFilter: Record<string, boolean> = {};
  appliedSelected: Record<string, Set<any>> = {};
  pendingSelected: Record<string, Set<any>> = {};

  get effectiveData(): any[] {
    return this.data && this.data.length ? this.data : this.defaultData;
  }

  private isPlainObject(v: any): boolean {
    return v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);
  }

  get rows(): Record<string, any>[] {
    const s = this.effectiveData;
    if (!s || !s.length) return [];
    if (!this.isPlainObject(s[0])) return s.map(v => ({ value: v }));
    return s as Record<string, any>[];
  }

  get cols(): string[] {
    const set = new Set<string>();
    for (const r of this.rows) Object.keys(r).forEach(k => set.add(k));
    const all = Array.from(set);
    return this.ignore && this.ignore.length ? all.filter(c => !this.ignore.includes(c)) : all;
  }

  ngOnChanges(): void {
    this.appliedSelected = {};
    this.pendingSelected = {};
    
    for (const c of this.cols) {
      if (this.isFilterable(c)) {
        this.ensureState(c);
      }
    }
  }

  ngOnInit(): void {
    console.log('Calling updatePagination from ngOnInit');
    this.updatePagination();
  }

  isFilterable(col: string): boolean {
    return Array.isArray(this.filterable) && this.filterable.includes(col);
  }

  uniqueValues(col: string): any[] {
    const s = new Set<any>();
    for (const r of this.rows) {
      const v = r[col];
      if (v !== undefined && v !== null) s.add(v);
    }
    return Array.from(s).sort((a, b) => String(a).localeCompare(String(b)));
  }

  ensureState(col: string): void {
    const opts = this.uniqueValues(col);
    
    if (!this.appliedSelected[col]) {
      this.appliedSelected[col] = new Set(opts);
    }
    if (!this.pendingSelected[col]) {
      this.pendingSelected[col] = new Set(opts);
    }
    
    if (this.searchText[col] === undefined) this.searchText[col] = '';
    if (this.showFilter[col] === undefined) this.showFilter[col] = false;
  }

  filteredOptions(col: string): any[] {
    const q = (this.searchText[col] || '').toLowerCase();
    return this.uniqueValues(col).filter(v => String(v).toLowerCase().includes(q));
  }

  isPendingSelected(col: string, opt: any): boolean {
    return this.pendingSelected[col]?.has(opt) ?? false;
  }

  setPendingSelected(col: string, opt: any, checked: boolean): void {
    this.ensureState(col);
    if (checked) this.pendingSelected[col].add(opt); else this.pendingSelected[col].delete(opt);
  }

  selectAllChecked(col: string): boolean {
    const u = this.uniqueValues(col).length;
    const s = this.pendingSelected[col]?.size ?? 0;
    return u > 0 && s === u;
  }

  toggleSelectAll(col: string, checked: boolean): void {
    const u = this.uniqueValues(col);
    if (checked) this.pendingSelected[col] = new Set(u); else this.pendingSelected[col]?.clear();
  }

  apply(col: string): void {
    this.ensureState(col);
    this.appliedSelected[col] = new Set(this.pendingSelected[col]);
    this.showFilter[col] = false;
    this.currentPage = 1;
    this.updatePagination();
  }

  reset(col: string): void {
    const u = this.uniqueValues(col);
    this.appliedSelected[col] = new Set(u);
    this.pendingSelected[col] = new Set(u);
    this.searchText[col] = '';
    this.showFilter[col] = false;
    this.currentPage = 1;
    this.updatePagination();
  }

  get filteredRows(): any[] {
    const s = this.rows;
    const fcols = this.cols.filter(c => this.isFilterable(c));
    if (!fcols.length) return s;
    return s.filter(r => fcols.every(c => {
      const u = this.uniqueValues(c);
      const sel = this.appliedSelected[c];
      if (!sel) return true;
      if (sel.size === 0) return false;
      if (sel.size === u.length) return true;
      return sel.has(r[c]);
    }));
  }

  @HostListener('document:click')
  onOutsideClick(): void {
    for (const col of Object.keys(this.showFilter)) this.showFilter[col] = false;
  }

  panelPos: Record<string, { top: number, left: number }> = {};

  toggleFilter(col: string, event: MouseEvent): void {
    event.stopPropagation();
    this.ensureState(col);
    this.pendingSelected[col] = new Set(this.appliedSelected[col]);
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.panelPos[col] = { top: rect.bottom, left: rect.left };
    this.showFilter[col] = !this.showFilter[col];
  }

  filterClicked(event: MouseEvent): void {
    event.stopPropagation();
  }

  get activeChips(): Array<{col: string, value: any}> {
    const list: Array<{col: string, value: any}> = [];
    for (const col of this.cols) {
      if (!this.isFilterable(col)) continue;
      const u = this.uniqueValues(col);
      const sel = this.appliedSelected[col];
      if (!sel || sel.size === 0 || sel.size === u.length) continue;
      for (const v of sel) list.push({ col, value: v });
    }
    return list;
  }

  removeChip(col: string, value: any): void {
    this.ensureState(col);
    this.appliedSelected[col]?.delete(value);
    if (!this.appliedSelected[col] || this.appliedSelected[col].size === 0) {
      const u = this.uniqueValues(col);
      this.appliedSelected[col] = new Set(u);
      this.pendingSelected[col] = new Set(u);
    } else {
      this.pendingSelected[col] = new Set(this.appliedSelected[col]);
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  hasActiveFilter(col: string): boolean {
    const u = this.uniqueValues(col);
    const sel = this.appliedSelected[col];
    if (!sel) return false;
    return sel.size > 0 && sel.size < u.length;
  }
  
  updatePagination() {
    const filtered = this.filteredRows;
    this.totalPages = Math.max(1, Math.ceil(filtered.length / this.rowsPerPage));
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.startRow = (this.currentPage - 1) * this.rowsPerPage;
    this.endRow = Math.min(this.startRow + this.rowsPerPage, filtered.length);
    this.pagedRows = filtered.slice(this.startRow, this.endRow);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }
}