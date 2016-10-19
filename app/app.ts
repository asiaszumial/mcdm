import {bootstrap} from '@angular/platform-browser-dynamic';
import {Component, Pipe, PipeTransform} from '@angular/core';
import {NgFor} from '@angular/common';


@Component({
  selector: 'app',
  template: `
    <h1>Test</h1>
  `
})

export class App {
  constructor() {}
}

bootstrap(App);