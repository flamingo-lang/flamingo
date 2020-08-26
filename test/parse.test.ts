import { expect } from "chai";
import { ALM, Nodes, FunctionLiteral } from "../src/parse";

describe("Parsing", () => {
    it("Identifier", () => {
        expect(ALM.Identifier.parse("1asdf").status).to.be.false;
        expect(ALM.Identifier.parse("asdf1asd444").status).to.be.true;
    });

    it("Arithmetic Term", () => {
        expect((ALM.ArithmeticTerm.parse("X % 1") as any)["expected"]).to.deep.equal(
            ["an arithmetic operator (+, -, *, /, or mod)"]
        );
        expect(ALM.ArithmeticTerm.parse("1 + X").status).to.be.true;
        expect(ALM.ArithmeticTerm.parse("X + 3").status).to.be.true;
        expect(ALM.ArithmeticTerm.parse("X + X").status).to.be.true;
    });

    it("Occurs", () => {
        const results = ALM.Occurs.tryParse("occurs(X)");
        expect(results.name).to.equal("Variable");
        expect(results.value).to.equal("X");
    });

    it("FunctionTerm", () => {
        const result1 = ALM.FunctionTerm.tryParse("f(A)");
        expect(result1.value.negated).to.be.false;
        expect(result1.value.fn.value).to.equal("f");
        expect(result1.value.args[0].value.value).to.equal("A");

        const result2 = ALM.FunctionTerm.tryParse("-f(A)");
        expect(result2.value.fn.value).to.equal("f");
        expect(result2.value.args[0].value.value).to.equal("A");
        expect(result2.value.negated).to.be.true;
    });

    it("FunctionAssignment", () => {
        const result1 = ALM.FunctionAssignment.tryParse("f(A) = g");
        expect(result1.value.fnTerm.value.fn.value).to.equal("f");
        expect(result1.value.operator).to.equal(Nodes.Eq);
        expect(result1.value.fnTerm.value.args[0].value.value).to.equal("A");
        expect(result1.value.ret.value.value).to.equal("g");

        const result2 = ALM.FunctionAssignment.tryParse("a(X) != b");
        expect(result2.value.fnTerm.value.fn.value).to.equal("a");
        expect(result2.value.operator).to.equal(Nodes.Neq);
        expect(result2.value.fnTerm.value.args[0].value.value).to.equal("X");
        expect(result2.value.ret.value.value).to.equal("b");
    });

    it("FunctionLiteral", () => {
        const result1: FunctionLiteral = ALM.FunctionLiteral.tryParse("f(A) = g");
        expect(result1.name).to.equal(Nodes.FunctionLiteral);
        expect(result1.value.fn).to.equal("f");
        expect(result1.value.args.map(x => (x.value as any).value)).to.deep.equal(["A"]);
        expect((result1.value.ret as any).value.value).to.deep.equal("g");
        expect(result1.value.negated).to.be.false;
        expect((result1.value.node as any).name).to.equal(Nodes.FunctionAssignment);

        const result2: FunctionLiteral = ALM.FunctionLiteral.tryParse("f(A)");
        expect(result2.name).to.equal(Nodes.FunctionLiteral);
        expect(result2.value.fn).to.equal("f");
        expect(result2.value.args.map(x => (x.value as any).value)).to.deep.equal(["A"]);
        expect((result2.value.ret as any)).to.be.true;
        expect(result2.value.negated).to.be.false;
        expect((result2.value.node as any).name).to.equal(Nodes.FunctionTerm);

        const result3: FunctionLiteral = ALM.FunctionLiteral.tryParse("-f(A)");
        expect(result3.name).to.equal(Nodes.FunctionLiteral);
        expect(result3.value.fn).to.equal("f");
        expect(result3.value.args.map(x => (x.value as any).value)).to.deep.equal(["A"]);
        expect((result3.value.ret as any)).to.be.true;
        expect(result3.value.negated).to.be.true;
        expect((result3.value.node as any).name).to.equal(Nodes.FunctionTerm);

        const result4: FunctionLiteral = ALM.FunctionLiteral.tryParse("f");
        expect(result4.name).to.equal(Nodes.FunctionLiteral);
        expect(result4.value.fn).to.equal("f");
        expect(result4.value.args).to.deep.equal([]);
        expect((result4.value.ret as any)).to.be.true;
        expect(result4.value.negated).to.be.false;
        expect((result4.value.node as any).name).to.equal(Nodes.Identifier);

        const result5: FunctionLiteral = ALM.FunctionLiteral.tryParse("-f");
        expect(result5.name).to.equal(Nodes.FunctionLiteral);
        expect(result5.value.fn).to.equal("f");
        expect(result5.value.args).to.deep.equal([]);
        expect((result5.value.ret as any)).to.be.true;
        expect(result5.value.negated).to.be.true;
        expect((result5.value.node as any).name).to.equal(Nodes.Identifier);
    });

    it("ArithmeticExpression", () => {
        const result1 = ALM.ArithmeticExpression.tryParse(`
            X + 1 != 7 + 1
        `);
        expect(result1.name).to.equal(Nodes.ArithmeticExpression);

        const result2 = ALM.ArithmeticExpression.tryParse(`
            X != 7 
        `);
        expect(result2.name).to.equal(Nodes.ArithmeticExpression);
    });

    it("Causal Law", () => {
        const results = ALM.CausalLaw.tryParse(`
        occurs(X) causes f(A) = g if 
            f(X) = Y,
            -g(Y),
            Y + 3 = Z,
            X = Z.
        `);

        expect(results.value.occurs.name).to.equal(Nodes.Variable);
        expect(results.value.head.name).to.equal(Nodes.FunctionLiteral);
        expect(results.value.body.map((x: any) => x.name)).to.deep.equal([
            Nodes.FunctionLiteral,
            Nodes.FunctionLiteral,
            Nodes.ArithmeticExpression,
            Nodes.ArithmeticExpression
        ]);

    });

    it("SCHead", () => {
        ALM.SCHead.tryParse("false");
        ALM.SCHead.tryParse("f(g) = h");
        ALM.SCHead.tryParse("f(g)");
        ALM.SCHead.tryParse("f");
    });

    it("State Constraint", () => {
        const results = ALM.StateConstraint.tryParse(`
        f(A) = g if
            f(X) = Y,
            -g(Y),
            Y + 3 = Z,
            X = Z.
        `);
        expect(results.value.head.name).to.equal(Nodes.FunctionLiteral);
        expect(results.value.body.map((x: any) => x.name)).to.deep.equal([
            Nodes.FunctionLiteral,
            Nodes.FunctionLiteral,
            Nodes.ArithmeticExpression,
            Nodes.ArithmeticExpression
        ]);
    });

    it("Executability Condition", () => {
        const results = ALM.ExecutabilityCondition.tryParse(`
        impossible occurs(A) if
            f(X) = Y,
            -g(Y),
            Y + 3 = Z,
            X = Z.
        `);

        expect(results.value.occurs.name).to.equal(Nodes.Variable);
        expect(results.value.body.map((x: any) => x.name)).to.deep.equal([
            Nodes.FunctionLiteral,
            Nodes.FunctionLiteral,
            Nodes.ArithmeticExpression,
            Nodes.ArithmeticExpression
        ]);
    });


    it("Attributes", () => {
        const result = ALM.Attributes.tryParse(`
        attributes
            a : b x c -> d
            foo : bar
        `);

        expect(result[0].value.ident.value).to.equal("a");
        expect(result[0].value.args.map(({ value }: any) => value))
            .to.deep.equal(["b", "c"]);
        expect(result[0].value.ret.value).to.equal("d");

        expect(result[1].value.ident.value).to.equal("foo");
        expect(result[1].value.args).to.equal(null);
        expect(result[1].value.ret.value).to.equal("bar");
    });

    it("Body", () => {
        const results = ALM.Body.tryParse(`
        f(X) = Y,
        -g(Y),
        Y + 3 = Z,
        X = Z.
        `);
        expect(results.map((x: any) => x.name)).to.deep.equal([
            Nodes.FunctionLiteral,
            Nodes.FunctionLiteral,
            Nodes.ArithmeticExpression,
            Nodes.ArithmeticExpression
        ]);
    });

    it("Sorts", () => {
        const results = ALM.Sorts.tryParse(`
        sorts
            foo :: bar
            a, b :: c, d, e
                attributes
                    f : booleans
            x :: 1..10
            y, z :: {m, n, o}
        `);
        const a = results.value[0];
        expect(a.first[0].value).to.equal("foo");
        expect(a.second[0].value).to.equal("bar");
        expect(a.attributes).to.be.null;

        const b = results.value[1];
        expect(b.first.map(({ value }: any) => value)).to.deep.equal(["a", "b"])
        expect(b.second.map(({ value }: any) => value)).to.deep.equal(["c", "d", "e"])
        expect(b.attributes[0].value.ident.value).to.equal("f")
        expect(b.attributes[0].value.args).to.be.null;
        expect(b.attributes[0].value.ret.value).to.equal("booleans")

        const c = results.value[2];
        expect(c.first.map(({ value }: any) => value)).to.deep.equal(["x"]);
        expect(c.second).to.deep.equal([[1, 10]]);

        const d = results.value[3];
        expect(d.first.map(({ value }: any) => value)).to.deep.equal(["y", "z"]);
        expect(Array.from(d.second[0]).map((x: any) => x.value)).to.deep.equal(["m", "n", "o"]);
    });

    it("Statics", () => {
        const results = ALM.Statics.tryParse(`
        statics
            f : g
        `);

        expect(results.value[0].value.ident.value).to.equal("f");
        expect(results.value[0].value.args).to.be.null;
        expect(results.value[0].value.ret.value).to.equal("g");
    });

    it("Fluents", () => {
        const results = ALM.Fluents.tryParse(`
        fluents
            basic
                f : g
            defined
                a : b
        `);

        const basicFluent = results.basic.value[0].value;
        expect(basicFluent.ident.value).to.equal("f");
        expect(basicFluent.args).to.be.null;
        expect(basicFluent.ret.value).to.equal("g");

        const definedFluent = results.defined.value[0].value;
        expect(definedFluent.ident.value).to.equal("a");
        expect(definedFluent.args).to.be.null;
        expect(definedFluent.ret.value).to.equal("b");
    });

    it("FunctionDecl", () => {
        const ex1: any = ALM.FunctionDecl.parse(`
            f : a x b -> c
        `);
        expect(ex1.value.value.ident.value).to.equal("f");
        expect(ex1.value.value.args.map(({ value }: any) => value))
            .to.deep.equal(["a", "b"]);
        expect(ex1.value.value.ret.value).to.equal("c");

        const ex2: any = ALM.FunctionDecl.parse(`
            f : a
        `);
        expect(ex2.value.value.ident.value).to.equal("f");
        expect(ex2.value.value.args).to.equal(null);
        expect(ex2.value.value.ret.value).to.equal("a");
    });

    it("Axioms", () => {
        const result = ALM.Axioms.tryParse(`
        axioms
            f(a) = 10.
            x if y.
            occurs(A) causes f(X) if y.
            impossible occurs(A) if y.
        `);

        expect(result.map((x: any) => x.name)).to.deep.equal([
            Nodes.Fact, Nodes.StateConstraint, Nodes.CausalLaw, Nodes.ExecutabilityCondition
        ]);

    });

    it("Initially", () => {
        const result = ALM.Initially.tryParse(`
        initially
            f = x.
            g(10) = -11.
        `);
        expect(result.map((x: any) => x.name)).to.deep.equal([
            Nodes.Fact, Nodes.Fact
        ]);
    });

    it("Module", () => {
        const result = ALM.Module.tryParse(`
        module myModule
        sorts
            a :: b
        statics
            s : a x b -> booleans
        fluents
            basic
                foo : a
            defined
                bar : b
        axioms
            foo = 1 if bar = 2.
        initially
            f = x.
            g(10) = -11.
        `);

        expect(result).to.have.keys([
            "moduleName", "sorts", "statics", "fluents", "axioms", "initially"
        ]);
    });
});
