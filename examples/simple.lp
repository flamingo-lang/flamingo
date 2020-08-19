% module simple
% The law
dom(S', X) :- subsort(S, S'), dom(S, X).
% For every sort s :: s'
sort(s).
subsort(s, s').
% For every sort s :: {a, b, c}
sort(s).
dom(s, (a;b;c)).
% For every sort s :: n..n'
sort(s).
dom(s, [n..n']).

% For every attribute of s a : s1 x s2 ... sn -> s'
is_attr(a).
attr(a(S0, S1,%*...,*%SN)) :- dom(s0, S0), dom(s1, S1), %*...,*% dom(sn, SN).
param(a, 0, s). param(a, 1, s1). %* ...,*% param(a, n, sn).
ret(a, s').

% For every static s : s0 x s1 ... sn -> s'
is_static(s).
static(s(S0,%*...,*%SN)) :- dom(s0, S0), %*...,*% dom(sn, SN).
param(s, 0, s0). %* ...,*% param(s, n, sn).
ret(s, s').

% For every basic fluent b : s0 x s1 ... sn -> s'
is_basic_fluent(b).
basic_fluent(b(S0, S1, S2,%*...,*%SN)) :- dom(s0, S0), dom(s1, S1), %*...,*% dom(sn, SN).
param(b, 0, s0). param(b, 1, s1). param(b, 2, s2). %* ...,*% param(b, n, sn).
ret(b, s').

% For every defined fluent d : s0 x s1 ... sn -> s'
is_defined_fluent(d).
defined_fluent(d(S0, S1, S2,%*...,*%SN)) :- dom(s0, S0), dom(s1, S1), %*...,*% dom(sn, SN).
param(d, 0, s0). param(d, 1, s1). param(d, 2, s2). %* ...,*% param(d, n, sn).
ret(d, s').

% For every state constraint [sc] f(X0, ..., XN) if ...
state_constraint
head()
head(f(X0, %*...,*%XN)) :-
    param(f, 0, s0), dom(s0, X0),
    %* ... *%
    param(f, n, sn), dom(sn, X0).

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
body_satisied(R,T) :-
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
    body_satisied(R, T)
% parlist(d1, pars(x1, x2)).
% par(1, pars(x1, x2), x1).
% par(2, pars(x1, x2), x2).
% action(d1, pars(x1, x2)).
% head(d1, pars(X1, X2), f(X2)) :- par(2, pars(X1, X2), X2).
% CWA for defined fluents
-holds(F, I) :- fluent(defined, F), not holds(F, I).

% Inertia Axiom    
holds(F, I + 1) :-
    fluent(inertial, F),
    holds(F, I),
    not -holds(F, I + 1),
    I < n.

-holds(F, I + 1) :-
    fluent(inertial, F),
    -holds(F, I),
    not holds(F, I + 1),
    I < n.


% %     occurs(X) causes f(Obj) = c2 if
% %         instance(X, a2),
% %         X.target = Obj.
