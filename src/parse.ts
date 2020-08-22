import * as P from "parsimmon";

const commaSeparated = (p: P.Parser<any>) => P.sepBy1(p, P.regexp(/,\s*/));

const section = (header: string, p: P.Parser<any>) => P.string(header).skip(P.whitespace).skip(p);

const ALM = P.createLanguage({
    True: () => P.string("true"),
    False: () => P.string("false"),
    Boolean: r => P.alt(r.True, r.False)
        .desc("a boolean")
        .map(Boolean),
    Integer: () => P.regexp(/(\-)?[0-9]/).map(x => Number(x)).desc("an integer"),
    Identifier: () => P.regexp(/[a-z]+[A-Za-z0-9]*/).desc("an identifier"),
    Variable: () => P.regexp(/[A-Z]+[A-Za-z0-9]*/).desc("a variable"),
    ArithmeticOp: () => P.regexp(/+|\-|\*|\/|mod/),
    ComparisonRel: () => P.regexp(/>|>=|<|<=/),
    Eq: () => P.string("="),
    Neq: () => P.string("!="),
    ArithmeticRel: r => P.alt(r.Eq, r.Neq, r.ComparisonRel),
    BasicArithmeticTerm: r => P.alt(r.Variable, r.Identifier, r.Integer),
    BasicTerm: r => P.alt(r.BasicArithmeticTerm, r.Boolean),
    ArithmeticTerm: r => P.seq(
        r.BasicArithmeticTerm,
        P.whitespace,
        r.ArithmeticOp,
        P.whitespace,
        r.BasicArithmeticTerm
    ),
    Term: r => P.alt(r.BasicTerm, r.ArithmeticTerm),
    FunctionTerm: r => P.seq(
        r.Identifier,
        commaSeparated(r.Term)
        .wrap(P.string("("), P.string(")")
    )),
    PositiveFunctionLiteral: r => P.alt(r.FunctionTerm, P.seq(r.FunctionTerm, P.optWhitespace, r.Eq, P.optWhitespace, r.Term)),
    NegativeFunctionLiteral: r => P.alt(P.seq(P.string("-"), r.FunctionTerm), P.seq(r.FunctionTerm, P.optWhitespace, r.Neq, P.optWhitespace, r.Term)),
    FunctionLiteral: r => P.alt(r.PositiveFunctionLiteral, r.NegativeFunctionLiteral),
    Literal: r => P.alt(r.FunctionLiteral, P.seq(r.ArithmeticTerm, P.optWhitespace, r.ArithmeticRel, P.optWhitespace, r.ArithmeticTerm)),
    VarOrID: r => P.alt(r.Variable, r.Identifier),
    Body: r => commaSeparated(r.Literal),
    Occurs: r => r.VarOrID.wrap(P.string("occurs("), P.string(")")),
    CausalLaw: r => P.seq(
        r.Occurs,
        P.optWhitespace, P.string("Causes"),
        P.optWhitespace, r.PositiveFunctionLiteral,
        P.whitespace, P.string("if"), P.whitespace,
        r.Body,
        P.string(".")
    ),
    SCHead: r => P.alt(P.string("false"), r.PositiveFunctionLiteral),
    StateConstraint: r => P.seq(r.SCHead, P.whitespace, P.string("if"), P.whitespace, r.Body, P.string(".")),
    ExecutabilityCondition: r => P.seq(
        P.string("impossible"),
        P.whitespace, r.Occurs,
        P.whitespace, P.string("if"), P.whitespace,
        r.ExtendedBody,
    ),
    Facts: r => P.seq(r.PositiveFunctionLiteral, P.string(".")),
    ExtendedBody: r => commaSeparated(P.alt(r.Literal, r.Occurs, P.seq(P.string("-"), r.Occurs))),
    Module: r => section("module", P.seq(r.Identifier, P.whitespace, r.ModuleBody)), 
    ModuleBody: r => P.seq(
        P.optWhitespace,
        r.SortDeclarations.fallback(""),
        P.optWhitespace,
        r.Statics.fallback(""),
        P.optWhitespace,
        r.Fluents.fallback(""),
        P.optWhitespace,
        r.Axioms.fallback(""),
        P.optWhitespace,
        r.Initially.fallback(""),
        P.optWhitespace,
    ),
    SortDeclarations: r => section("sorts", r.sortDecl.many()),
    SortDecl: r => P.seq(commaSeparated(r.Identifier), P.whitespace, P.string("::"), commaSeparated(r.SortName),
        P.optWhitespace, r.Attributes.fallback("")),
    Attributes: r => section("attributes", P.sepBy1(r.FunctionDecl, P.newline)),
    Arguments: r => P.seq(P.sepBy1(r.Identifier, P.regex(/\s*x\s*/)), P.optWhitespace, P.string("->")),
    SortName: r => P.alt(r.Identifier, P.seq(r.Integer, P.string(".."), r.Integer)),
    Statics: r => section("statics", r.FunctionDecl.many()).node("statics"),
    Fluents: r => P.seq(r.BasicFluents.fallback(""), r.DefinedFluents.fallback("")),
    BasicFluents: r => section("basic", r.FunctionDecl.many()).node("basic"),
    DefinedFluents: r => section("defined", r.FunctionDecl.many()).node("defined"),
    FunctionDecl: r => P.seq(r.Identifier, P.optWhitespace, P.string(":"), P.optWhitespace, r.Arguments.fallback(""), P.optWhitespace, r.Identifier),
    Axioms: r => section("axioms", r.Axiom.many()),
    Axiom: r => P.alt(r.CausalLaw, r.StateConstraint, r.ExecutabilityCondition),
    Initially: r => section("initially", r.Fact.many()),
});

console.log(ALM.FunctionTerm.tryParse("asdfa(a, a, c)"));
