import * as P from "parsimmon";

const Nodes = {
    Boolean: "Boolean",
    Identifier: "Identifier",
    Variable: "Variable",
    BasicTerm: "BasicTerm",
    ArithmeticTerm: "ArithmeticTerm",
    Term: "Term",
    BooleanFunctionTerm: "BooleanFunctionTerm",
    FunctionLiteral: "FunctionLiteral",
    Statics: "Statics",
    DefinedFluents: "DefinedFluents",
    BasicFluents: "BasicFluents",
    ArithmeticExpression: "ArithmeticExpression",
    FunctionDecl: "FunctionDecl",
    Sorts: "Sorts",
    FunctionAssignment: "FunctionAssignment",
    CausalLaw: "CausalLaw",
    StateConstraint: "StateConstraint",
    ExecutabilityCondition: "ExecutabilityCondition",
    Fact: "Fact",
    Eq: "=",
    Neq: "!=",
} as const;

type Boolean = P.Node<"Boolean", boolean>;
type Identifier = P.Node<"Identifier", string>;
type Variable = P.Node<"Variable", string>;
type BasicArithmeticTerm = Variable | Identifier | number;
type BasicTerm = P.Node<"BasicTerm", BasicArithmeticTerm | Boolean>;
type ArithmeticOp = "+" | "-" | "*" | "/";
type ArithmeticTerm = P.Node<"ArithmeticTerm", [BasicArithmeticTerm, ArithmeticOp, BasicArithmeticTerm]>;
type Term = ArithmeticTerm | BasicTerm;
type BooleanFunctionTerm = P.Node<"BooleanFunctionTerm", { negated: boolean, fn: Identifier, args: BasicTerm[] }>
type FunctionAssignment = P.Node<"FunctionAssignment", {
    fnTerm: FunctionAssignment | Identifier,
    operator: "=" | "!=",
    ret: Term
}>;
/** Only used internally for type safety. */
type FunctionLiteralInput = FunctionAssignment | BooleanFunctionTerm | [("-" | null), Identifier];
type FunctionLiteral = P.Node<"FunctionLiteral", {
    fn: string,
    args?: Term[],
    ret: Term | true,
    negated: boolean,
    node: FunctionAssignment | BooleanFunctionTerm | Identifier,
}>;


const commaSeparated = (p: P.Parser<any>) => P.sepBy1(p, P.regexp(/\s*,\s*/)).skip(P.optWhitespace);

const sepByWhiteSpace = (...ps: P.Parser<any>[]) =>
    P.seq(
        P.optWhitespace,
        ...ps.map(x => x.skip(P.optWhitespace))
    ).map(([head, ...tail]) => tail)

export const ALM = P.createLanguage({
    True: () => P.string("true"),
    False: () => P.string("false"),
    Boolean: r => P.alt(r.True, r.False)
        .desc("a boolean")
        .map(x => x === "true")
        .node(Nodes.Boolean),
    Integer: () => P.regexp(/(\-)?[0-9]+/).map(x => Number(x)).desc("an integer"),
    Identifier: () => P.regexp(/[a-z]+[A-Za-z0-9_]*/).desc("an identifier").node(Nodes.Identifier),
    Variable: () => P.regexp(/[A-Z]+[A-Za-z0-9_]*/).desc("a variable").node("Variable"),
    ArithmeticOp: () => P.regexp(/\+|\-|\*|\/|mod/).desc("an arithmetic operator (+, -, *, /, or mod)"),
    ComparisonRel: () => P.regexp(/>=|>|<=|</),
    Eq: () => P.string("="),
    Neq: () => P.string("!="),
    ArithmeticRel: r => P.alt(r.ComparisonRel, r.Eq, r.Neq),
    BasicArithmeticTerm: r => P.alt(r.Variable, r.Identifier, r.Integer),
    BasicTerm: r => P.alt(r.BasicArithmeticTerm, r.Boolean).node(Nodes.BasicTerm),
    ArithmeticTerm: r => sepByWhiteSpace(
        r.BasicArithmeticTerm,
        r.ArithmeticOp,
        r.BasicArithmeticTerm
    ).node(Nodes.ArithmeticTerm),
    Term: r => P.alt(r.ArithmeticTerm, r.BasicTerm),
    Negation: () => P.string("-").desc("negation (-)").fallback(null),
    FunctionTerm: r => P.seq(
        r.Identifier,
        commaSeparated(r.BasicTerm)
            .wrap(P.string("("), P.string(")"))),
    BooleanFunctionTerm: r => P.seq(
        r.Negation,
        r.FunctionTerm
    ).map(([negated, [fn, args]]: any) => ({
        negated: Boolean(negated),
        fn,
        args
    })).node(Nodes.BooleanFunctionTerm),
    FunctionAssignment: r => sepByWhiteSpace(
        P.alt(r.FunctionTerm, r.Identifier),
        P.alt(r.Eq, r.Neq),
        r.Term
    )
        .map(([fnTerm, operator, ret]) => ({
            fnTerm,
            operator,
            ret
        }))
        .node(Nodes.FunctionAssignment),
    FunctionLiteral: r => P.alt(
        r.FunctionAssignment,
        r.BooleanFunctionTerm,
        P.seq(r.Negation, r.Identifier))
        .map((_n): FunctionLiteral["value"] => {
            const n = _n as unknown as FunctionLiteralInput;
            switch (true) {
                case "name" in n && n.name === Nodes.FunctionAssignment: {
                    const { fnTerm, ret, operator } = (n as FunctionAssignment).value;
                    if (Array.isArray(fnTerm)) {
                        const [fn, args] = fnTerm;
                        // Some day we should throw an error forbidding a term to be negated
                        // in two places. 
                        return {
                            negated: operator === "!=",
                            fn: fn.value,
                            args,
                            ret,
                            node: n as FunctionAssignment
                        };
                    } else {
                        return {
                            negated: operator === "!=",
                            fn: (fnTerm as Identifier).value,
                            args: [],
                            ret,
                            node: n as FunctionAssignment
                        };
                    }
                }
                case "name" in n && n.name === Nodes.BooleanFunctionTerm: {
                    const { fn: { value: fn }, args, negated } = (n as BooleanFunctionTerm).value;
                    return {
                        negated, fn, args: args, ret: true, node: n as BooleanFunctionTerm
                    };
                }
                case Array.isArray(n): {
                    const [negated, ident] = (n as ["=" | null, Identifier]);
                    return {
                        negated: !!negated,
                        fn: ident.value,
                        args: [],
                        ret: true,
                        node: ident
                    };
                }

                default:
                    throw new Error("unreachable");
            }
        })
        .node(Nodes.FunctionLiteral),
      
    Query: r => commaSeparated(r.FunctionLiteral).skip(P.string(".").skip(P.optWhitespace)),
});
