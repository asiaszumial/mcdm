import {Injectable} from '@angular/core';
import {Decision} from './model';

@Injectable()
export class DecisionService {
    decision: Decision = {
        name: "Elektrownia wiatrowa",
        criterias: ["Koszty", "Infrastruktura", "Bla1", "Bla2", "Bla3"],
        alternatives: ["La Braguia", "Estacas", "Barcelona", "Bla4", "Bla5"]
    };

    getCurrentDecision() {
        return this.decision;
    }
}

