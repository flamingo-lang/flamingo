% We'll use numbers as the names of the laws
% axiom d1
%     occurs(X) causes f(Obj) = c1 if
%         instance(X, a1),
%         target(X) = Obj
%         Obj != foo

#const n = 1.
step(0..n).

holds(f(Obj, c1), I + 1) :-
    instance(X, a1),
    target(a, X, Obj),
    occurs(X, I).

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
