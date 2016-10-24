import {Component} from '@angular/core';
import {NgFor} from '@angular/common';
import {DecisionService} from './decisionService';

@Component({
  selector: 'decision-list',
  providers: [DecisionService],
  template: `
    <nav class="navbar navbar-inverse">
      <div class="container">
        <div class="navbar-header">
          <a class="navbar-brand" href="#">AHP</a>
        </div>
        <ul class="nav navbar-nav">
          <li *ngFor="let item of items; let i = index;" (click)="onItemClicked(i)" [class.active]="i==decisionService.getSelectedDecisionIndex()">
            <a href="#">{{item.name}}</a>
          </li>
        </ul>
      </div>
    </nav>
  `
})

export class DecisionList {
    items = [];
  constructor(private decisionService: DecisionService) {
      this.items = decisionService.getConfig();
  }

  onItemClicked(index) {
    this.decisionService.setSelectedDecisionIndex(index);
  }
}