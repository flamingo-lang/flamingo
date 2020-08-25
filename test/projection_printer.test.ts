import { expect } from "chai";
import { unpad } from "../src/unpad";
import { printAttributes, printSortNames } from "../src/projection_printer";
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

        subsort(foo, ident(bar)).


        subsort(foo, ident(bam)).

        sort(x).

        subsort(x, range(10)).
        dom(x, 1..10).

        sort(y).

        subsort(y, set((a,b,c))).
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
        is_attr(f).
        attr(f(X, S')) :- dom(foo, X), dom(g, S').
        param(f, 0, foo).
        ret(f, g).


        is_attr(m).
        attr(m(S0,S1,S2, S')) :- dom(foo, S0), dom(n, S1), dom(p, S2), dom(o, S').
        param(m, 0, foo). param(m, 1, n). param(m, 2, p).
        ret(m, o).
        `).trim());
    });
});