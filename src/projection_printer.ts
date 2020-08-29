import { Nodes, ModuleAST, Sorts, Statics, Fluents, FunctionDecl, StateConstraint, FunctionLiteral, Variable, ArithmeticExpression, ArithmeticTerm, Term, BasicArithmeticTerm, BasicTerm } from "./parse";
import { unpad } from "./unpad";
import { collectFunctionSignatures } from "./collectFunctionSignatures";
import { Parser } from "parsimmon";


export function printSortNames(sorts: Sorts) {
    return sorts.value.map(({ first, second }) =>
        first.map(({ value: firstSortName }) => [
            `sort(${firstSortName}).`,
            second.map((secondSortName) => {
                if (Array.isArray(secondSortName)) {
                    // Range case
                    return unpad(`
                        holds(static(link(${firstSortName}), integers)).
                        dom(${firstSortName}, ${secondSortName[0]}..${secondSortName[1]}).
                        `);
                } else if ("name" in secondSortName) {
                    // Identifier Case
                    return unpad(`
                        holds(static(link(${firstSortName}), ${secondSortName.value})).
                        `);
                } else {
                    // Set literal case
                    return Array.from(secondSortName).map(({ value }) =>
                        `dom(${firstSortName}, ${value}).`).join(" ");
                }
            }),
        ])).flat(Infinity).join("\n");
}

export function printAttributes({ value: sorts }: Sorts) {
    return sorts.map(({ first, attributes }) =>
        first.map(({ value: firstSortName }) =>
            attributes === null ? "" : attributes.map(({ value: { ident: { value: ident }, args, ret } }) => {
                if (args) {
                    const sort_var_combos = [firstSortName, ...args.map(x => x.value)]
                        .map((ident, i) => [ident, `S${i}`]);
                    const vars = sort_var_combos.map(([_, x]) => x);
                    const doms = sort_var_combos.map(([s, x]) => `dom(${s}, ${x})`).join(", ");
                    return unpad(`
                    attr(${ident}(${vars.join(",")}), Ret) :- ${doms}, dom(${ret.value}, Ret).
                    `);
                } else {
                    return unpad(`
                        attr(${ident}(X), Ret) :- dom(${firstSortName}, X), dom(${ret.value}, Ret).
                        `);
                }
            })
        ),
    ).flat(Infinity).join("\n");
}

export function printStatics({ value: statics }: Statics) {
    return statics.map(({ value: { ident: { value: ident }, args, ret } }) => {
        if (args) {
            const sort_var_combos = args.map(x => x.value)
                .map((ident, i) => [ident, `S${i}`]);
            const vars = sort_var_combos.map(([_, x]) => x);
            const doms = sort_var_combos.map(([s, x]) => `dom(${s}, ${x})`).join(", ");
            return unpad(`
                static(${ident}(${vars.join(", ")}), Ret) :- ${doms}, dom(${ret.value}, Ret).
                `);
        } else {
            return unpad(`
                static(${ident}, Ret) :- dom(${ret.value}, Ret).
                `);
        }
    }).flat(Infinity).join("\n");
}

export function printFluents({ basic, defined }: Fluents) {
    const fluentPrinter = (basicOrDefined: string) =>
        ({ value: { ident: { value: ident }, args, ret } }: FunctionDecl) => {
            if (args) {
                const sort_var_combos = args.map(x => x.value)
                    .map((ident, i) => [ident, `S${i}`]);
                const vars = sort_var_combos.map(([_, x]) => x);
                const doms = sort_var_combos.map(([s, x]) => `dom(${s}, ${x})`).join(", ");
                return unpad(`
                    fluent(${basicOrDefined}, ${ident}(${vars.join(", ")}), Ret) :- ${doms}, dom(${ret.value}, Ret).
                    `);
            } else {
                return unpad(`
                    fluent(${basicOrDefined}, ${ident}, Ret) :- dom(${ret.value}, Ret).
                    `);
            }
        };
    return [
        basic?.value.map(fluentPrinter("basic")) ?? [],
        defined?.value.map(fluentPrinter("defined")) ?? [],
    ].flat(Infinity).join("\n");
}

function isVariable(x: any): x is Variable {
    return typeof x === "object" && x.name === Nodes.Variable;
}

function getVariablesFromFnLit(fnLit: FunctionLiteral): { args: [Variable, number][][], ret: Variable[] | null } {
    const { args, ret } = fnLit.value;
    return {
        ret: (() => {
            if (ret === true) {
                return null
            } else if (ret.name === "BasicTerm") {
                return isVariable(ret.value) ? [ret.value] : null;
            } else {
                return ret.value.filter(isVariable);
            }
        })(),
        args: args.map((arg, i) => {
            if (Array.isArray(arg.value)) {
                return arg.value.filter(isVariable)
                    .map(t => [t, i]);
            } else if (isVariable(arg.value)) {
                return [[arg.value, i]]
            } else {
                return []
            }
        }),
    }
}

function getVariablesFromArithmeticTerm({ value: [left, _, right] }: ArithmeticTerm) {
    return [left, right].filter(isVariable);
}

function getVariablesFromTerm(term: Term) {
    return term.name === "BasicTerm"
        ? (isVariable(term.value) ? [term.value] : [])
        : getVariablesFromArithmeticTerm(term);

}

const printBasicArithmeticTerm = (term: BasicArithmeticTerm) =>
    (typeof term === "number") ? term.toString() : term.value;

const printArithmeticTerm = ({ value: [left, op, right] }: ArithmeticTerm) =>
    `${printBasicArithmeticTerm(left)} ${op} ${printBasicArithmeticTerm(right)}`;

const printBasicTerm = (term: BasicTerm) =>
    (typeof term.value === "object" && term.value.name === "Boolean")
        ? `${term.value.value}`
        : printBasicArithmeticTerm(term.value);

const printTerm = (term: Term) =>
    (term.name === "ArithmeticTerm")
        ? printArithmeticTerm(term)
        : printBasicTerm(term);

export function printStateConstraints(mod: ModuleAST): string {
    const fnSignatures = collectFunctionSignatures(mod);
    const state_constraints = mod.axioms.filter(({ name }) => name === Nodes.StateConstraint)
        .map((axiom, i) => {
            const { value: { body, head } } = axiom as unknown as StateConstraint;
            const varMap = body.filter(clause => clause.name === "FunctionLiteral")
                .reduce((prev, curr) => {
                    const vars = getVariablesFromFnLit(curr as FunctionLiteral);
                    const sig = fnSignatures[(curr as FunctionLiteral).value.fn];
                    for (const a of vars.args) {
                        for (const [v, n] of a) {
                            prev[v.value] = sig.args![n];
                        }
                    }
                    if (vars.ret) {
                        for (const r of vars.ret) {
                            prev[r.value] = sig.ret;
                        }
                    }
                    return prev;
                }, {} as Record<string, string>);

            for (const clause of body.filter(clause => clause.name === "ArithmeticExpression")) {
                const { value: [left, _, right] } = clause as ArithmeticExpression;

                const vars = getVariablesFromTerm(left).concat(getVariablesFromTerm(right));

                const varInMap = vars.find(x => x.value in varMap);
                const sort = varMap[varInMap!.value];

                for (const v of vars) {
                    if (!(v.value in varMap)) {
                        varMap[v.value] = sort;
                    }
                }
            }
            const vars = Object.keys(varMap).join(", ");
            const doms = []
            for (const key in varMap) {
                doms.push(`dom(${varMap[key]}, ${key})`)
            };

            const head_rule = (() => {
                if (head !== "false") {
                    const { fn, args, ret, negated } = head.value;
                    const ret_str = typeof ret === "object"
                        ? printTerm(ret) : "true";
                    const args_str = args.map(printTerm).join(", ");
                    const wrapper = negated ? "neg" : "pos";
                    return `${wrapper}(${fn}(${args_str}), ${ret_str})`;
                } else {
                    return ""
                }
            })();
            const doms_str = doms.join(", ");
            return unpad(`
            state_constraint(axiom${i + 1}(${vars})) :- ${doms_str}.
            head(axiom${i + 1}(${vars}), ${head_rule}) :- ${doms_str}.
            `);
        });
    return state_constraints.join("\n");
}

export function printCausalLaws(mod: ModuleAST): string {
    const fnSignatures = collectFunctionSignatures(mod);
    const state_constraints = mod.axioms.filter(({ name }) => name === Nodes.StateConstraint)
        .map((axiom, i) => {
            const { value: { body, head } } = axiom as unknown as StateConstraint;
            const varMap = body.filter(clause => clause.name === "FunctionLiteral")
                .reduce((prev, curr) => {
                    const vars = getVariablesFromFnLit(curr as FunctionLiteral);
                    const sig = fnSignatures[(curr as FunctionLiteral).value.fn];
                    for (const a of vars.args) {
                        for (const [v, n] of a) {
                            prev[v.value] = sig.args![n];
                        }
                    }
                    if (vars.ret) {
                        for (const r of vars.ret) {
                            prev[r.value] = sig.ret;
                        }
                    }
                    return prev;
                }, {} as Record<string, string>);

            for (const clause of body.filter(clause => clause.name === "ArithmeticExpression")) {
                const { value: [left, _, right] } = clause as ArithmeticExpression;

                const vars = getVariablesFromTerm(left).concat(getVariablesFromTerm(right));

                const varInMap = vars.find(x => x.value in varMap);
                const sort = varMap[varInMap!.value];

                for (const v of vars) {
                    if (!(v.value in varMap)) {
                        varMap[v.value] = sort;
                    }
                }
            }
            const vars = Object.keys(varMap).join(", ");
            const doms = []
            for (const key in varMap) {
                doms.push(`dom(${varMap[key]}, ${key})`)
            };

            const head_rule = (() => {
                if (head !== "false") {
                    const { fn, args, ret, negated } = head.value;
                    const ret_str = typeof ret === "object"
                        ? printTerm(ret) : "true";
                    const args_str = args.map(printTerm).join(", ");
                    const wrapper = negated ? "neg" : "pos";
                    return `${wrapper}(${fn}(${args_str}), ${ret_str})`;
                } else {
                    return ""
                }
            })();
            const doms_str = doms.join(", ");
            return unpad(`
            state_constraint(axiom${i + 1}(${vars})) :- ${doms_str}.
            head(axiom${i + 1}(${vars}), ${head_rule}) :- ${doms_str}.
            `);
        });
    return state_constraints.join("\n");
}
// // export function printProjection(mod: ModuleAST) {

//     attributes === null ? "" : (...attributes!.map(attr => ""))
//     const rules = [
//         "dom(Ret, X) :- subsort(S, Ret), dom(S, X).",
//         printSortNames(mod.sorts),

//     ];
// }