import { expect } from "chai";
import { unpad } from "../src/unpad";
import { printAttributes, printSortNames, printStatics, printFluents } from "../src/projection_printer";
import { parseModule } from "../src/parse";

describe("Printing Projection", () => {
    it("printSortNames", () => {
        const mod = parseModule(`
        module foo_bar
        sorts
            foo :: bar, bam
            x :: 1..10
            y :: {a, b, c}

        `);

        expect(printSortNames(mod.sorts).trim()).to.equal(unpad(`
        sort(foo).

        holds(static(link(foo), bar)).


        holds(static(link(foo), bam)).

        sort(x).

        holds(static(link(x), integers)).
        dom(x, 1..10).

        sort(y).
        dom(y, a). dom(y, b). dom(y, c).
        `).trim());

    });

    it("printAttributes", () => {
        const mod = parseModule(`
        module foo_bar
        sorts
            foo :: bar
                attributes
                    f : g
                    m : n x p -> o
        `);

        expect(printAttributes(mod.sorts).trim()).to.equal(unpad(`
        attr(f(X), Ret) :- dom(foo, X), dom(g, Ret).


        attr(m(S0,S1,S2), Ret) :- dom(foo, S0), dom(n, S1), dom(p, S2), dom(o, Ret).
        `).trim());
    });

    it("printStatics", () => {
        const mod = parseModule(`
        module foo_bar
        statics
            a : b x c -> d
            f : g
        `);

        expect(printStatics(mod.statics).trim()).to.equal(unpad(`
        static(a(S0, S1), Ret) :- dom(b, S0), dom(c, S1), dom(d, Ret).


        static(f, Ret) :- dom(g, Ret).
        `).trim());
    });

    it("printFluents", () => {
        const mod = parseModule(`
        module foo_bar
        fluents
            basic
                a : b x c -> d
                f : g
            defined
                y : booleans
                q : r x s -> booleans
        `);

        expect(printFluents(mod.fluents).trim()).to.equal(unpad(`
        fluent(basic, a(S0, S1), Ret) :- dom(b, S0), dom(c, S1), dom(d, Ret).


        fluent(basic, f, Ret) :- dom(g, Ret).


        fluent(defined, y, Ret) :- dom(booleans, Ret).


        fluent(defined, q(S0, S1), Ret) :- dom(r, S0), dom(s, S1), dom(booleans, Ret).
        `).trim());
    });

    it("printStateConstraints", () => {
        const mod = parseModule(`
        module foo_bar
        fluents
            foo : a x b -> booleans
            bar : a x b -> booleans
            bam : a -> b
        axioms
            foo(X, Y) :- bar(X, Y).
            bar(A, B) :- bam(A) = B.
        `);

        expect(printStateConstraints(mod.axioms).trim()).to.equal(unpad(`
        state_constraint(axiom1(X, Y)) :- dom(s1, X1), dom(s2, X2), dom(sn, SN).
        `).trim());
    });
});