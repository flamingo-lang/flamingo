import { ___, log } from "./input_rule";

// r3(X) :- r1(X).
// r3(X) :- r2(X).


const flip = (shouldFlip, b) => shouldFlip ? !b : b;

/**
 * Takes a set of tuples `S` and produces a matching function
 * that takes in a tuple (with optional wild cards) and finds
 * every tuple in `S` that matches that tuple.
 */
export const input_rule = (tuples) => (negated, iattrs, cb, ) =>
    tuples.filter((attrs) =>
        flip(negated, attrs.every((_, i) => iattrs[i] === ___ || attrs[i] === iattrs[i])))
        .flatMap(cb)



const r1_tuples = [["a"], ["b"]];

const r2_tuples = [["c"], ["d"]];

const r1 = input_rule(r1_tuples);
const r2 = input_rule(r2_tuples);

const r3_tuples = r1(false, [___], ([X]) => [[X]])
    .concat(r2(false, [___], ([X]) => [[X]]));

console.log(r3_tuples);
