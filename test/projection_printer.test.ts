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

        dom(y,(a;b;c)).
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
        attr(f(X), S') :- dom(foo, X), dom(g, S').


        attr(m(S0,S1,S2), S') :- dom(foo, S0), dom(n, S1), dom(p, S2), dom(o, S').
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
        static(a(S0, S1), S') :- dom(b, S0), dom(c, S1), dom(d, S').


        static(f, S') :- dom(g, S').
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

        console.log(printFluents(mod.fluents));
        expect(printFluents(mod.fluents).trim()).to.equal(unpad(`
        fluent(basic, a(S0, S1), S') :- dom(b, S0), dom(c, S1), dom(d, S').


        fluent(basic, f, S') :- dom(g, S').


        fluent(defined, y, S') :- dom(booleans, S').


        fluent(defined, q(S0, S1), S') :- dom(r, S0), dom(s, S1), dom(booleans, S').
        `).trim());
    });
});