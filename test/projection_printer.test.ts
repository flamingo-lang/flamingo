import { expect } from "chai";
import { unpad } from "../src/unpad";
import { printAttributes, printSortNames, printStatics, printFluents, printStateConstraints, printCausalLaws, printStaticAssignments, printInitially } from "../src/projection_printer";
import { parseModule } from "../src/parse";

describe("Printing Projection", () => {
    it("printSortNames", () => {
        const mod = parseModule(`
        module foo_bar
        sorts
            foo :: bar, bam
            x :: 1..3
            y :: {a, b, c}

        `);

        expect(printSortNames(mod.sorts!).trim()).to.equal(unpad(`
        sort(foo).

        holds(static(link(foo), bar)).


        holds(static(link(foo), bam)).

        sort(x).

        holds(static(link(x), integers)).
        dom(x, 1). dom(x, 2). dom(x, 3).
        holds(static(is_a(1), x)). holds(static(is_a(2), x)). holds(static(is_a(3), x)).

        sort(y).
        dom(y, a). dom(y, b). dom(y, c).
        holds(static(is_a(a), y)). holds(static(is_a(b), y)). holds(static(is_a(c), y)).
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

        expect(printAttributes(mod.sorts!).trim()).to.equal(unpad(`
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

        expect(printStatics(mod.statics!).trim()).to.equal(unpad(`
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

        expect(printFluents(mod.fluents!).trim()).to.equal(unpad(`
        fluent(basic, a(S0, S1), Ret) :- dom(b, S0), dom(c, S1), dom(d, Ret).


        fluent(basic, f, Ret) :- dom(g, Ret).


        fluent(defined, y, Ret) :- dom(booleans, Ret).


        fluent(defined, q(S0, S1), Ret) :- dom(r, S0), dom(s, S1), dom(booleans, Ret).
        `).trim());
    });

    describe("Axioms", () => {
        it("printStateConstraints", () => {
            const mod = parseModule(`
            module foo_bar
            sorts
                a :: { a1, a2 }
                b :: { b1, b2 }
            statics
                s : integers -> booleans
            fluents
                basic
                    bam : a -> b
                defined
                    foo : a x b -> booleans
                    bar : a x b -> b
            axioms
                foo(A, B) if
                    bar(A, B) = b1,
                    -foo(A, B),
                    s(X),
                    -s(Y),
                    X > Y * Y,
                    X < Y,
                    X >= Y,
                    X <= Y,
                    X = Y + 1,
                    X != Y.
            
                    
                bar(A, B) = b2 if bam(A) != B.
             `);

            expect(printStateConstraints(mod).trim()).to.equal(unpad(`
            state_constraint(axiom1(A, B, X, Y)) :- dom(a, A), dom(b, B), dom(integers, X), dom(integers, Y).
            head(axiom1(A, B, X, Y), pos_fluent(foo(A, B), true)) :- dom(a, A), dom(b, B), dom(integers, X), dom(integers, Y).

            body(axiom1(A, B, X, Y), pos_fluent(bar(A, B), b1)) :- dom(a, A), dom(b, B), dom(integers, X), dom(integers, Y).
            body(axiom1(A, B, X, Y), neg_fluent(foo(A, B), true)) :- dom(a, A), dom(b, B), dom(integers, X), dom(integers, Y).
            body(axiom1(A, B, X, Y), pos_static(s(X), true)) :- dom(a, A), dom(b, B), dom(integers, X), dom(integers, Y).
            body(axiom1(A, B, X, Y), neg_static(s(Y), true)) :- dom(a, A), dom(b, B), dom(integers, X), dom(integers, Y).
            body(axiom1(A, B, X, Y), gt(X, Y * Y)) :- dom(a, A), dom(b, B), dom(integers, X), dom(integers, Y).
            body(axiom1(A, B, X, Y), lt(X, Y)) :- dom(a, A), dom(b, B), dom(integers, X), dom(integers, Y).
            body(axiom1(A, B, X, Y), gte(X, Y)) :- dom(a, A), dom(b, B), dom(integers, X), dom(integers, Y).
            body(axiom1(A, B, X, Y), lte(X, Y)) :- dom(a, A), dom(b, B), dom(integers, X), dom(integers, Y).
            body(axiom1(A, B, X, Y), eq(X, Y + 1)) :- dom(a, A), dom(b, B), dom(integers, X), dom(integers, Y).
            body(axiom1(A, B, X, Y), neq(X, Y)) :- dom(a, A), dom(b, B), dom(integers, X), dom(integers, Y).
            

            state_constraint(axiom2(A, B)) :- dom(a, A), dom(b, B).
            head(axiom2(A, B), pos_fluent(bar(A, B), b2)) :- dom(a, A), dom(b, B).

            body(axiom2(A, B), neg_fluent(bam(A), B)) :- dom(a, A), dom(b, B).
            `).trim());
        });

        it("printCausalLaws", () => {
            const mod = parseModule(`
            module foo_bar
            sorts
                a :: { a1, a2 }
                b :: { b1, b2 }
                act :: action
            statics
                s : integers -> booleans
            fluents
                basic
                    bam : a -> b
                defined
                    foo : a x b -> booleans
                    bar : a x b -> b
            axioms
                occurs(W) causes foo(A, B) if
                    instance(W, act),
                    bar(A, B) = b1,
                    -foo(A, B),
                    s(X),
                    -s(Y),
                    X > Y * Y,
                    X < Y,
                    X >= Y,
                    X <= Y,
                    X = Y + 1,
                    X != Y.
             `);

            expect(printCausalLaws(mod).trim()).to.equal(unpad(`
            dlaw(axiom1(W, A, B, X, Y)) :- dom(action, W), dom(a, A), dom(b, B), dom(integers, X), dom(integers, Y).
            action(axiom1(W, A, B, X, Y), W) :- dom(action, W), dom(a, A), dom(b, B), dom(integers, X), dom(integers, Y).
            head(axiom1(W, A, B, X, Y), pos_fluent(foo(A, B), true)) :- dom(action, W), dom(a, A), dom(b, B), dom(integers, X), dom(integers, Y).

            body(axiom1(W, A, B, X, Y), pos_static(instance(W, act), true)) :- dom(action, W), dom(a, A), dom(b, B), dom(integers, X), dom(integers, Y).
            body(axiom1(W, A, B, X, Y), pos_fluent(bar(A, B), b1)) :- dom(action, W), dom(a, A), dom(b, B), dom(integers, X), dom(integers, Y).
            body(axiom1(W, A, B, X, Y), neg_fluent(foo(A, B), true)) :- dom(action, W), dom(a, A), dom(b, B), dom(integers, X), dom(integers, Y).
            body(axiom1(W, A, B, X, Y), pos_static(s(X), true)) :- dom(action, W), dom(a, A), dom(b, B), dom(integers, X), dom(integers, Y).
            body(axiom1(W, A, B, X, Y), neg_static(s(Y), true)) :- dom(action, W), dom(a, A), dom(b, B), dom(integers, X), dom(integers, Y).
            body(axiom1(W, A, B, X, Y), gt(X, Y * Y)) :- dom(action, W), dom(a, A), dom(b, B), dom(integers, X), dom(integers, Y).
            body(axiom1(W, A, B, X, Y), lt(X, Y)) :- dom(action, W), dom(a, A), dom(b, B), dom(integers, X), dom(integers, Y).
            body(axiom1(W, A, B, X, Y), gte(X, Y)) :- dom(action, W), dom(a, A), dom(b, B), dom(integers, X), dom(integers, Y).
            body(axiom1(W, A, B, X, Y), lte(X, Y)) :- dom(action, W), dom(a, A), dom(b, B), dom(integers, X), dom(integers, Y).
            body(axiom1(W, A, B, X, Y), eq(X, Y + 1)) :- dom(action, W), dom(a, A), dom(b, B), dom(integers, X), dom(integers, Y).
            body(axiom1(W, A, B, X, Y), neq(X, Y)) :- dom(action, W), dom(a, A), dom(b, B), dom(integers, X), dom(integers, Y).
            `).trim());
        });
    });

    it("printStaticAssignments", () => {
        const mod = parseModule(`
        module foo_bar
        axioms
            s(10).
        `);

        expect(printStaticAssignments(mod).trim()).to.equal(unpad(`
        holds(static(s(10), true)).
        `).trim())
    });

    it("printInitially", () => {
        const mod = parseModule(`
        module foo_bar
        initially
            next_todo = 1.
            active_filter = all.
        `);

        expect(printInitially(mod).trim()).to.equal(unpad(`
        holds(next_todo, 1, 0).
        holds(active_filter, all, 0).
        `).trim())
    });
});
