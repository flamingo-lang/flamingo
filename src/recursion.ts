import { ___, log } from "./input_rule";
import { List, Set} from "immutable";

const flip = (shouldFlip, b) => shouldFlip ? !b : b;

/**
 * Takes a set of tuples `S` and produces a matching function
 * that takes in a tuple (with optional wild cards) and finds
 * every tuple in `S` that matches that tuple.
 */
export const input_rule = <A>(tupleSet: TupleSet<A>) => (negated, iAttrs, cb,) =>
    new TupleSet<A>(tupleSet.values().filter((attrs: A) =>
        flip(negated, (attrs as unknown as any[]).every((_, i) => iAttrs[i] === ___ || attrs[i] === iAttrs[i])))
        .flatMap(cb));

const parent_tuples = new TupleSet<[string, string]>([
    ["a", "b"],
    ["b", "c"],
    ["c", "d"]
]);


const parent = input_rule(parent_tuples);

// ancestor(X, Y) :- parent(X, Y).
// const ancestor_tuples = parent(false, [___, ___], ([X, Y]) => [[X, Y]]);

// ancestor(X, Z) :- parent(X, Y), ancestor(Y, Z).

const ancestor_tuples = (() => {
    const ancestor1_tuples = parent(false, [___, ___], ([X, Y]) => [[X, Y]]);
    const ancestor2 = (input_tuples: TupleSet<[string, string]>) => {
        const input_ancestor = input_rule(input_tuples);
        const results = parent(false, [___, ___], ([X, Y]) =>
            input_ancestor(false, [Y, ___], ([_, Z]) =>
                [[Y, Z]]));

        if (results.equal(input_tuples)) {
            return input_tuples;
        } else {
            ancestor2(results);
        }
    };
    return ancestor1_tuples.values().concat(ancestor2(ancestor1_tuples))
})();

console.log(ancestor_tuples);
