import * as P from "parsimmon";

export const Nodes = {
    Boolean: "Boolean",
    Identifier: "Identifier",
    Variable: "Variable",
    BasicTerm: "BasicTerm",
    ArithmeticTerm: "ArithmeticTerm",
    Term: "Term",
    FunctionTerm: "FunctionTerm",
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
    Boolean: r => P.alt(r.True, r.False)
        .desc("a boolean")
        .map(Boolean)
        .node(Nodes.Boolean),
    Integer: () => P.regexp(/(\-)?[0-9]+/).map(x => Number(x)).desc("an integer"),
    Identifier: () => P.regexp(/[a-z]+[A-Za-z0-9]*/).desc("an identifier").node(Nodes.Identifier),
    Variable: () => P.regexp(/[A-Z]+[A-Za-z0-9]*/).desc("a variable").node("Variable"),
    ArithmeticOp: () => P.regexp(/\+|\-|\*|\/|mod/).desc("an arithmetic operator (+, -, *, /, or mod)"),
    ComparisonRel: () => P.regexp(/>|>=|<|<=/),
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
        commaSeparated(r.Term)
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
    FunctionLiteral: r => P.alt(r.FunctionAssignment, r.FunctionTerm, r.Identifier),
    ArithmeticExpression: r => sepByWhiteSpace(r.Term, r.ArithmeticRel, r.Term)
        .node(Nodes.ArithmeticExpression),
    Literal: r => P.alt(
        r.FunctionLiteral,
        r.ArithmeticExpression,
    ),
    VarOrID: r => P.alt(r.Variable, r.Identifier),
    Body: r => commaSeparated(r.Literal).skip(P.string(".")).skip(P.optWhitespace),
    Occurs: r => r.VarOrID.wrap(
        P.optWhitespace.skip(P.string("occurs(")),
        P.optWhitespace.skip(P.string(")"))
    ).skip(P.optWhitespace),
    CausalLaw: r => sepByWhiteSpace(
        r.Occurs.skip(P.string("causes")),
        r.FunctionLiteral,
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
    Attributes: r => section(
        "attributes",
        r.FunctionDecl.wrap(P.optWhitespace, P.optWhitespace).atLeast(1)
    ),
    Arguments: r => P.sepBy1(r.Identifier, P.regexp(/\s*x\s*/))
        .skip(P.optWhitespace)
        .skip(P.string("->"))
        .skip(P.optWhitespace),
    SortName: r => P.alt(r.Identifier, P.seq(r.Integer, P.string(".."), r.Integer)),
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
        .map(([sorts, statics, fluents, axioms, initially]) => ({
            sorts, statics, fluents, axioms, initially
        })),
});
