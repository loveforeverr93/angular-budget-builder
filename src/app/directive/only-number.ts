import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appOnlyNumber]',
})
export class OnlyNumber {
  constructor() {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (
      [8, 9, 13, 27, 46].indexOf(event.keyCode) !== -1 ||
      (event.ctrlKey === true && [65, 67, 86, 88].indexOf(event.keyCode) !== -1) ||
      (event.keyCode >= 35 && event.keyCode <= 39)
    ) {
      return;
    }

    if (
      (event.shiftKey || event.keyCode < 48 || event.keyCode > 57) &&
      (event.keyCode < 96 || event.keyCode > 105)
    ) {
      event.preventDefault();
    }
  }
}
