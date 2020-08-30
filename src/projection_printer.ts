import { Nodes, ModuleAST, Sorts, Statics, Fluents, FunctionDecl, StateConstraint, FunctionLiteral, Variable, ArithmeticExpression, ArithmeticTerm, Term, BasicArithmeticTerm, BasicTerm, CausalLaw, Fact } from "./parse";
import { unpad } from "./unpad";
import { collectFunctionSignatures } from "./collectFunctionSignatures";
import { range } from "rambda";


export function printSortNames(sorts: Sorts) {
    return sorts.value.map(({ first, second }) =>
        first.map(({ value: firstSortName }) => [
            `sort(${firstSortName}).`,
            second.map((secondSortName) => {
                if (Array.isArray(secondSortName)) {
                    const doms = range(secondSortName[0], secondSortName[1] + 1)
                   .map(x => `dom(${firstSortName}, ${x}).`).join(" ") 
                   const is_a = range(secondSortName[0], secondSortName[1] + 1)
                   .map(x => `holds(static(is_a(${x}), ${firstSortName})).`).join(" ") 
                    // Range case
                    return unpad(`
                        holds(static(link(${firstSortName}), integers)).
                        ${doms}
                        ${is_a}
                        `);
                } else if ("name" in secondSortName) {
                    // Identifier Case
                    return unpad(`
                        holds(static(link(${firstSortName}), ${secondSortName.value})).
                        `);
                } else {
                    // Set literal case
                    const arr = Array.from(secondSortName);
                    const doms = arr.map(({ value }) =>
                        `dom(${firstSortName}, ${value}).`).join(" ");
                    const is_a = arr.map(x => `holds(static(is_a(${x.value}), ${firstSortName})).`).join(" ") 
                    return `${doms}\n${is_a}`

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

function getVariablesFromFnLit(fnLit: FunctionLiteral): { args?: [Variable, number][][], ret: Variable[] | null } {
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
        args: args?.map((arg, i) => {
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
function getFnMap(mod: ModuleAST): Record<string, "static" | "fluent"> {
    const statics = {} as Record<string, "static">;
    const stats = [...(mod.statics?.value ?? []),
    ...(mod.sorts?.value.filter(x => x.attributes).flatMap(x => x.attributes!) ?? [])
    ];
    for (const x of stats) {
        statics[x.value.ident.value] = "static";
    }

    const fluents = {} as Record<string, "fluent">;
    const f = [...mod.fluents?.basic?.value ?? [],
    ...mod.fluents?.defined?.value ?? [],
    ];

    for (const x of f) {
        fluents[x.value.ident.value] = "fluent";
    }
    return {
        "instance": "static",
        // "is_a": "static",
        ...statics,
        ...fluents
    };
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
    const state_constraints = mod.axioms?.filter(({ name }) => name === Nodes.StateConstraint)
        .map((axiom, i) => {
            const { value: { body, head } } = axiom as unknown as StateConstraint;
            const literals = body.filter(clause => clause.name === "FunctionLiteral")
                .concat(head !== "false" ? [head] : []);
            const varMap = literals
                .reduce((prev, curr) => {
                    const vars = getVariablesFromFnLit(curr as FunctionLiteral);
                    const sig = fnSignatures[(curr as FunctionLiteral).value.fn];
                    for (const a of vars?.args ?? []) {
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
                const { value: [left, , right] } = clause as ArithmeticExpression;

                const vars = getVariablesFromTerm(left).concat(getVariablesFromTerm(right));

                const varInMap = vars.find(x => x.value in varMap);
                const sort = varMap[varInMap!.value];

                for (const v of vars) {
                    if (!(v.value in varMap)) {
                        varMap[v.value] = sort;
                    }
                }
            }
            
            const vars = Object.keys(varMap).length ?
                `(${Object.keys(varMap).join(", ")})`
                : "";
                
            const doms = []
            for (const key in varMap) {
                doms.push(`dom(${varMap[key]}, ${key})`)
            };

            const head_rule = (() => {
                if (head !== "false") {
                    const { fn, args, ret, negated } = head.value;
                    const ret_str = typeof ret === "object"
                        ? printTerm(ret) : "true";
                    const args_str = args?.length ? `(${args.map(printTerm).join(", ")})` : "";
                    const sign = negated ? "neg" : "pos";
                    return `${sign}_fluent(${fn}${args_str}, ${ret_str})`;
                } else {
                    return ""
                }
            })();

            const doms_str = doms.length ?
                ` :- ${doms.join(", ")}`
                : "";
            const rule_name = `state_constraint${i + 1}${vars}`;
            const fnMap = getFnMap(mod);
            const body_rules = body.map(x => {
                const cond = (() => {
                    switch (x.name) {
                        case "FunctionLiteral":
                            const { fn, args, ret, negated } = x.value;
                            const type = fnMap[x.value.fn];
                            const sign = negated ? "neg" : "pos";
                            const args_str = args?.length ? `(${args.map(printTerm).join(", ")})` : "";
                            const ret_str = typeof ret === "object"
                                ? printTerm(ret) : "true";
                            return `${sign}_${type}(${fn}${args_str}, ${ret_str})`
                        case "ArithmeticExpression":
                            const [left, rel, right] = x.value;
                            const relMap = {
                                ">": "gt",
                                "<": "lt",
                                ">=": "gte",
                                "<=": "lte",
                                "=": "eq",
                                "!=": "neq"
                            };
                            return `${relMap[rel]}(${printTerm(left)}, ${printTerm(right)})`;
                    }
                })();
                return `body(${rule_name}, ${cond})${doms_str}.`
            }).join("\n");

            return unpad(`
            state_constraint(${rule_name})${doms_str}.
            head(${rule_name}, ${head_rule})${doms_str}.
            
            ${body_rules}
            `);
        });
    return state_constraints?.join("\n") ?? "";
}

export function printCausalLaws(mod: ModuleAST): string {
    const fnSignatures = collectFunctionSignatures(mod);
    const causal_laws = mod.axioms?.filter(({ name }) => name === Nodes.CausalLaw)
        .map((axiom, i) => {
            const { value: { occurs, body, head } } = axiom as unknown as CausalLaw;
            const literals = body.filter(clause => clause.name === "FunctionLiteral")
                .concat(head);
            const varMap = literals
                .reduce((prev, curr) => {
                    const vars = getVariablesFromFnLit(curr as FunctionLiteral);
                    const sig = fnSignatures[(curr as FunctionLiteral).value.fn];

                    for (const a of vars?.args ?? []) {
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
                const { value: [left, , right] } = clause as ArithmeticExpression;

                const vars = getVariablesFromTerm(left).concat(getVariablesFromTerm(right));

                const varInMap = vars.find(x => x.value in varMap);
                const sort = varMap[varInMap!.value];

                for (const v of vars) {
                    if (!(v.value in varMap)) {
                        varMap[v.value] = sort;
                    }
                }
            }

            varMap[occurs.value] = "actions";
            const vars = Object.keys(varMap).join(", ");
            const doms = [];
            for (const key in varMap) {
                doms.push(`dom(${varMap[key]}, ${key})`)
            };

            const doms_str = doms.join(", ");
            const rule_name = `causal_law${i + 1}(${vars})`;
            const fnMap = getFnMap(mod);
            const body_rules = body.map(x => {
                const cond = (() => {
                    switch (x.name) {
                        case "FunctionLiteral":
                            const { fn, args, ret, negated } = x.value;
                            if (fn === "filter") {
                                console.log(fnMap);
                            }
                            const type = fnMap[x.value.fn];
                            const sign = negated ? "neg" : "pos";
                            const args_str = args?.length ? `(${args.map(printTerm).join(", ")})` : "";
                            const ret_str = typeof ret === "object"
                                ? printTerm(ret) : "true";
                            return `${sign}_${type}(${fn}${args_str}, ${ret_str})`
                        case "ArithmeticExpression":
                            const [left, rel, right] = x.value;
                            const relMap = {
                                ">": "gt",
                                "<": "lt",
                                ">=": "gte",
                                "<=": "lte",
                                "=": "eq",
                                "!=": "neq"
                            };
                            return `${relMap[rel]}(${printTerm(left)}, ${printTerm(right)})`;
                    }
                })();
                return `body(${rule_name}, ${cond}) :- ${doms_str}.`
            }).join("\n");

            const head_rules = head.map(({value: { fn, args, ret, negated } }) => {
                const ret_str = typeof ret === "object"
                    ? printTerm(ret) : "true";
                const args_str = args?.length ? `(${args.map(printTerm).join(", ")})` : "";
                const sign = negated ? "neg" : "pos";
                return `head(causal_law${i + 1}(${vars}), ${sign}_fluent(${fn}${args_str}, ${ret_str})) :- ${doms_str}.`;
            }).join("\n");

            return unpad(`
            dlaw(causal_law${i + 1}(${vars})) :- ${doms_str}.
            action(causal_law${i + 1}(${vars}), ${occurs.value}) :- ${doms_str}.
            ${head_rules}

            ${body_rules}
            `);
        });
    return causal_laws?.join("\n") ?? "";
}

export function printStaticAssignments(mod: ModuleAST): string {
    return mod.axioms?.filter(x => x.name === "Fact" && x.value.value.negated === false)
        .map((axiom) => {
            const { value: { value: { fn, ret, args } } } = axiom as Fact;
            const args_str = args?.length ? `(${args.map(printTerm).join(", ")})` : "";
            const ret_str = ret === true ? "true" : printTerm(ret);
            return `holds(static(${fn}${args_str}, ${ret_str})).`
        }).join("\n") ?? ""
}

export function printInitially(mod: ModuleAST): string {
    return mod.initially?.filter(x => x.name === "Fact" && x.value.value.negated === false)
    .map((fact) => {
        const { value: { value: { fn, ret, args } } } = fact;
        const args_str = args?.length ? `(${args.map(printTerm).join(", ")})` : "";
        const ret_str = ret === true ? "true" : printTerm(ret);
        return `holds(${fn}${args_str}, ${ret_str}, 0).`
    }).join("\n") ?? "";
}

export function printModule(mod: ModuleAST): string {
    return unpad(`
    :-use_module(library(lists)).
    :-dynamic(time/1).
    :-dynamic(occurs/2).
    :-dynamic(holds/3).
    :-dynamic(nholds/3).
    :-dynamic(holds/1).
    :-dynamic(dom/2).
    :-dynamic(body_satisfied/2).
    
    :-discontiguous(holds/3).
    :-discontiguous(holds/1).
    :-discontiguous(nholds/3).
    :-discontiguous(dom/2).
    :-discontiguous(body/2).
    :-discontiguous(head/2).
    :-discontiguous(dlaw/1).
    :-discontiguous(action/2).
    

    ${mod.sorts ? printSortNames(mod.sorts) : ""}
    
    ${mod.sorts ? printAttributes(mod.sorts) : ""}

    ${mod.statics ? printStatics(mod.statics) : ""}

    ${mod.fluents ? printFluents(mod.fluents) : ""}

    ${printStateConstraints(mod)}

    ${printCausalLaws(mod)}

    ${printStaticAssignments(mod)}

    ${printInitially(mod)}

    count(X, E, N) :- findall(X, E, L), length(L, N).

    body_satisfied(R,T) :-
        time(T),
        count(F, (body(R,pos_fluent(F,V)), fluent(_,F,V)), FPB),
        count( F, (body(R,pos_fluent(F,V)), fluent(_,F,V), holds(F, V, T) ), FPB),

        count( F, (body(R,neg_fluent(F,V)), fluent(_,F,V)), FNB),
        count( F, (body(R,neg_fluent(F,V)), fluent(_, F,V), nholds(F,V,T)), FNB),

        count( F, (body(R,pos_static(F,V))), SPB),
        count( F, (body(R,pos_static(F,V)), holds(static(F,V))), SPB),

        count( F, (body(R,neg_static(F,V))), SNB),
        count( F, (body(R,neg_static(F,V)), \\+ holds(static(F,V))), SNB),

        count( E, (body(R, gt(A, B))),  GT),
        count( E, (body(R, gt(A, B)), A > B),  GT),

        count( E, (body(R, gte(A, B))),  GTE),
        count( E, (body(R, gte(A, B)), A >= B),  GTE),

        count( E, (body(R, lt(A, B))),  LT),
        count( E, (body(R, lt(A, B)), A < B),  LT),

        count( E, (body(R, lte(A, B))),  LTE),
        count( E, (body(R, lte(A, B)), A =< B),  LTE),

        count( E, (body(R, eq(A, B))),  EQ),
        count( E, (body(R, eq(A, B)), A =:= B ),  EQ),

        count( E, (body(R, neq(A, B))),  NEQ),
        count( E, (body(R, neq(A, B)), A =\= B ),  NEQ).

    holds_next(F, V, T) :-
        dlaw(R),
        action(R, X),
        occurs(X, T),
        body_satisfied(R, T),
        head(R, pos_fluent(F,V)), !.
    
    nholds_next(F, V, T) :-
        dlaw(R),
        action(R, X),
        occurs(X, T),
        body_satisfied(R, T),
        head(R, neg_fluent(F,V)), !.
    
    holds(F, V, T) :-
        state_constraint(R),
        head(R, pos_fluent(F,V)),
        body_satisfied(R, T).
    
    nholds(F, V, T) :-
        state_constraint(R),
        head(R, neg_fluent(F,V)),
        body_satisfied(R, T).
    
    nholds(F, V, T) :- fluent(defined, F, V), \\+ holds(F, V, T).

    holds_inertia(F, V, T2) :-
	    T1 is T2 - 1,
        holds(F, V, T1),
        fluent(basic, F, V),
        \\+ nholds(F, V, T2). 

    nholds_inertia(F, V, T2) :-
	    T1 is T2 - 1,
        holds(F, V, T1),
        fluent(basic, F, V),
        \\+ nholds(F, V, T2). 

    dom(S1, X) :- holds(static(link(S2), S1)), dom(S2, X).

    holds(static(link(booleans), universe)).
    dom(booleans, true). dom(booleans, false).

    holds(static(link(actions), universe)).

    holds(static(instance(X, S), true)) :- dom(S, X).
    `)
}

/*








*/