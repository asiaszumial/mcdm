import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'ahp-eval',
  template: `
    <div class="row">
        <div class="col-lg-2 col-md-2 col-sm-2 text-left">{{label1}}</div>
        <div class="col-lg-8 col-md-8 col-sm-8 text-center">
             <div class="btn-group" role="group">
                <button type="button" class="btn btn-default" [class.active]="value == 9" (click)="valueSelected(9)">9</button>
                <button type="button" class="btn btn-default" [class.active]="value == 8" (click)="valueSelected(8)">8</button>
                <button type="button" class="btn btn-default" [class.active]="value == 7" (click)="valueSelected(7)">7</button>
                <button type="button" class="btn btn-default" [class.active]="value == 6" (click)="valueSelected(6)">6</button>
                <button type="button" class="btn btn-default" [class.active]="value == 5" (click)="valueSelected(5)">5</button>
                <button type="button" class="btn btn-default" [class.active]="value == 4" (click)="valueSelected(4)">4</button>
                <button type="button" class="btn btn-default" [class.active]="value == 3" (click)="valueSelected(3)">3</button>
                <button type="button" class="btn btn-default" [class.active]="value == 2" (click)="valueSelected(2)">2</button>
                <button type="button" class="btn btn-default" [class.active]="value == 1" (click)="valueSelected(1)">=</button>
                <button type="button" class="btn btn-default" [class.active]="value == 1/2" (click)="valueSelected(1/2)">2</button>
                <button type="button" class="btn btn-default" [class.active]="value == 1/3" (click)="valueSelected(1/3)">3</button>
                <button type="button" class="btn btn-default" [class.active]="value == 1/4" (click)="valueSelected(1/4)">4</button>
                <button type="button" class="btn btn-default" [class.active]="value == 1/5" (click)="valueSelected(1/5)">5</button>
                <button type="button" class="btn btn-default" [class.active]="value == 1/6" (click)="valueSelected(1/6)">6</button>
                <button type="button" class="btn btn-default" [class.active]="value == 1/7" (click)="valueSelected(1/7)">7</button>
                <button type="button" class="btn btn-default" [class.active]="value == 1/8" (click)="valueSelected(1/8)">8</button>
                <button type="button" class="btn btn-default" [class.active]="value == 1/9" (click)="valueSelected(1/9)">9</button>
             </div>
        </div>
        <div class="col-lg-2 col-md-2 col-sm-2 text-right">{{label2}}</div>
     </div>
    `
})

export class AhpEval {
    @Input() index;
    @Input() index2;
    @Input() label1;
    @Input() label2;
    @Input() value;
    @Output() valueUpdated = new EventEmitter();

  constructor() {}

  valueSelected(value) {
    this.valueUpdated.emit({index: this.index, value: value, index2: this.index2});
  }
}