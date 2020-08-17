% module simple
% enums
%    constant :: { c1, c2 } 
enum(constant, c1).
enum(constant c2).
% sorts
%     obj :: universe
sort(obj, universe).
%     a :: action
sort(a, action).
%         attributes
%             target : obj
attribute(a, target, obj).
%     a1 :: a
sort(a1, a).
%     a2 :: a
sort(a2, a).
% fluents
fluent(f, basic).
signature(f, 1, obj).
signature(f, ret, constant).
%     basic
%         f : obj -> constant
% axioms
% We'll use numbers as the names of the laws
% axiom d1
%     occurs(X) causes f(Obj) = c1 if
%         instance(X, a1),
%         target(X) = Obj
%         Obj != foo
%         Y = Obj + 3


% Operators
% A > B
body(d1(A, B), gt(A, B)) :- dlaw(d1(A, B)).
% A >= B
% A < B
% A <= B
% A = B

dlaw(d1(Obj, X)) :- ...
head(d1(Obj, X), f(Obj, c1)) :- dlaw(d1(Obj, X)).
action(d1(Obj, X), X) :- dlaw(d1(Obj, X)).
body(d1(Obj, X), pos(instance(X, a1))) :- dlaw(d1(Obj, X)).
body(d1(Obj, X), pos(target(X, Obj))) :- dlaw(d1(Obj, X)).
% head(d1(Obj, X), p)
% head(d1(Obj, X), neg(p))

% head(d1(Obj, X), pos(p))
% head(d1(Obj, X), neg(p))

% 
body_satisfied(R,T) :-
    time(T),
    rule(R),

    #count{ F : body(R,pos(F)), boolean_fluent(F) }=PB,
    #count{ F : body(R,pos(F)), boolean_fluent(F), holds(F,T) }=PB,

    #count{ F : body(R,neg(F)), boolean_fluent(F) }=NB,
    #count{ F : body(R,neg(F)), boolean_fluent(F), -holds(F,T) }=NB,

    #count { E : body(R, E), greater_than(E)} = GT,
    #count { E : body(R, gt(A, B)), A > B} = GT,

    #count { E : body(R, E), greater_than_or_equal(E)} = GTE,
    #count { E : body(R, gte(A, B)), A >= B} = GTE,

    #count { E : body(R, E), less_than(E)} = LT,
    #count { E : body(R, lt(A, B)), A < B} = LT,

    #count { E : body(R, E), less_than_or_equal(E)} = LTE,
    #count { E : body(R, lte(A, B)), A <= B} = LTE,

    #count { E : body(R, E), equal(E) } = EQ,
    #count { E : body(R, eq(A, B)), A = B ) } = EQ,

    #count { E : body(R, E), not_equal(E) } = NEQ,
    #count { E : body(R, neq(A, B)), A != B ) } = NEQ.

holds(F, T + 1) :-
    head(R, F),
    body_satisfied(R, T)
% parlist(d1, pars(x1, x2)).
% par(1, pars(x1, x2), x1).
% par(2, pars(x1, x2), x2).
% action(d1, pars(x1, x2)).
% head(d1, pars(X1, X2), f(X2)) :- par(2, pars(X1, X2), X2).


% %     occurs(X) causes f(Obj) = c2 if
% %         instance(X, a2),
% %         X.target = Obj.
