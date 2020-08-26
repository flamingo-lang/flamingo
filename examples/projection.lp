#const n = 1.
%%%%%%%%%%%%%%%% Dynamic Part of Encoding %%%%%%%%%%%%%%%%%
%%%% Signature %%%%%%
% For every sort s :: s'
sort(s).
holds(static(link(s), s')).

% For every sort s :: {a, b, c}
sort(s).
dom(s, (a;b;c)).
% For every sort s :: n..n'
sort(s).
holds(static(link(s), integers)).
dom(s, [n..n']).

% For every attribute of s a : s1 x s2 ... sn -> s'
attr(a(S0, S1,%*...,*%SN), S') :- dom(s0, S0), dom(s1, S1), %*...,*% dom(sn, SN), dom(s', S').

% For every static st : s0 x s1 ... sn -> s'
static(st(S0, S1, S2,%*...,*%SN), S') :- dom(s0, S0), dom(s1, S1), %*...,*% dom(sn, SN), dom(s', S').

% For every basic fluent b : s0 x s1 ... sn -> s'
fluent(basic, b(S0, S1, S2,%*...,*%SN), S') :- dom(s0, S0), dom(s1, S1), %*...,*% dom(sn, SN), dom(s', S').

% For every defined fluent d : s0 x s1 ... sn -> s'
fluent(defined, d(S0, S1, S2,%*...,*%SN), S') :- dom(s0, S0), dom(s1, S1), %*...,*% dom(sn, SN), dom(s', S').


%%%%%%% Axioms %%%%%%%
% For every state constraint with lable sc and variables X1..XN
state_constraint(sc(X1, %*..,*%XN)) :- dom(s1, X1), dom(s2, X2), %*...,*% dom(sn, SN).

% For every dynamic causal law with lable d and variables X1..XN
% where law begins with "occurs(X) causes ..."
dlaw(d(X1, %*..,*%XN)) :- dom(s1, X1), dom(s2, X2).
action(d(X1, %*..,*%XN), X) :- dom(s1, X1), dom(s2, X2).

% For every state constraint with label sc of the form "f(X0) if ..."
head(sc(X1, %*..,*%XN), pos(f(X0))) :- dom(s1, X1), dom(s2, X2), %*...,*% dom(sn, SN).

% For every state constraint with label sc of the form "-f(X0) if ..."
head(sc(X1, %*..,*%XN), neg(f(X0))) :- dom(s1, X1), dom(s2, X2), %*...,*% dom(sn, SN).

% For every dynamic causal law with label d of the form
% occurs(X1) causes f(X2) if ...
head(d(X1, %*..,*%XN), pos(f(X2))) :- dom(s1, X1), dom(s2, X2), %*...,*% dom(sn, SN).

% For every dynamic causal law with label d of the form
% occurs(X1) causes -f(X2) if ...
head(d(X1, %*..,*%XN), neg(f(X2))) :- dom(s1, X1), dom(s2, X2), %*...,*% dom(sn, SN).

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


%%%%%%%%%%%%%%%%%%%%% Static Part of Encoding %%%%%%%%%%%%%%%%%%%%
% The body of a rule R is satisfied at time T when all its conditions are satisfied.
body_satisied(R,T) :-
    time(T),
    rule(R),

    #count{ F : body(R,pos(F,V)), fluent(_,F,V)}=PB,
    #count{ F : body(R,pos(F,V)), fluent(_,F,V), holds(F, V, T) }=PB,

    #count{ F : body(R,neg(F,V)), fluent(_,F,V)}=NB,
    #count{ F : body(R,neg(F,V)), fluent(_, F,V), -holds(F,V,T)}=NB,

    #count{ F : body(R,pos_static(F,V))}=PB,
    #count{ F : body(R,pos_static(F,V)), holds(static(F,V))}=PB,

    #count{ F : body(R,neg_static(F,V))}=NB,
    #count{ F : body(R,neg_static(F,V)), not holds(static(F,V)) }=NB,

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
holds(F, V, T + 1) :-
    dlaw(R),
    action(R, X),
    occurs(X, T),
    body_satisied(R, T),
    head(R, pos(F,V)).

-holds(F, V, T + 1) :-
    dlaw(R),
    action(R, X),
    occurs(X, T),
    body_satisied(R, T),
    head(R, neg(F,V)).

% The head of a state constraint is true at time T
% if its body is satisfied at time T.
holds(F, V, T) :-
    state_constraint(R),
    head(R, pos(F,V)),
    body_satisied(R, T).

-holds(F, V, T) :-
    state_constraint(R),
    head(R, neg(F,V)),
    body_satisied(R, T).

% Contrain functions to have exactly one value.
:- holds(attr(F, V)), holds(attr(F, V')), V != V'.
:- holds(static(F, V)), holds(static(F, V')), V != V'.
:- holds(fluent(_, F, V)), holds(fluent(_, F, V')), V != V'.

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

% If S is a direct subsort of S' (that is, if link(S, S')
% is true), then any elements in the domain of S are also
% in the domain of S'.
dom(S', X) :- static(link(S, S')), dom(S, X).


%%%%%% Universal Facts %%%%%%%%%
% booleans are a subsort of universe.
holds(static(link(booleans), universe)).
% booleans = {true, false}
dom(booleans, (true; false)).

% action is a subsort of universe
holds(static(link(action), universe)).

% The static is_a relation
holds(static(is_a(X), S)) :- dom(S, X).

% The static instance relation, the transitive closure of is_a.
holds(static(instance(X, S), #true)) :- holds(static(is_a(X), S)).
holds(static(instance(X, S1), #true)) :- hodls(static(instance(X, S2), #true)), holds(static(link(S2), S1)).
