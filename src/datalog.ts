import * as R from "rambda";
// This is a datalog-without-negation interpreter in Javascript

//     a rule is:
//     
//     ((PRED ARG0 ... ARGN)   ;; <- the conclusion
//     (PRED0 ARG ...)        ;; <- the premises
//     ...
//     (PREDN ARG ...))
//     
//     arguments are:
//     
//     X           ;; variables, which are uppercase symbols
//     | x           ;; atoms, which are lowercase symbols
const car = ([x]: any[]) => x;
const cdr = ([x, ...xs]: any[]) => xs;

const is_var = (s: string): boolean => typeof s === "string" && s[0].toUpperCase() === s[0];
const is_atom = (s: string): boolean => !is_var(s);

const union = (xs, xy) => R.uniq(R.concat(xs, xy));
const unions = <T>(xs: T[][]): T[] => {
    return R.uniq([].concat(...xs));
};

// Substitutions, implemented as JS objects where keys and values are both strings
type Subst = { [k: string]: string };
const assign = (subst: Subst, key, value) => {
    if (!(key in subst)) {
        return { ...subst, [key]: value };
    } else if (subst[key] === value) {
        return subst;
    } else {
        return false;
    }
}

const substitute = ([pred, ...args]: string[], subst: Subst) => {
    return [pred, ...args.reduce((prev, curr) => {
        return [...prev, (curr in subst) ? subst[curr] : curr]
    }, [])];
}

// Returns false on unification failure.
const unify = (subst: Subst, args, grounds) => {
    console.log("unifying:", subst, args, grounds);
    if (R.equals(args, grounds)) {
        return subst;
    } else if (is_var(args)) {
        return assign(subst, args, grounds);
    } else if (
        Array.isArray(args)
        && args.length
        && Array.isArray(grounds)
        && grounds.length
    ) {
        let x = unify(subst, car(args), car(grounds));
        if (x === false) {
            return false;
        } else {
            return unify(x, cdr(args), cdr(grounds));
        }
    } else {
        return false;
    }
}

const query = (conc, premises: any[], facts, subst = {}) => {
    if (premises.length === 0) {
        return [substitute(conc, subst)];
    } else {
        // console.log("premises", premises);
        const [[pred, ...args], ...prems] = premises;
        return unions(
            facts.filter(fact => car(fact) === pred)
                .map(fact => {
                    const new_subst = unify(subst, args, cdr(fact));
                    if (new_subst) {
                        console.log("new subst", new_subst);
                        return query(conc, prems, facts, new_subst);
                    } else {
                        return []
                    }
                })
        )
    }
}

const fire = ([conclusion, ...premises], facts) => {
    return query(conclusion, premises, facts);
}

const step = (rules, facts) => {
    for (const rule of rules) {
        facts = union(facts, fire(rule, facts));
    }
    return facts;
}

const deduceAll = (rules, facts) => {
    const newFacts = step(rules, facts);
    console.log("facts", facts);
    console.log("new facts", newFacts);
    if (R.equals(facts, newFacts)) {
        return facts;
    } else {
        return deduceAll(rules, newFacts);
    }
}

const ex_facts_1 = [
    ["person", "bob"],
    ["person", "john"],
    ["loves", "bob", "john"]
];

const ex_rules_1 = [
    [["loves", "X", "X"], ["person", "X"]]
]

console.log("conjunctive query example", deduceAll(ex_rules_1, ex_facts_1));

const ex_facts_2 = [
    ["edge", "a", "b"],
    ["edge", "b", "c"],
    ["edge", "c", "d"]
];

const ex_rules_2 = [
    [["path", "X", "Y"], ["edge", "X", "Y"]],
    [["path", "X", "Z"], ["path", "X", "Y"], ["path", "Y", "Z"]]
]
console.log("transitive closure example", deduceAll(ex_rules_2, ex_facts_2));
