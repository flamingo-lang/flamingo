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
    _FunctionLiteralInput: "FunctionLiteralInput",
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
type FunctionLiteralInput = P.Node<"FunctionLiteral", FunctionAssignment | FunctionTerm | [("-" | null), Identifier]>
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
    sorts: Sorts | null ,
    statics: Statics | null,
    fluents: Fluents | null,
    axioms: Axioms | null;
    initially: Initially | null;
};

const jump = (a: P.Parser<any>, b: P.Parser<any>) =>
    P.seq(a, b).map(x => x[1]);

const commaSeparated = (p: P.Parser<any>) => P.sepBy1(p, P.regexp(/\s*,\s*/)).skip(P.optWhitespace);

const section = (header: string, p: P.Parser<any>) => jump(
    P.string(header).wrap(P.optWhitespace, P.optWhitespace),
    p.skip(P.optWhitespace),
);

const sepByWhiteSpace = (...ps: P.Parser<any>[]) =>
    P.seq(
        P.optWhitespace,
        ...ps.map(x => x.skip(P.optWhitespace))
    )
        .map(([head, ...tail]) => tail)

export const ALM = P.createLanguage({
    True: () => P.string("true"),
    False: () => P.string("false"),
    Boolean : r => P.alt(r.True, r.False)
        .desc("a boolean")
        .map(Boolean)
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
        .node(Nodes.FunctionTerm)
        .map(({ value: [negated, fn, args], ...node }) => ({
            value: { negated: Boolean(negated), fn, args },
            ...node
        })),
    FunctionAssignment: r => sepByWhiteSpace(
        P.alt(r.FunctionTerm, r.Identifier),
        P.alt(r.Eq, r.Neq),
        r.Term
    )
        .node(Nodes.FunctionAssignment)
        .map(({ value: [fnTerm, operator, ret], ...node }) => ({
            value: { fnTerm, operator, ret },
            ...node
        })),
    FunctionLiteral: r => P.alt(
        r.FunctionAssignment,
        r.FunctionTerm,
        P.seq(r.Negation, r.Identifier))
        .node(Nodes._FunctionLiteralInput)
        .map((_n): FunctionLiteral => {
            const n = _n as unknown as FunctionLiteralInput;
            switch (true) {
                case "name" in n.value && n.value.name === Nodes.FunctionAssignment: {
                    const { value: { fnTerm, ret, operator } } = n.value as FunctionAssignment;
                    if (fnTerm.name === "FunctionTerm") {
                        const { args, fn, negated } = fnTerm.value;
                        // Some day we should throw an error forbidding a term to be negated
                        // in two places. 
                        const neg = negated || operator === "!=";
                        return {
                            ...n,
                            name: Nodes.FunctionLiteral,
                            value: {
                                negated: neg,
                                fn: fn.value,
                                args,
                                ret,
                                node: n.value as FunctionAssignment
                            }
                        };
                    } else {
                        return {
                            ...n,
                            name: Nodes.FunctionLiteral,
                            value: {
                                negated: operator === "!=",
                                fn: fnTerm.value,
                                args: [],
                                ret,
                                node: n.value as FunctionAssignment
                            }
                        };
                    }
                }
                case "name" in n.value && n.value.name === Nodes.FunctionTerm: {
                    const { value: { fn: { value: fn }, args, negated } } = n.value as FunctionTerm;
                    return {
                        ...n,
                        name: Nodes.FunctionLiteral,
                        value: { negated, fn, args: args, ret: true, node: n.value as FunctionTerm }
                    };
                }
                case Array.isArray(n.value): {
                    const [negated, ident] = n.value as ["=" | null, Identifier];
                    return {
                        ...n,
                        name: Nodes.FunctionLiteral,
                        value: { negated: !!negated, fn: ident.value, args: [], ret: true, node: ident }
                    };
                }

                default:
                    throw new Error("unreachable");
            }
        }),
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
    ).node(Nodes.CausalLaw)
        .map(({ value: [occurs, head, _, body], ...node }) => ({
            value: { occurs, head, body },
            ...node
        })),
    SCHead: r => P.alt(P.string("false"), r.FunctionLiteral),
    StateConstraint: r => sepByWhiteSpace(
        r.SCHead,
        P.string("if"),
        r.Body,
    )
        .node(Nodes.StateConstraint)
        .map(({ value: [head, _, body], ...node }) => ({
            value: { head, body },
            ...node
        })),
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
        r.FunctionDecl.wrap(P.optWhitespace, P.optWhitespace).atLeast(1)
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
    ).node(Nodes.FunctionDecl)
        .map(({ name, value: [ident, args, ret], start, end }) => ({
            name, start, end,
            value: { ident, args, ret }
        })),
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
});

export function parseModule(mod: string): ModuleAST {
    return ALM.Module.tryParse(mod);
}
