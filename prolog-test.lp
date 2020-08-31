
#defined occurs/2.
#defined body/2.

step(0..n).

sort(todos).

holds(static(link(todos), integers)).
dom(todos, 1). dom(todos, 2). dom(todos, 3).
holds(static(is_a(1), todos)). holds(static(is_a(2), todos)). holds(static(is_a(3), todos)).

sort(filters).
dom(filters, all). dom(filters, active). dom(filters, completed).
holds(static(is_a(all), filters)). holds(static(is_a(active), filters)). holds(static(is_a(completed), filters)).
sort(new_todo).

holds(static(link(new_todo), actions)).





attr(new_text(X), Ret) :- dom(new_todo, X), dom(strings, Ret).
dom(new_todo, X) :- holds(static(new_text(X), Ret)).
dom(strings, Ret) :- holds(static(new_text(X), Ret)).





fluent(basic, next_todo, Ret) :- dom(todos, Ret).


fluent(basic, text(S0), Ret) :- dom(todos, S0), dom(strings, Ret).


fluent(basic, active(S0), Ret) :- dom(todos, S0), dom(booleans, Ret).


fluent(basic, active_filter, Ret) :- dom(filters, Ret).


fluent(defined, visible(S0), Ret) :- dom(todos, S0), dom(booleans, Ret).



state_constraint(state_constraint1(Todo)) :- dom(todos, Todo).
head(state_constraint1(Todo), pos_fluent(visible(Todo), true)) :- dom(todos, Todo).

body(state_constraint1(Todo), pos_fluent(active(Todo), true)) :- dom(todos, Todo).
body(state_constraint1(Todo), pos_fluent(active_filter, all)) :- dom(todos, Todo).



dlaw(causal_law1(A, Text, Todo)) :- dom(actions, A), dom(strings, Text), dom(todos, Todo).
action(causal_law1(A, Text, Todo), A) :- dom(actions, A), dom(strings, Text), dom(todos, Todo).
head(causal_law1(A, Text, Todo), pos_fluent(text(Todo), Text)) :- dom(actions, A), dom(strings, Text), dom(todos, Todo).
head(causal_law1(A, Text, Todo), pos_fluent(next_todo, Todo + 1)) :- dom(actions, A), dom(strings, Text), dom(todos, Todo).

body(causal_law1(A, Text, Todo), pos_static(instance(A, new_todo), true)) :- dom(actions, A), dom(strings, Text), dom(todos, Todo).
body(causal_law1(A, Text, Todo), pos_static(new_text(A), Text)) :- dom(actions, A), dom(strings, Text), dom(todos, Todo).
body(causal_law1(A, Text, Todo), pos_fluent(next_todo, Todo)) :- dom(actions, A), dom(strings, Text), dom(todos, Todo).




holds(next_todo, 1, 0).
holds(active_filter, all, 0).

%body_satisfied(R, I) :-
    %step(I),
    %body(R, _),
    %#count {F : body(R,pos_fluent(F,V)), fluent(_,F,V) } = FPB,
    %#count { F : body(R,pos_fluent(F,V)), fluent(_,F,V), holds(F, V, I) } = FPB.
    %#count { F : body(R,neg_fluent(F,V)), fluent(_,F,V) } = FNB,
    %#count { F : body(R,neg_fluent(F,V)), fluent(_, F,V), -holds(F,V,I) } = FNB,
    %#count { F : body(R,pos_static(F,V)) } = SPB,
    %#count { F : body(R,pos_static(F,V)), holds(static(F,V)) } = SPB,
    %#count { F : body(R,neg_static(F,V)) } = SNB,
    %#count { F : body(R,neg_static(F,V)), not holds(static(F,V)) } = SNB,
    %#count { E : body(R, gt(A, B)) } = GT,
    %#count { E : body(R, gt(A, B)), A > B } = GT,
    %#count { E : body(R, gte(A, B)) } = GTE,
    %#count { E : body(R, gte(A, B)), A >= B } = GTE,
    %#count { E : body(R, lt(A, B)) } = LT,
    %#count { E : body(R, lt(A, B)), A < B } = LT,
    %#count { E : body(R, lte(A, B)) } = LTE,
    %#count { E : body(R, lte(A, B)), A <= B } = LTE,
    %#count { E : body(R, eq(A, B)) } = EQ,
    %#count { E : body(R, eq(A, B)), A = B  } = EQ,
    %#count { E : body(R, neq(A, B)) } = NEQ,
    %#count { E : body(R, neq(A, B)), A != B  } = NEQ.

holds(F, V, I + 1) :-
    step(I),
    dlaw(R),
    action(R, A),
    occurs(A, I),
    body_satisfied(R, I),
    head(R, pos_fluent(F,V)),
    1 < n.

-holds(F, V, I + 1) :-
    step(I),
    dlaw(R),
    action(R, A),
    occurs(A, I),
    body_satisfied(R, I),
    head(R, pos_fluent(F,V')),
    holds(F, V, I),
    V != V',
    1 < n.

-holds(F, V, I + 1) :-
    step(I),
    dlaw(R),
    action(R, X),
    occurs(X, T),
    body_satisfied(R, T),
    head(R, neg_fluent(F,V)),
    I < n.

holds(F, V, I) :-
    state_constraint(R),
    head(R, pos_fluent(F,V)),
    body_satisfied(R, I).

-holds(F, V, I) :-
    state_constraint(R),
    head(R, neg_fluent(F, V)),
    body_satisfied(R, I).

-holds(F, V, I) :-
    step(I),
    fluent(defined, F, V),
    not holds(F, V, I).

holds(F, V, I + 1) :-
    step(I),
    fluent(basic, F, V),
    holds(F, V, I),
    not -holds(F, V, I + 1),
    I < n. 

-holds(F, V, I + 1) :-
    step(I),
    fluent(basic, F, V),
    -holds(F, V, I),
    not holds(F, V, I + 1),
    I < n. 

dom(S1, X) :- holds(static(link(S2), S1)), dom(S2, X).

holds(static(link(booleans), universe)).
dom(booleans, true). dom(booleans, false).

holds(static(link(actions), universe)).

holds(static(instance(X, S), true)) :- dom(S, X).

#show.

body_satisfied(R, I) :-
    step(I),
    body(R, _),
    #count { F : body(R, pos_fluent(F,V)), fluent(_,F,V) } = FPB,
    #count { F : body(R, pos_fluent(F,V)), fluent(_,F,V), holds(F, V, I) } = FPB,
    #count { F : body(R,neg_fluent(F,V)), fluent(_,F,V) } = FNB,
    #count { F : body(R,neg_fluent(F,V)), fluent(_, F,V), -holds(F,V,I) } = FNB,
    #count { F : body(R, pos_static(F,V)) } = SPB,
    #count { F : body(R, pos_static(F,V)), holds(static(F,V)) } = SPB,
    #count { F : body(R,neg_static(F,V)) } = SNB,
    #count { F : body(R,neg_static(F,V)), not holds(static(F,V)) } = SNB,
    #count { (A, B) : body(R, gt(A, B)) } = GT,
    #count { (A, B) : body(R, gt(A, B)), A > B } = GT,
    #count { (A, B) : body(R, gte(A, B)) } = GTE,
    #count { (A, B) : body(R, gte(A, B)), A >= B } = GTE,
    #count { (A, B) : body(R, lt(A, B)) } = LT,
    #count { (A, B) : body(R, lt(A, B)), A < B } = LT,
    #count { (A, B) : body(R, lte(A, B)) } = LTE,
    #count { (A, B) : body(R, lte(A, B)), A <= B } = LTE,
    #count { (A, B) : body(R, eq(A, B)) } = EQ,
    #count { (A, B) : body(R, eq(A, B)), A = B  } = EQ,
    #count { (A, B) : body(R, neq(A, B)) } = NEQ,
    #count { (A, B) : body(R, neq(A, B)), A != B  } = NEQ.

#show ("Duplicate values found", F, V, V', "at_time", I) : holds(F, V, I), holds(F, V', I), V != V'.
%#show (F, V) : holds(F, V, n).
