import {Injectable} from '@angular/core';
import {Decision} from './model';

@Injectable()
export class DecisionService {
    decision: Decision = {
        name: "Elektrownia wiatrowa",
        criterias: ["Koszty", "Infrastruktura"],
        alternatives: ["La Braguia", "Estacas", "Barcelona"]
    };

    getCurrentDecision() {
        return this.decision;
    }
}

