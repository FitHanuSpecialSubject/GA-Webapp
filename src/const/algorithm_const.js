export class RequestAlgorithm {
  constructor(displayName, value) {
    this.displayName = displayName;
    this.value = value;
  }

  displayName() {
    return this.displayName;
  }

  value() {
    return this.value;
  }
}

export const ALGORITHMS = Object.freeze({
  NSGA2: new RequestAlgorithm("NSGA-II", "NSGAII"),
  NSGA3: new RequestAlgorithm("NSGA-III", "NSGAIII"),
  eMOEA: new RequestAlgorithm("εMOEA", "eMOEA"),
  PESA2: new RequestAlgorithm("PESA2", "PESA2"),
  VEGA: new RequestAlgorithm("VEGA", "VEGA"),
  PAES: new RequestAlgorithm("PAES", "PAES"),
  MOEAD: new RequestAlgorithm("MOEAD", "MOEAD"),
  IBEA: new RequestAlgorithm("IBEA", "IBEA"),
  OMOPSO: new RequestAlgorithm("OMOPSO", "OMOPSO"),
  SMPSO: new RequestAlgorithm("SMPSO", "SMPSO"),
  SPEA2: new RequestAlgorithm("SPEA2", "SPEA2"),
});
