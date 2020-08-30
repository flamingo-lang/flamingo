
:-use_module(library(lists)).
:-dynamic(time/1).
:-dynamic(occurs/2).
:-dynamic(holds/3).
:-dynamic(nholds/3).
:-dynamic(holds/1).
:-dynamic(dom/2).
:-dynamic(body_satisfied/2).

:-discontiguous(holds/3).
:-discontiguous(holds/1).
:-discontiguous(nholds/3).
:-discontiguous(dom/2).
:-discontiguous(body/2).
:-discontiguous(head/2).
:-discontiguous(dlaw/1).
:-discontiguous(action/2).


sort(todos).

holds(static(link(todos), integers)).
dom(todos, 1). dom(todos, 2). dom(todos, 3).
holds(static(is_a(1), todos)). holds(static(is_a(2), todos)). holds(static(is_a(3), todos)).

sort(todo_state).
dom(todo_state, complete). dom(todo_state, incomplete).
holds(static(is_a(complete), todo_state)). holds(static(is_a(incomplete), todo_state)).
sort(filters).
dom(filters, all). dom(filters, active). dom(filters, completed).
holds(static(is_a(all), filters)). holds(static(is_a(active), filters)). holds(static(is_a(completed), filters)).
sort(new_todo).

holds(static(link(new_todo), actions)).

sort(todo_action).

holds(static(link(todo_action), actions)).

sort(toggle_todo).

holds(static(link(toggle_todo), todo_action)).

sort(destroy_todo).

holds(static(link(destroy_todo), todo_action)).

sort(edit_todo).

holds(static(link(edit_todo), todo_action)).

sort(set_all).

holds(static(link(set_all), actions)).

sort(clear_completed).

holds(static(link(clear_completed), actions)).

sort(set_active_filter).

holds(static(link(set_active_filter), actions)).






attr(text(X), Ret) :- dom(new_todo, X), dom(string, Ret).


attr(target(X), Ret) :- dom(todo_action, X), dom(todos, Ret).




attr(text(X), Ret) :- dom(edit_todo, X), dom(string, Ret).


attr(state(X), Ret) :- dom(set_all, X), dom(todo_state, Ret).



attr(filter(X), Ret) :- dom(set_active_filter, X), dom(filters, Ret).



static(complement(S0), Ret) :- dom(booleans, S0), dom(booleans, Ret).



fluent(basic, next_todo, Ret) :- dom(todos, Ret).


fluent(basic, destroyed(S0), Ret) :- dom(todos, S0), dom(booleans, Ret).


fluent(basic, text(S0), Ret) :- dom(todos, S0), dom(strings, Ret).


fluent(basic, active(S0), Ret) :- dom(todos, S0), dom(booleans, Ret).


fluent(basic, completed(S0), Ret) :- dom(todos, S0), dom(booleans, Ret).


fluent(basic, active_filter, Ret) :- dom(filters, Ret).


fluent(defined, visible(S0), Ret) :- dom(todos, S0), dom(booleans, Ret).



state_constraint(state_constraint1(Todo)) :- dom(todos, Todo).
head(state_constraint1(Todo), pos_fluent(visible(Todo), true)) :- dom(todos, Todo).

body(state_constraint1(Todo), pos_fluent(active_filter, all)) :- dom(todos, Todo).



dlaw(causal_law1(A, Text, Todo)) :- dom(actions, A), dom(strings, Text), dom(todos, Todo).
action(causal_law1(A, Text, Todo), A) :- dom(actions, A), dom(strings, Text), dom(todos, Todo).
head(causal_law1(A, Text, Todo), pos_fluent(text(Todo), Text)) :- dom(actions, A), dom(strings, Text), dom(todos, Todo).
head(causal_law1(A, Text, Todo), pos_fluent(completed(Todo), false)) :- dom(actions, A), dom(strings, Text), dom(todos, Todo).
head(causal_law1(A, Text, Todo), pos_fluent(next_todo, Todo + 1)) :- dom(actions, A), dom(strings, Text), dom(todos, Todo).

body(causal_law1(A, Text, Todo), pos_static(instance(A, new_todo), true)) :- dom(actions, A), dom(strings, Text), dom(todos, Todo).
body(causal_law1(A, Text, Todo), pos_fluent(text(A), Text)) :- dom(actions, A), dom(strings, Text), dom(todos, Todo).
body(causal_law1(A, Text, Todo), pos_fluent(next_todo, Todo)) :- dom(actions, A), dom(strings, Text), dom(todos, Todo).


dlaw(causal_law2(A, Todo)) :- dom(actions, A), dom(todos, Todo).
action(causal_law2(A, Todo), A) :- dom(actions, A), dom(todos, Todo).
head(causal_law2(A, Todo), pos_fluent(completed(Todo), true)) :- dom(actions, A), dom(todos, Todo).

body(causal_law2(A, Todo), pos_static(instance(A, toggle_all), true)) :- dom(actions, A), dom(todos, Todo).
body(causal_law2(A, Todo), pos_static(state(A), complete)) :- dom(actions, A), dom(todos, Todo).


dlaw(causal_law3(A, Todo)) :- dom(actions, A), dom(todos, Todo).
action(causal_law3(A, Todo), A) :- dom(actions, A), dom(todos, Todo).
head(causal_law3(A, Todo), neg_fluent(completed(Todo), true)) :- dom(actions, A), dom(todos, Todo).

body(causal_law3(A, Todo), pos_static(instance(A, toggle_all), true)) :- dom(actions, A), dom(todos, Todo).
body(causal_law3(A, Todo), pos_static(state(A), incomplete)) :- dom(actions, A), dom(todos, Todo).


dlaw(causal_law4(A, Todo, Completed, Comp)) :- dom(actions, A), dom(todos, Todo), dom(booleans, Completed), dom(booleans, Comp).
action(causal_law4(A, Todo, Completed, Comp), A) :- dom(actions, A), dom(todos, Todo), dom(booleans, Completed), dom(booleans, Comp).
head(causal_law4(A, Todo, Completed, Comp), pos_fluent(completed(Todo), Comp)) :- dom(actions, A), dom(todos, Todo), dom(booleans, Completed), dom(booleans, Comp).

body(causal_law4(A, Todo, Completed, Comp), pos_static(instance(A, toggle_todo), true)) :- dom(actions, A), dom(todos, Todo), dom(booleans, Completed), dom(booleans, Comp).
body(causal_law4(A, Todo, Completed, Comp), pos_static(target(A), Todo)) :- dom(actions, A), dom(todos, Todo), dom(booleans, Completed), dom(booleans, Comp).
body(causal_law4(A, Todo, Completed, Comp), pos_fluent(completed(Todo), Completed)) :- dom(actions, A), dom(todos, Todo), dom(booleans, Completed), dom(booleans, Comp).
body(causal_law4(A, Todo, Completed, Comp), pos_static(complement(Completed), Comp)) :- dom(actions, A), dom(todos, Todo), dom(booleans, Completed), dom(booleans, Comp).


dlaw(causal_law5(A, Todo, Text)) :- dom(actions, A), dom(todos, Todo), dom(strings, Text).
action(causal_law5(A, Todo, Text), A) :- dom(actions, A), dom(todos, Todo), dom(strings, Text).
head(causal_law5(A, Todo, Text), pos_fluent(text(Todo), Text)) :- dom(actions, A), dom(todos, Todo), dom(strings, Text).

body(causal_law5(A, Todo, Text), pos_static(instance(A, edit_todo), true)) :- dom(actions, A), dom(todos, Todo), dom(strings, Text).
body(causal_law5(A, Todo, Text), pos_static(target(A), Todo)) :- dom(actions, A), dom(todos, Todo), dom(strings, Text).
body(causal_law5(A, Todo, Text), pos_fluent(text(A), Text)) :- dom(actions, A), dom(todos, Todo), dom(strings, Text).


dlaw(causal_law6(A, Todo)) :- dom(actions, A), dom(todos, Todo).
action(causal_law6(A, Todo), A) :- dom(actions, A), dom(todos, Todo).
head(causal_law6(A, Todo), pos_fluent(destroyed(Todo), true)) :- dom(actions, A), dom(todos, Todo).

body(causal_law6(A, Todo), pos_static(instance(A, clear_completed), true)) :- dom(actions, A), dom(todos, Todo).
body(causal_law6(A, Todo), pos_fluent(completed(Todo), true)) :- dom(actions, A), dom(todos, Todo).


dlaw(causal_law7(A, F)) :- dom(actions, A), dom(filters, F).
action(causal_law7(A, F), A) :- dom(actions, A), dom(filters, F).
head(causal_law7(A, F), pos_fluent(active_filter, F)) :- dom(actions, A), dom(filters, F).

body(causal_law7(A, F), pos_static(instance(A, set_active_filter), true)) :- dom(actions, A), dom(filters, F).
body(causal_law7(A, F), pos_static(filter(A), F)) :- dom(actions, A), dom(filters, F).


holds(static(complement(true), false)).
holds(static(complement(false), true)).

holds(next_todo, 1, 0).
holds(active_filter, all, 0).

count(X, E, N) :- findall(X, E, L), length(L, N).

body_satisfied(R,T) :-
    time(T),
    count(F, (body(R,pos_fluent(F,V)), fluent(_,F,V)), FPB),
    count( F, (body(R,pos_fluent(F,V)), fluent(_,F,V), holds(F, V, T) ), FPB),

    count( F, (body(R,neg_fluent(F,V)), fluent(_,F,V)), FNB),
    count( F, (body(R,neg_fluent(F,V)), fluent(_, F,V), nholds(F,V,T)), FNB),

    count( F, (body(R,pos_static(F,V))), SPB),
    count( F, (body(R,pos_static(F,V)), holds(static(F,V))), SPB),

    count( F, (body(R,neg_static(F,V))), SNB),
    count( F, (body(R,neg_static(F,V)), \+ holds(static(F,V))), SNB),

    count( E, (body(R, gt(A, B))),  GT),
    count( E, (body(R, gt(A, B)), A > B),  GT),

    count( E, (body(R, gte(A, B))),  GTE),
    count( E, (body(R, gte(A, B)), A >= B),  GTE),

    count( E, (body(R, lt(A, B))),  LT),
    count( E, (body(R, lt(A, B)), A < B),  LT),

    count( E, (body(R, lte(A, B))),  LTE),
    count( E, (body(R, lte(A, B)), A =< B),  LTE),

    count( E, (body(R, eq(A, B))),  EQ),
    count( E, (body(R, eq(A, B)), A =:= B ),  EQ),

    count( E, (body(R, neq(A, B))),  NEQ),
    count( E, (body(R, neq(A, B)), A == B ),  NEQ).

holds_next(F, V, T) :-
    dlaw(R),
    action(R, X),
    occurs(X, T),
    body_satisfied(R, T),
    head(R, pos_fluent(F,V)), !.

nholds_next(F, V, T) :-
    dlaw(R),
    action(R, X),
    occurs(X, T),
    body_satisfied(R, T),
    head(R, neg_fluent(F,V)), !.

holds(F, V, T) :-
    state_constraint(R),
    head(R, pos_fluent(F,V)),
    body_satisfied(R, T).

nholds(F, V, T) :-
    state_constraint(R),
    head(R, neg_fluent(F,V)),
    body_satisfied(R, T).

nholds(F, V, T) :- fluent(defined, F, V), \+ holds(F, V, T).

holds_inertia(F, V, T2) :-
	    T1 is T2 - 1,
    holds(F, V, T1),
    fluent(basic, F, V),
    \+ nholds(F, V, T2). 

nholds_inertia(F, V, T2) :-
	    T1 is T2 - 1,
    holds(F, V, T1),
    fluent(basic, F, V),
    \+ nholds(F, V, T2). 

dom(S1, X) :- holds(static(link(S2), S1)), dom(S2, X).

holds(static(link(booleans), universe)).
dom(booleans, true). dom(booleans, false).

holds(static(link(actions), universe)).

holds(static(instance(X, S), true)) :- dom(S, X).