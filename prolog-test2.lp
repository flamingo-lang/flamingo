
    #const n = 9.
    
#defined occurs/2.
#defined body/2.

step(0..n).

sort(todos).

holds(static(link(todos), integers)).
dom(todos, 1). dom(todos, 2). dom(todos, 3). dom(todos, 4).
holds(static(is_a(1), todos)). holds(static(is_a(2), todos)). holds(static(is_a(3), todos)). holds(static(is_a(4), todos)).

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





attr(new_text(X), Ret) :- dom(new_todo, X), dom(strings, Ret).
dom(new_todo, X) :- holds(static(new_text(X), Ret)).
dom(strings, Ret) :- holds(static(new_text(X), Ret)).


attr(target(X), Ret) :- dom(todo_action, X), dom(todos, Ret).
dom(todo_action, X) :- holds(static(target(X), Ret)).
dom(todos, Ret) :- holds(static(target(X), Ret)).




attr(edit_text(X), Ret) :- dom(edit_todo, X), dom(strings, Ret).
dom(edit_todo, X) :- holds(static(edit_text(X), Ret)).
dom(strings, Ret) :- holds(static(edit_text(X), Ret)).


attr(set_completed(X), Ret) :- dom(set_all, X), dom(booleans, Ret).
dom(set_all, X) :- holds(static(set_completed(X), Ret)).
dom(booleans, Ret) :- holds(static(set_completed(X), Ret)).



attr(filter(X), Ret) :- dom(set_active_filter, X), dom(filters, Ret).
dom(set_active_filter, X) :- holds(static(filter(X), Ret)).
dom(filters, Ret) :- holds(static(filter(X), Ret)).



static(complement(S0), Ret) :- dom(booleans, S0), dom(booleans, Ret).



fluent(basic, next_todo, Ret) :- dom(todos, Ret).


fluent(basic, text(S0), Ret) :- dom(todos, S0), dom(strings, Ret).


fluent(basic, active(S0), Ret) :- dom(todos, S0), dom(booleans, Ret).


fluent(basic, completed(S0), Ret) :- dom(todos, S0), dom(booleans, Ret).


fluent(basic, active_filter, Ret) :- dom(filters, Ret).


fluent(defined, visible(S0), Ret) :- dom(todos, S0), dom(booleans, Ret).



state_constraint(state_constraint1(Todo)) :- dom(todos, Todo).
head(state_constraint1(Todo), pos_fluent(visible(Todo), true)) :- dom(todos, Todo).

body(state_constraint1(Todo), pos_fluent(active(Todo), true)) :- dom(todos, Todo).
body(state_constraint1(Todo), pos_fluent(active_filter, all)) :- dom(todos, Todo).


state_constraint(state_constraint2(Todo)) :- dom(todos, Todo).
head(state_constraint2(Todo), pos_fluent(visible(Todo), true)) :- dom(todos, Todo).

body(state_constraint2(Todo), pos_fluent(active(Todo), true)) :- dom(todos, Todo).
body(state_constraint2(Todo), pos_fluent(completed(Todo), true)) :- dom(todos, Todo).
body(state_constraint2(Todo), pos_fluent(active_filter, completed)) :- dom(todos, Todo).


state_constraint(state_constraint3(Todo)) :- dom(todos, Todo).
head(state_constraint3(Todo), pos_fluent(visible(Todo), true)) :- dom(todos, Todo).

body(state_constraint3(Todo), pos_fluent(active(Todo), true)) :- dom(todos, Todo).
body(state_constraint3(Todo), neg_fluent(completed(Todo), true)) :- dom(todos, Todo).
body(state_constraint3(Todo), pos_fluent(active_filter, active)) :- dom(todos, Todo).



dlaw(causal_law1(A, Text, Todo)) :- dom(actions, A), dom(strings, Text), dom(todos, Todo).
action(causal_law1(A, Text, Todo), A) :- dom(actions, A), dom(strings, Text), dom(todos, Todo).
head(causal_law1(A, Text, Todo), pos_fluent(text(Todo), Text)) :- dom(actions, A), dom(strings, Text), dom(todos, Todo).
head(causal_law1(A, Text, Todo), pos_fluent(completed(Todo), false)) :- dom(actions, A), dom(strings, Text), dom(todos, Todo).
head(causal_law1(A, Text, Todo), pos_fluent(active(Todo), true)) :- dom(actions, A), dom(strings, Text), dom(todos, Todo).
head(causal_law1(A, Text, Todo), pos_fluent(next_todo, Todo + 1)) :- dom(actions, A), dom(strings, Text), dom(todos, Todo).

body(causal_law1(A, Text, Todo), pos_static(instance(A, new_todo), true)) :- dom(actions, A), dom(strings, Text), dom(todos, Todo).
body(causal_law1(A, Text, Todo), pos_static(new_text(A), Text)) :- dom(actions, A), dom(strings, Text), dom(todos, Todo).
body(causal_law1(A, Text, Todo), pos_fluent(next_todo, Todo)) :- dom(actions, A), dom(strings, Text), dom(todos, Todo).


dlaw(causal_law2(A, Todo, Completed, Comp)) :- dom(actions, A), dom(todos, Todo), dom(booleans, Completed), dom(booleans, Comp).
action(causal_law2(A, Todo, Completed, Comp), A) :- dom(actions, A), dom(todos, Todo), dom(booleans, Completed), dom(booleans, Comp).
head(causal_law2(A, Todo, Completed, Comp), pos_fluent(completed(Todo), Comp)) :- dom(actions, A), dom(todos, Todo), dom(booleans, Completed), dom(booleans, Comp).

body(causal_law2(A, Todo, Completed, Comp), pos_static(instance(A, toggle_todo), true)) :- dom(actions, A), dom(todos, Todo), dom(booleans, Completed), dom(booleans, Comp).
body(causal_law2(A, Todo, Completed, Comp), pos_static(target(A), Todo)) :- dom(actions, A), dom(todos, Todo), dom(booleans, Completed), dom(booleans, Comp).
body(causal_law2(A, Todo, Completed, Comp), pos_fluent(completed(Todo), Completed)) :- dom(actions, A), dom(todos, Todo), dom(booleans, Completed), dom(booleans, Comp).
body(causal_law2(A, Todo, Completed, Comp), pos_static(complement(Completed), Comp)) :- dom(actions, A), dom(todos, Todo), dom(booleans, Completed), dom(booleans, Comp).


dlaw(causal_law3(A, Todo, Text)) :- dom(actions, A), dom(todos, Todo), dom(strings, Text).
action(causal_law3(A, Todo, Text), A) :- dom(actions, A), dom(todos, Todo), dom(strings, Text).
head(causal_law3(A, Todo, Text), pos_fluent(text(Todo), Text)) :- dom(actions, A), dom(todos, Todo), dom(strings, Text).

body(causal_law3(A, Todo, Text), pos_static(instance(A, edit_todo), true)) :- dom(actions, A), dom(todos, Todo), dom(strings, Text).
body(causal_law3(A, Todo, Text), pos_static(target(A), Todo)) :- dom(actions, A), dom(todos, Todo), dom(strings, Text).
body(causal_law3(A, Todo, Text), pos_static(edit_text(A), Text)) :- dom(actions, A), dom(todos, Todo), dom(strings, Text).


dlaw(causal_law4(A, Todo)) :- dom(actions, A), dom(todos, Todo).
action(causal_law4(A, Todo), A) :- dom(actions, A), dom(todos, Todo).
head(causal_law4(A, Todo), neg_fluent(active(Todo), true)) :- dom(actions, A), dom(todos, Todo).

body(causal_law4(A, Todo), pos_static(instance(A, destroy_todo), true)) :- dom(actions, A), dom(todos, Todo).
body(causal_law4(A, Todo), pos_static(target(A), Todo)) :- dom(actions, A), dom(todos, Todo).


dlaw(causal_law5(A, Completed, Todo)) :- dom(actions, A), dom(booleans, Completed), dom(todos, Todo).
action(causal_law5(A, Completed, Todo), A) :- dom(actions, A), dom(booleans, Completed), dom(todos, Todo).
head(causal_law5(A, Completed, Todo), pos_fluent(completed(Todo), Completed)) :- dom(actions, A), dom(booleans, Completed), dom(todos, Todo).

body(causal_law5(A, Completed, Todo), pos_static(instance(A, set_all), true)) :- dom(actions, A), dom(booleans, Completed), dom(todos, Todo).
body(causal_law5(A, Completed, Todo), pos_static(set_completed(A), Completed)) :- dom(actions, A), dom(booleans, Completed), dom(todos, Todo).


dlaw(causal_law6(A, Todo)) :- dom(actions, A), dom(todos, Todo).
action(causal_law6(A, Todo), A) :- dom(actions, A), dom(todos, Todo).
head(causal_law6(A, Todo), neg_fluent(active(Todo), true)) :- dom(actions, A), dom(todos, Todo).

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

body_satisfied(R, I) :-
    step(I),
    body(R, _),
    #count { F : body(R, pos_fluent(F,V)), fluent(_,F,V) } = FPB,
    #count { F : body(R, pos_fluent(F,V)), fluent(_,F,V), holds(F, V, I) } = FPB,
    #count { F : body(R,neg_fluent(F,V)), fluent(_,F,V) } = FNB,
    #count { F : body(R,neg_fluent(F,V)), fluent(_, F,V), not holds(F,V,I) } = FNB,
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

holds(causal_law, F, V, I + 1) :-
    step(I),
    dlaw(R),
    action(R, A),
    occurs(A, I),
    body_satisfied(R, I),
    head(R, pos_fluent(F,V)),
    1 < n.

nholds(causal_law_flip, F, V, I + 1) :-
    step(I),
    dlaw(R),
    action(R, A),
    occurs(A, I),
    body_satisfied(R, I),
    head(R, pos_fluent(F,V')),
    holds(F, V, I),
    V != V',
    1 < n.

nholds(causal_law_neg, F, V, I + 1) :-
    step(I),
    dlaw(R),
    action(R, X),
    occurs(X, T),
    body_satisfied(R, T),
    head(R, neg_fluent(F,V)),
    I < n.

holds(sc, F, V, I) :-
    state_constraint(R),
    head(R, pos_fluent(F,V)),
    body_satisfied(R, I).

nholds(sc_neg, F, V, I) :-
    state_constraint(R),
    head(R, neg_fluent(F, V)),
    body_satisfied(R, I).

nholds(cwa, F, V, I) :-
    step(I),
    fluent(defined, F, V),
    not holds(F, V, I).

holds(inertia, F, V, I + 1) :-
    step(I),
    fluent(basic, F, V),
    holds(F, V, I),
    not nholds(F, V, I + 1),
    I < n. 

nholds(inertia_neg, F, V, I + 1) :-
    step(I),
    fluent(basic, F, V),
    nholds(F, V, I),
    not holds(F, V, I + 1),
    I < n. 

holds(F, V, I) :- holds(_, F, V, I).
nholds(F, V, I) :- nholds(_, F, V, I).


dom(S1, X) :- holds(static(link(S2), S1)), dom(S2, X).

holds(static(link(booleans), universe)).
dom(booleans, true). dom(booleans, false).

holds(static(link(actions), universe)).

holds(static(instance(X, S), true)) :- dom(S, X).

#show.

#show ("Duplicate values found", F, V, V', "at_time", I) : holds(F, V, I), holds(F, V', I), V != V'.
#show ("Conflict found", F, V, I, R, R) : holds(R, F, V, I), nholds(R, F, V, I).

%#show (F, V) : holds(F, V, n).

    
      dom(new_todo, new_todo0).
      holds(static(new_text(new_todo0), "Learn logic programming")).
      occurs(new_todo0, 0).

      dom(new_todo, new_todo1).
      holds(static(new_text(new_todo1), "Build awesome apps")).
      occurs(new_todo1, 1).

      dom(new_todo, new_todo2).
      holds(static(new_text(new_todo2), "Formally verify them with Flamingo")).
      occurs(new_todo2, 2).

      dom(set_active_filter, set_active_filter3).
      holds(static(filter(set_active_filter3), active)).
      occurs(set_active_filter3, 3).

      dom(set_active_filter, set_active_filter4).
      holds(static(filter(set_active_filter4), completed)).
      occurs(set_active_filter4, 4).

      dom(set_active_filter, set_active_filter5).
      holds(static(filter(set_active_filter5), active)).
      occurs(set_active_filter5, 5).

      dom(toggle_todo, toggle_todo6).
      holds(static(target(toggle_todo6), 1)).
      occurs(toggle_todo6, 6).

      dom(set_active_filter, set_active_filter7).
      holds(static(filter(set_active_filter7), completed)).
      occurs(set_active_filter7, 7).
    #show ("visible(Todo), text(Todo) = Text.", "Todo,Text,Todo",Todo,Text,Todo) : holds(visible(Todo), true, n), holds(text(Todo), Text, n).
#show ("completed(Todo) = Completed.", "Completed,Todo",Completed,Todo) : holds(completed(Todo), Completed, n).