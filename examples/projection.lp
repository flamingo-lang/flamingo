#const n = 1.

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

% For every static st : s0 x s1 ... sn -> s'
is_static(st).
param(st, 0, s0). %* ...,*% param(s, n, sn).
ret(st, s').

% For every basic fluent b : s0 x s1 ... sn -> s'
is_basic_fluent(b).
fluent(basic, b(S0, S1, S2,%*...,*%SN, S')) :- dom(s0, S0), dom(s1, S1), %*...,*% dom(sn, SN), dom(s', S').
param(b, 0, s0). param(b, 1, s1). param(b, 2, s2). %* ...,*% param(b, n, sn).
ret(b, s').

% For every defined fluent d : s0 x s1 ... sn -> s'
is_defined_fluent(d).
fluent(defined,d(S0, S1, S2,%*...,*%SN)) :- dom(s0, S0), dom(s1, S1), %*...,*% dom(sn, SN).
param(d, 0, s0). param(d, 1, s1). param(d, 2, s2). %* ...,*% param(d, n, sn).
ret(d, s').

% For every state constraint with lable sc and variables X1..XN
state_constraint(sc(X1, %*..,*%XN)) :- dom(s1, X1), dom(s2, X2), %*...,*% dom(sn, SN).

% For every dynamic causal law with lable d and variables X1..XN
dlaw(d(X1, %*..,*%XN)) :- dom(s1, X1), dom(s2, X2).
action(d(X1, %*..,*%XN), X) :- dom(s1, X1), dom(s2, X2).

% For every state constraint with label sc of the form "f(X0) if ..."
head(sc(X1, %*..,*%XN), f(X0)) :- dom(s1, X1), dom(s2, X2), %*...,*% dom(sn, SN).

% For every dynamic causal law with label d of the form
% occurs(X1) causes f(X2) if ...
head(d(X1, %*..,*%XN), f(X2)) :- dom(s1, X1), dom(s2, X2), %*...,*% dom(sn, SN).

% For every conjunct in the body of rule R (being either a state constraint or dynamic causal law),
% with variables X0..XN, match against the following cases:
% f(X0) where f is a fluent
body(r(X1, %*..,*%XN), pos(f(X0))) :- dom(s1, X1), dom(s2, X2), %*...,*% dom(sn, SN).
% -f(X0) where f is a fluent
body(r(X1, %*..,*%XN), neg(f(X0))) :- dom(s1, X1), dom(s2, X2), %*...,*% dom(sn, SN).
% f(X0) where f is a static
body(r(X1, %*..,*%XN), pos_static(f(X0))) :- dom(s1, X1), dom(s2, X2), %*...,*% dom(sn, SN).
% -f(X0) where f is a static
body(r(X1, %*..,*%XN), neg_static(f(X0))) :- dom(s1, X1), dom(s2, X2), %*...,*% dom(sn, SN).
% X1 > X2
body(r(X1, %*..,*%XN), gt(X1, X2)) :- dom(s1, X1), dom(s2, X2), %*...,*% dom(sn, SN).
% X1 >= X2
body(r(X1, %*..,*%XN), gte(X1, X2)) :- dom(s1, X1), dom(s2, X2), %*...,*% dom(sn, SN).
% X1 < X2
body(r(X1, %*..,*%XN), lt(X1, X2)) :- dom(s1, X1), dom(s2, X2), %*...,*% dom(sn, SN).
% X1 <= X2
body(r(X1, %*..,*%XN), lte(X1, X2)) :- dom(s1, X1), dom(s2, X2), %*...,*% dom(sn, SN).
% X1 = X2
body(r(X1, %*..,*%XN), eq(X1, X2)) :- dom(s1, X1), dom(s2, X2), %*...,*% dom(sn, SN).
% X1 != X2
body(r(X1, %*..,*%XN), neq(X1, X2)) :- dom(s1, X1), dom(s2, X2), %*...,*% dom(sn, SN).

% The body of a rule R is satisfied at time T when all its conditions are satisfied.
body_satisied(R,T) :-
    time(T),
    rule(R),

    #count{ F : body(R,pos(F)), fluent(_, F)}=PB,
    #count{ F : body(R,pos(F)), fluent(_, F), holds(F,T) }=PB,

    #count{ F : body(R,neg(F)), fluent(_, F)}=NB,
    #count{ F : body(R,neg(F)), fluent(_, F), -holds(F,T)}=NB,

    #count{ F : body(R,pos_static(F))}=PB,
    #count{ F : body(R,pos_static(F)), static(F)}=PB,

    #count{ F : body(R,neg_static(F))}=NB,
    #count{ F : body(R,neg_static(F)), not static(F) }=NB,

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

% The head of a dynamic causal law becomes true at time T + 1
% if, at time T, its action occurs and its body is satisfied.
holds(F, T + 1) :-
    dlaw(R),
    action(R, X),
    occurs(X, T),
    body_satisied(R, T),
    head(R, F).

% The head of a state constraint is true at time T
% if its body is satisfied at time T.
holds(F, T) :-
    state_constraint(R),
    head(R, F),
    body_satisied(R, T).

% Function constraint for basic fluents:
% For every basic fluent f, there is a rule stating it is impossible for
% f to have more than one value at a time T.
% (In this example, f has arity 3).
:- holds(f(_, _, _, X), T), holds(F(_, _, _, X'), T).

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

dom(S', X) :- static(link(S, S')), dom(S, X).

% For every sort s :: s'
sort(s).
static(link(s, s')).

% action is a subsort of universe
static(link(action, universe)).

% The static is_a relation
static(is_a(X, S)) :- dom(S, X).

% The static instance relation
static(instance(X, S)) :- static(is_a(X, S)).
static(instance(X, S1)) :- static(instance(X, S2)), static(link(S2, S1)).
