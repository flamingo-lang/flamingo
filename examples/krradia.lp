% We'll use numbers as the names of the laws
% axiom d1
%     occurs(X) causes f(Obj) = c1 if
%         instance(X, a1),
%         target(X) = Obj
%         Obj != foo
module ephemeral
sorts
    ephemeral :: universe 
    activate_new :: universe
        attributes
            sort : sorts
    deactivate :: universe
        target :: universe
statics
    max_in_sort : sorts -> integers
fluents
    basic
        active : ephemeral -> booleans
        next_active : sorts -> ephemeral
        not_next_active : ephemeral -> booleans
axioms
    not_next_active(Sort, X) if
        instance(Sort, X),
        -active(Y),
        Y < X.

    next_active(Sort, X) if -not_next_active(X).

    occurs(X) causes active(Next) if
        instance(X, activate_new),
        next_active(Next).

    impossible occurs(X) if
        instance(X, activate_new),
        sort(X, Sort),
        max_in_sort(Sort) = Max,
        next_active = Next,

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
