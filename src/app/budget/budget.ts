import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OnlyNumber } from '../directive/only-number';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-budget',
  imports: [CommonModule, FormsModule, OnlyNumber],
  templateUrl: './budget.html',
  styleUrl: './budget.scss',
})
export class Budget implements OnInit, AfterViewInit {
  startMonth = signal<number>(1);
  endMonth = signal<number>(12);
  months = [
    { key: 0 },
    { key: 1, value: 'Jan 2025' },
    { key: 2, value: 'Feb 2025' },
    { key: 3, value: 'Mar 2025' },
    { key: 4, value: 'Apr 2025' },
    { key: 5, value: 'May 2025' },
    { key: 6, value: 'Jun 2025' },
    { key: 7, value: 'Jul 2025' },
    { key: 8, value: 'Aug 2025' },
    { key: 9, value: 'Sep 2025' },
    { key: 10, value: 'Oct 2025' },
    { key: 11, value: 'Nov 2025' },
    { key: 12, value: 'Dec 2025' },
  ];

  bindingMonths = computed(() => this.months.slice(this.startMonth(), this.endMonth() + 1));

  startMonths = computed(() => this.months.slice(1, this.endMonth()));

  endMonths = computed(() => this.months.slice(this.startMonth() + 1));

  financialData = {
    income: {
      label: 'Income',
      subCategory: [
        {
          label: 'General Income',
          subCategory: [
            {
              label: 'Sales',
              data: signal(this.months.map((m) => ({ key: m.key, value: 0 }))),
            },
            {
              label: 'Commission',
              data: signal(this.months.map((m) => ({ key: m.key, value: 0 }))),
            },
          ],
        },
        {
          label: 'Other Income',
          subCategory: [
            {
              label: 'Training',
              data: signal(this.months.map((m) => ({ key: m.key, value: 0 }))),
            },
            {
              label: 'Consulting',
              data: signal(this.months.map((m) => ({ key: m.key, value: 0 }))),
            },
          ],
        },
      ],
    },
    expenses: {
      label: 'Expense',
      subCategory: [
        {
          label: 'Operational Expenses',
          subCategory: [
            {
              label: 'Management Fees',
              data: signal(this.months.map((m) => ({ key: m.key, value: 0 }))),
            },
            {
              label: 'Cloud Hosting',
              data: signal(this.months.map((m) => ({ key: m.key, value: 0 }))),
            },
          ],
        },
        {
          label: 'Salaries & Wages',
          subCategory: [
            {
              label: 'Full Time Dev Salaries',
              data: signal(this.months.map((m) => ({ key: m.key, value: 0 }))),
            },
            {
              label: 'Part Time Dev Salaries',
              data: signal(this.months.map((m) => ({ key: m.key, value: 0 }))),
            },
            {
              label: 'Remote Salaries',
              data: signal(this.months.map((m) => ({ key: m.key, value: 0 }))),
            },
          ],
        },
      ],
    },
  };

  rowsOrder: string[] = [];
  valueChanges$ = new Subject<{ key: number; value: number }>();

  constructor() {
    this.valueChanges$.pipe(debounceTime(50)).subscribe();
    effect(() => {
      const months = this.bindingMonths();
      this.financialData.income.subCategory.forEach((cat) => {
        cat.subCategory.forEach((sub) => {
          const oldData = sub.data();
          const newData = months.map((m) => {
            const existing = oldData.find((d) => d.key === m.key);
            return existing ? existing : { key: m.key, value: 0 };
          });
          if (JSON.stringify(oldData) !== JSON.stringify(newData)) {
            sub.data.set(newData);
          }
        });
      });
    });
  }

  ngOnInit(): void {
    this.initRowsOrder();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const firstInput = document.querySelector<HTMLInputElement>('input[data-row][data-col]');
      if (firstInput) firstInput.focus();
    });
  }

  getValueByMonth(dataArray: any[], index: number) {
    const found = dataArray[index].value;
    return found;
  }

  getTotalSub(sub: any, index: number) {
    let sumSub = 0;
    sub.forEach((element: any) => {
      sumSub += Number(element.data().find((item: any) => item.key == index).value);
    });
    return sumSub;
  }

  trackByKey(index: number, item: any) {
    return item.key;
  }

  getDataByKey(data: any[], key: number) {
    let obj = data.find((d) => d.key === key);
    if (!obj) {
      obj = { key, value: 0 };
      data.push(obj);
    }
    return obj;
  }

  onArrowKey(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const row = input.getAttribute('data-row');
    const col = input.getAttribute('data-col');
    if (!row || !col) return;

    const colNum = +col;

    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;

    event.preventDefault();

    let nextInput: HTMLInputElement | null = null;

    switch (event.key) {
      case 'ArrowLeft':
        nextInput = document.querySelector(`input[data-row="${row}"][data-col="${colNum - 1}"]`);
        break;
      case 'ArrowRight':
        nextInput = document.querySelector(`input[data-row="${row}"][data-col="${colNum + 1}"]`);
        break;
      case 'ArrowUp':
        const prevRow = this.getPrevRow(row);
        nextInput = document.querySelector(`input[data-row="${prevRow}"][data-col="${colNum}"]`);
        break;
      case 'ArrowDown':
        const nextRow = this.getNextRow(row);
        nextInput = document.querySelector(`input[data-row="${nextRow}"][data-col="${colNum}"]`);
        break;
    }

    if (nextInput) nextInput.focus();
  }

  getPrevRow(currentRow: string) {
    const idx = this.rowsOrder.indexOf(currentRow);
    return idx > 0 ? this.rowsOrder[idx - 1] : currentRow;
  }

  getNextRow(currentRow: string) {
    const idx = this.rowsOrder.indexOf(currentRow);
    return idx < this.rowsOrder.length - 1 ? this.rowsOrder[idx + 1] : currentRow;
  }

  initRowsOrder() {
    this.rowsOrder = [];

    const collectRows = (subCategories: any[]) => {
      subCategories.forEach((element) => {
        if (element.data) this.rowsOrder.push(element.label);
        if (element.subCategory) collectRows(element.subCategory);
      });
    };

    collectRows(this.financialData.income.subCategory);
    collectRows(this.financialData.expenses.subCategory);
  }

  onEnterAddSubCategory(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const rowLabel = input.getAttribute('data-row');
    if (!rowLabel) return;

    if (event.key === 'Enter') {
      event.preventDefault();
      this.addSubCategory(rowLabel);
    }
  }

  addSubCategory(parentLabel: string) {
    let newSubCategory = {
      label:
        'Add new ‘' +
          this.financialData.income.subCategory.find((c) =>
            c.subCategory.find((item) => item.label == parentLabel)
          )?.label ||
        this.financialData.expenses.subCategory.find((c) =>
          c.subCategory.find((item) => item.label == parentLabel)
        )?.label + '’ Category',
      data: signal(this.months.map((m) => ({ key: m.key, value: 0 }))),
    };

    const parentCategory =
      this.financialData.income.subCategory.find((c) => {
        return c.subCategory.find((item) => item.label == parentLabel);
      }) ||
      this.financialData.expenses.subCategory.find((c) =>
        c.subCategory.find((item) => item.label == parentLabel)
      );

    if (!parentCategory) return;

    if (!parentCategory.subCategory) parentCategory.subCategory = [];

    parentCategory.subCategory = [...parentCategory.subCategory, newSubCategory];

    this.initRowsOrder();

    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>(`input[data-row="New SubCategory"]`);
      if (input) input.focus();
    });
  }
  getValue(category: any, monthKey: number) {
    return category.data().find((d: any) => d.key === monthKey)?.value || 0;
  }

  setValue(category: any, monthKey: number, value: number) {
    const oldData = category.data();
    category.data.set(oldData.map((d: any) => (d.key === monthKey ? { ...d, value } : d)));
  }

  onValueChange(monthKey: number, value: number) {
    this.valueChanges$.next({ key: monthKey, value });
  }

  deleteRow(labelToDelete: string) {
    const deleteFromArray = (arr: any[]): any[] => {
      return arr
        .filter((item) => item.label !== labelToDelete)
        .map((item) => {
          if (item.subCategory) {
            item.subCategory = deleteFromArray(item.subCategory);
            if (item.subCategory.length === 0) return null;
          }
          return item;
        })
        .filter((item) => item !== null);
    };

    this.financialData.income.subCategory = deleteFromArray(this.financialData.income.subCategory);

    this.financialData.expenses.subCategory = deleteFromArray(
      this.financialData.expenses.subCategory
    );

    this.initRowsOrder();
  }

  onEnterAddParentCategory(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const label = input.value.trim();
    if (!label) return;

    event.preventDefault();

    this.addParentCategory(label);
  }

  addParentCategory(label: string) {
    const newCategory = {
      label: 'Add New Parent Category',
      subCategory: [
        {
          label: 'Add a new Sub Category',
          data: signal(this.months.map((m) => ({ key: m.key, value: 0 }))),
        },
      ],
    };

    if (this.financialData.income.subCategory.some((c) => c.label === label)) {
      this.financialData.income.subCategory = [
        ...this.financialData.income.subCategory,
        newCategory,
      ];
    } else {
      this.financialData.expenses.subCategory = [
        ...this.financialData.expenses.subCategory,
        newCategory,
      ];
    }

    this.initRowsOrder();

    setTimeout(() => {
      const inputEl = document.querySelector<HTMLInputElement>(
        `input[data-row="Add a new ‘Parent Category’ Category"]`
      );
      if (inputEl) inputEl.focus();
    });
  }

  popupVisible = false;
  popupX = 0;
  popupY = 0;
  selectedCategory: any = null;
  selectedKey: number | null = null;

  onRightClick(event: MouseEvent, category: any, key: number) {
    event.preventDefault();

    this.popupX = event.clientX;
    this.popupY = event.clientY;
    this.popupVisible = true;
    this.selectedCategory = category;
    this.selectedKey = key;
  }

  applyToAll() {
    if (!this.selectedCategory || this.selectedKey === null) return;

    const key = this.selectedKey;
    const valueToApply = Number(
      this.selectedCategory.data().find((d: any) => d.key === key)?.value || 0
    );

    const applyValue = (categories: any[]) => {
      categories.forEach((cat) => {
        cat.subCategory.forEach((sub: any) => {
          const oldData = sub.data();
          sub.data.set(
            oldData.map((d: any) => (d.key === key ? { ...d, value: valueToApply } : d))
          );
        });
      });
    };

    applyValue(this.financialData.income.subCategory);
    applyValue(this.financialData.expenses.subCategory);

    this.popupVisible = false;
  }

  @ViewChild('popupRef') popupRef!: ElementRef;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.popupVisible) return;

    const clickedInside = this.popupRef?.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.popupVisible = false;
    }
  }

  totalByCategory = (categories: any[]) => {
    const map: Record<number, number> = {};
    this.bindingMonths().forEach((month) => {
      let sum = 0;
      categories.forEach((cat) => {
        cat.subCategory.forEach((sub: any) => {
          const value = Number(sub.data().find((d: any) => d.key === month.key)?.value || 0);
          sum += value;
        });
      });
      map[month.key] = sum;
    });
    return map;
  };

  totalIncomeMap = computed(() => this.totalByCategory(this.financialData.income.subCategory));
  totalExpenseMap = computed(() => this.totalByCategory(this.financialData.expenses.subCategory));
  profitLossMap = computed(() => {
    const map: Record<number, number> = {};
    this.bindingMonths().forEach((month) => {
      map[month.key] =
        (this.totalIncomeMap()[month.key] || 0) - (this.totalExpenseMap()[month.key] || 0);
    });
    return map;
  });

  balanceMap = computed(() => {
    const map: Record<number, { open: number; close: number }> = {};
    let prevClose = 0;
    this.bindingMonths().forEach((month) => {
      const open = prevClose;
      const close = open + (this.profitLossMap()[month.key] || 0);
      prevClose = close;
      map[month.key] = { open, close };
    });
    return map;
  });
}
