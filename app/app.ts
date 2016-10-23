import {bootstrap} from '@angular/platform-browser-dynamic';
import {Component} from '@angular/core';
import {NgFor} from '@angular/common';
import {DecisionList} from './decisionList';
import {AhpMethod} from './ahpMethod';


@Component({
  selector: 'app',
  directives: [DecisionList, AhpMethod],
  template: `
    <decision-list></decision-list>
    <ahp-method></ahp-method>
  `
})

export class App {
  constructor() {}
}

bootstrap(App);