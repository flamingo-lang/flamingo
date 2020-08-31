
    #const n = 3.
    
#defined occurs/2.
#defined body/2.

step(0..n).

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






attr(text(X), Ret) :- dom(new_todo, X), dom(strings, Ret).
dom(new_todo, X) :- holds(static(text(X), Ret)).
dom(strings, Ret) :- holds(static(text(X), Ret)).


attr(target(X), Ret) :- dom(todo_action, X), dom(todos, Ret).
dom(todo_action, X) :- holds(static(target(X), Ret)).
dom(todos, Ret) :- holds(static(target(X), Ret)).




attr(text(X), Ret) :- dom(edit_todo, X), dom(strings, Ret).
dom(edit_todo, X) :- holds(static(text(X), Ret)).
dom(strings, Ret) :- holds(static(text(X), Ret)).


attr(state(X), Ret) :- dom(set_all, X), dom(todo_state, Ret).
dom(set_all, X) :- holds(static(state(X), Ret)).
dom(todo_state, Ret) :- holds(static(state(X), Ret)).



attr(filter(X), Ret) :- dom(set_active_filter, X), dom(filters, Ret).
dom(set_active_filter, X) :- holds(static(filter(X), Ret)).
dom(filters, Ret) :- holds(static(filter(X), Ret)).



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

dom(new_todo, new_todo0).
holds(static(new_text(new_todo0), todo1)).
occurs(new_todo0, 0).
dom(new_todo, new_todo1).
holds(static(new_text(new_todo1), todo2)).
occurs(new_todo1, 1).
   
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
    #count { (R, A, B) : body(R, gt(A, B)) } = GT,
    #count { (R, A, B) : body(R, gt(A, B)), A > B } = GT,
    #count { (R, A, B) : body(R, gte(A, B)) } = GTE,
    #count { (R, A, B) : body(R, gte(A, B)), A >= B } = GTE,
    #count { (R, A, B) : body(R, lt(A, B)) } = LT,
    #count { (R, A, B) : body(R, lt(A, B)), A < B } = LT,
    #count { (R, A, B) : body(R, lte(A, B)) } = LTE,
    #count { (R, A, B) : body(R, lte(A, B)), A <= B } = LTE,
    #count { (R, A, B) : body(R, eq(A, B)) } = EQ,
    #count { (R, A, B) : body(R, eq(A, B)), A = B  } = EQ,
    #count { (R, A, B) : body(R, neq(A, B)) } = NEQ,
    #count { (R, A, B) : body(R, neq(A, B)), A != B  } = NEQ.

#show ("Duplicate values found", F, V, V', "at_time", I) : holds(F, V, I), holds(F, V', I), V != V'.
#show (F, V) : holds(F, V, n).

    
      dom(new_todo, new_todo0).
      holds(static(new_text(new_todo0), todo1)).
      occurs(new_todo0, 0).

      dom(new_todo, new_todo1).
      holds(static(new_text(new_todo1), todo2)).
      occurs(new_todo1, 1).

      dom(new_todo, new_todo2).
      holds(static(new_text(new_todo2), todo3)).
      occurs(new_todo2, 2).

%#show ("visible(Todo), text(Todo) = Text.", "Todo,Text,Todo",Todo,Text,Todo) : holds(visible(Todo), true, n), holds(text(Todo), Text, n).