% module simple
% The law
dom(S', X) :- subsort(S, S'), dom(S, X).
% For every sort s :: s'
sort(s).
subsort(s, ident(s')).
% For every sort s :: {a, b, c}
sort(s).
subsort(s, set((a, b, c))).
dom(s, (a;b;c)).
% For every sort s :: n..n'
sort(s).
subsort(s, range(n, n')).
dom(s, [n..n']).

% For every attribute of s a : s1 x s2 ... sn -> s'
is_attr(a).
attr(a(S0, S1,%*...,*%SN, S')) :- dom(s0, S0), dom(s1, S1), %*...,*% dom(sn, SN). dom(s', S').
param(a, 0, s). param(a, 1, s1). %* ...,*% param(a, n, sn).
ret(a, s').

% For every static s : s0 x s1 ... sn -> s'
is_static(s).
static(s(S0,%*...,*%SN, S')) :- dom(s0, S0), %*...,*% dom(sn, SN). dom(s', S').
param(s, 0, s0). %* ...,*% param(s, n, sn).
ret(s, s').

% For every basic fluent b : s0 x s1 ... sn -> s'
is_basic_fluent(b).
basic_fluent(b(S0, S1, S2,%*...,*%SN, S')) :- dom(s0, S0), dom(s1, S1), %*...,*% dom(sn, SN). dom(s', S').
param(b, 0, s0). param(b, 1, s1). param(b, 2, s2). %* ...,*% param(b, n, sn).
ret(b, s').

% For every defined fluent d : s0 x s1 ... sn -> s'
is_defined_fluent(d).
defined_fluent(d(S0, S1, S2,%*...,*%SN, S')) :- dom(s0, S0), dom(s1, S1), %*...,*% dom(sn, SN). dom(s', S').
param(d, 0, s0). param(d, 1, s1). param(d, 2, s2). %* ...,*% param(d, n, sn).
ret(d, s').

% For every state constraint [sc] f(X0, ..., XN) if ...
state_constraint
head()
head(f(X0, %*...,*%XN)) :-
    param(f, 0, s0), dom(s0, X0),
    %* ... *%
    param(f, n, sn), dom(sn, X0).

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
