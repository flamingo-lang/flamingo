// r1(a).
// r2(X) :- r1(X).
// r3(X) :- r2(X).

import { input_rule, ___ } from "./input_rule";

const r1_tuples = [["a"], ["b"], ["c"]];

const r1 = input_rule(r1_tuples);

const r2_tuples = r1(false, [___], ([X]) => [[X]]);

const r2 = input_rule(r2_tuples);

const r3_tuples = r2(false, [___], ([X]) => [[X]]);

console.log("r3 tuples");
console.log(r3_tuples);