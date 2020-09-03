import * as P from "parsimmon";

export const Nodes = {
    Boolean: "Boolean",
    Identifier: "Identifier",
    Variable: "Variable",
    BasicTerm: "BasicTerm",
    ArithmeticTerm: "ArithmeticTerm",
    Term: "Term",
    FunctionTerm: "FunctionTerm",
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

export type Boolean = P.Node<"Boolean", boolean>;
export type Identifier = P.Node<"Identifier", string>;
export type Variable = P.Node<"Variable", string>;
export type BasicArithmeticTerm = Variable | Identifier | number;
export type BasicTerm = P.Node<"BasicTerm", BasicArithmeticTerm | Boolean>;
export type ArithmeticOp = "+" | "-" | "*" | "/";
export type ArithmeticTerm = P.Node<"ArithmeticTerm", [BasicArithmeticTerm, ArithmeticOp, BasicArithmeticTerm]>;
export type ComparisonRel = ">" | ">=" | "<" | "<=";
export type ArithmeticRel = ComparisonRel | "=" | "!=";
export type Term = ArithmeticTerm | BasicTerm;
export type FunctionTerm = P.Node<"FunctionTerm", { negated: boolean, fn: Identifier, args: BasicTerm[] }>
export type FunctionAssignment = P.Node<"FunctionAssignment", {
    fnTerm: FunctionTerm | Identifier,
    operator: "=" | "!=",
    ret: Term
}>;
/** Only used internally for type safety. */
type FunctionLiteralInput = FunctionAssignment | FunctionTerm | [("-" | null), Identifier];
export type FunctionLiteral = P.Node<"FunctionLiteral", {
    fn: string,
    args?: Term[],
    ret: Term | true,
    negated: boolean,
    node: FunctionAssignment | FunctionTerm | Identifier,
}>;
export type ArithmeticExpression = P.Node<"ArithmeticExpression", [Term, ArithmeticRel, Term]>
export type Literal = FunctionLiteral | ArithmeticExpression;
export type Body = Literal[];
export type Occurs = Variable;
export type CausalLaw = P.Node<"CausalLaw", { occurs: Occurs, head: FunctionLiteral[], body: Body }>
export type SCHead = "false" | FunctionLiteral;
export type StateConstraint = P.Node<"StateConstraint", { head: SCHead, body: Body }>;
export type ExecutabilityCondition = P.Node<"ExecutabilityCondition", { occurs: Occurs, body: Body }>;
export type SortDecl = { first: Identifier[], second: SortName[], attributes: Attributes | null };
export type Sorts = P.Node<"Sorts", SortDecl[]>;
export type SortName = Identifier | [number, number] | Set<Identifier>;
export type Attributes = FunctionDecl[];
export type Arguments = Identifier[];
export type Statics = P.Node<"Statics", FunctionDecl[]>
export type Fluents = { basic: BasicFluents | null, defined: DefinedFluents | null };
export type BasicFluents = P.Node<"BasicFluents", FunctionDecl[]>;
export type DefinedFluents = P.Node<"DefinedFluents", FunctionDecl[]>;
export type FunctionDecl = P.Node<"FunctionDecl", { ident: Identifier, args: Arguments | null, ret: Identifier }>
export type Axioms = Axiom[];
export type Fact = P.Node<"Fact", FunctionLiteral>;
export type Axiom = CausalLaw | StateConstraint | ExecutabilityCondition | Fact;
export type Initially = Fact[];
export type ModuleAST = {
    sorts: Sorts | null,
    statics: Statics | null,
    fluents: Fluents | null,
    axioms: Axioms | null;
    initially: Initially | null;
};

const commaSeparated = (p: P.Parser<any>) => P.sepBy1(p, P.regexp(/\s*,\s*/)).skip(P.optWhitespace);

const section = (header: string, p: P.Parser<any>) =>
    P.string(header)
        .trim(P.optWhitespace)
        .then(p.skip(P.optWhitespace));

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
        r.Negation,
        r.Identifier,
        commaSeparated(r.BasicTerm)
            .wrap(P.string("("), P.string(")")))
        .map(([negated, fn, args]) => ({
            negated: Boolean(negated),
            fn,
            args
        })).node(Nodes.FunctionTerm),
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
        r.FunctionTerm,
        P.seq(r.Negation, r.Identifier))
        .map((_n): FunctionLiteral["value"] => {
            const n = _n as unknown as FunctionLiteralInput;
            switch (true) {
                case "name" in n && n.name === Nodes.FunctionAssignment: {
                    const { fnTerm, ret, operator } = (n as FunctionAssignment).value;
                    if (fnTerm.name === "FunctionTerm") {
                        const { args, fn, negated } = fnTerm.value;
                        // Some day we should throw an error forbidding a term to be negated
                        // in two places. 
                        const neg = negated || operator === "!=";
                        return {
                            negated: neg,
                            fn: fn.value,
                            args,
                            ret,
                            node: n as FunctionAssignment
                        };
                    } else {
                        return {
                            negated: operator === "!=",
                            fn: fnTerm.value,
                            args: [],
                            ret,
                            node: n as FunctionAssignment
                        };
                    }
                }
                case "name" in n && n.name === Nodes.FunctionTerm: {
                    const { fn: { value: fn }, args, negated } = (n as FunctionTerm).value;
                    return {
                        negated, fn, args: args, ret: true, node: n as FunctionTerm
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
    ArithmeticExpression: r => sepByWhiteSpace(r.Term, r.ArithmeticRel, r.Term)
        .node(Nodes.ArithmeticExpression),
    Literal: r => P.alt(
        r.FunctionLiteral,
        r.ArithmeticExpression,
    ),
    Body: r => commaSeparated(r.Literal).skip(P.string(".")).skip(P.optWhitespace),
    Occurs: r => r.Variable.wrap(
        P.optWhitespace.skip(P.string("occurs(")),
        P.optWhitespace.skip(P.string(")"))
    ).skip(P.optWhitespace),
    CausalLaw: r => sepByWhiteSpace(
        r.Occurs.skip(P.string("causes")),
        commaSeparated(r.FunctionLiteral),
        P.string("if"),
        r.Body,
    ).map(([occurs, head, _, body]) => ({
        occurs, head, body
    })).node(Nodes.CausalLaw),
    SCHead: r => P.alt(P.string("false"), r.FunctionLiteral),
    StateConstraint: r => sepByWhiteSpace(
        r.SCHead,
        P.string("if"),
        r.Body,
    ).map(([head, _, body]: any) => ({ head, body }))
        .node(Nodes.StateConstraint),
    ExecutabilityCondition: r => sepByWhiteSpace(
        P.string("impossible"),
        r.Occurs,
        P.string("if"),
        r.Body,
    ).node(Nodes.ExecutabilityCondition)
        .map(({ value: [_, occurs, __, body], ...node }) => ({
            value: { occurs, body },
            ...node
        })),
    Sorts: r => section("sorts", r.SortDecl.many()).node(Nodes.Sorts),
    SortDecl: r => sepByWhiteSpace(
        commaSeparated(r.Identifier).skip(P.string("::")),
        commaSeparated(r.SortName),
        r.Attributes.fallback(null)
    ).map(([first, second, attributes]) => ({ first, second, attributes })),
    Set: r => commaSeparated(r.Identifier)
        .wrap(
            P.string("{").skip(P.optWhitespace),
            P.string("}").skip(P.optWhitespace)
        ).map(x => new Set(x)),
    SortName: r => P.alt(
        r.Identifier,
        P.seq(r.Integer.skip(P.string("..")), r.Integer),
        r.Set,
    ),
    Attributes: r => section(
        "attributes",
        r.FunctionDecl.trim(P.optWhitespace).atLeast(1)
    ),
    Arguments: r => P.sepBy1(r.Identifier, P.regexp(/\s*x\s*/))
        .skip(P.optWhitespace)
        .skip(P.string("->"))
        .skip(P.optWhitespace),
    Statics: r => section("statics", r.FunctionDecl.many()).node(Nodes.Statics),
    Fluents: r => section("fluents", P.seq(r.BasicFluents.fallback(null), r.DefinedFluents.fallback(null)))
        .map(([basic, defined]) => ({ basic, defined })),
    BasicFluents: r => section("basic", r.FunctionDecl.many()).node(Nodes.BasicFluents),
    DefinedFluents: r => section("defined", r.FunctionDecl.many()).node(Nodes.DefinedFluents),
    FunctionDecl: r => sepByWhiteSpace(
        r.Identifier.skip(P.seq(P.optWhitespace, P.string(":"), P.optWhitespace)),
        r.Arguments.fallback(null),
        r.Identifier
    ).map(([ident, args, ret]) => ({ ident, args, ret }))
        .node(Nodes.FunctionDecl),
    Axioms: r => section("axioms", r.Axiom.many()),
    Fact: r => r.FunctionLiteral.skip(P.string(".")).node(Nodes.Fact),
    Axiom: r => P.alt(
        r.CausalLaw,
        r.StateConstraint,
        r.ExecutabilityCondition,
        r.Fact
    ),
    Initially: r => section("initially", r.Fact.many()),
    ModuleBody: r =>
        sepByWhiteSpace(
            r.Sorts.fallback(null),
            r.Statics.fallback(null),
            r.Fluents.fallback(null),
            r.Axioms.fallback(null),
            r.Initially.fallback(null),
        ),
    Module: r => section("module", sepByWhiteSpace(r.Identifier, r.ModuleBody))
        .map(([moduleName, [sorts, statics, fluents, axioms, initially]]) => ({
            moduleName, sorts, statics, fluents, axioms, initially
        })),
    Query: r => commaSeparated(r.FunctionLiteral).skip(P.string(".").skip(P.optWhitespace)),
    String: r => P.regexp(/"((?:\\.|.)*?)"/, 1),
    QueryVars: r => commaSeparated(r.Variable)
        .trim(P.string('"'))
        .map(x => x.map(y => y.value)),
    QueryResult: r => P.seq(
        r.String.skip(P.string(",")),
        r.QueryVars.skip(P.string(",")),
        commaSeparated(P.alt(
            r.Integer,
            r.Boolean.map(x => x.value),
            r.String,
            r.Identifier.map(x => x.value)))
    ).wrap(P.string("("), P.string(")"))
});

export function parseModule(mod: string): ModuleAST {
    return ALM.Module.tryParse(mod);
}
