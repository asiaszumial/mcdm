import {Component, Input, Output, EventEmitter, DoCheck } from '@angular/core';
import {NgFor, NgIf} from '@angular/common';
import {Decision} from './model';

@Component({
  selector: 'electre-result',
  template: `
    <div class="panel panel-default">
        <div class="panel-heading">Wynik</div>
        <div class="panel-body">
            <h4 *ngIf="!decision.econfig.isValid">Obliczenie wyniku jest niemożliwe, ponieważ nie wprowadzono wszystkich danych</h4>
            <div *ngIf="!decision.econfig.isConsistent">
                <h4>Obliczenie wyniku jest niemożliwe, ponieważ poniższe dane są błędne:</h4>
                <ul>
                    <li *ngFor="let message of decision.econfig.inconsistentMessageList">{{message}}</li>
                </ul>
            </div>
        </div>
     </div>
    `
})

export class ElectreResult implements DoCheck  {
    ngDoCheck() {
        if (this.decision.econfig.isValid && this.decision.econfig.isConsistent) {
            this.calculate();
        }
    }
    @Input() decision: Decision;

    constructor() {}

    calculate() {}
}