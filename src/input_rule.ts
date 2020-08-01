const flip = (shouldFlip, b) => shouldFlip ? !b : b;

export const ___ = Symbol("wildcard");

export const log = <A>(x: A) => { console.log(x); return x }

/**
 * Takes a set of tuples `S` and produces a matching function
 * that takes in a tuple (with optional wild cards) and finds
 * every tuple in `S` that matches that tuple.
 */
export const input_rule = (tuples) => (negated, iattrs, cb, ) =>
    tuples.filter((attrs) =>
        flip(negated, attrs.every((_, i) => iattrs[i] === ___ || attrs[i] === iattrs[i])))
        .flatMap(cb)
