export interface Decision {
    name: String;
    criterias: String[];
    alternatives: String[];
    aconfig?: DecisionConfig;
}

export interface DecisionConfig {
    resultCalculated: boolean;
    resultMatrix: number[][];
    resultTotal: number[];
    criteriaTotal: number[];
    crCriteria: number;
    crAlternatives: number[];
    isValid: boolean;
    isConsistent: boolean;
    criteriaEvaluations: Evaluation[];
    alternativeEvaluations: AlternativeEvaluation[];
    criteriaEvaluationIsValid: boolean;
    alternativeEvaluationIsValid: boolean[];
    inconsistentMessageList: String[];
}

export interface Evaluation {
    label1: String;
    label2: String;
    value?: number;
}

export interface AlternativeEvaluation {
    criteriaLabel: String;
    evalArray: Evaluation[];
}