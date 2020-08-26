# Verifying Your Program ✔️

Having written our fruit and basket system, it's now
verify it for correctness. To do this, copy it into
a file (we'll call it `fruit_and_basket.alm`) and run
the following on the command line:

```
flamingo verify fruit_and_basket.alm
```

You'll see output like the following:

```
Thinking...
✔️ No conflicts found!
```

But what does this mean? Well, recall that ALM defines _state machines_,
graphs where states are nodes and actions are edges between them. The goal
of an ALM program is to define the state machine that includes every possible
_valid_ state and transition of your program and no _invalid_ state or transitions.
Since ALM is a logic language, invalid states are modelled as _logical
contradictions_: a state is invalid if something inside that state is both
true and false at the same time. Therefore, verifying an ALM program can be reduced
to checking that there are no states with logical contradictions.

Flamingo found no contradictions in our fruit and basket system. On the one hand,
this is great news! On the other hand, we must be careful: just because there are
no _contradictions_ doesn't mean something is _correct_. You must think carefully
about what it means for your system to be correct - that's something no machine can
decide for you. In the process, you'll come up with relationships between objects
and constraints on those relationships. When you translate those into ALM state
constraints, Flamingo can assist you by automatically verifying those constraints
don't contradict each other. It's similar to
[property-based testing](https://hypothesis.works/articles/what-is-property-based-testing/)
, only built into the heart of the language itself.

Let's take a closer look at our fruit and basket system from the perspective of
verification. Notice that our main relationships are described in the static and
fluent functions, all of which are _boolean_ functions, having a value of either
true or false. Notice also that all of our axioms only define when the functions
_become true_, never when they become false. Thus, it's obvious Flamingo will find
no contradictions: we only define one value, true, for each function.

To illustrate this point, let's add a contrived rule to the end of our file
for `can_bake_pie` and see what happens.

First in English:

"You can't bake a pie if there is an orange in your basket."

Then in ALM:
```
// You can't bake a pie if there is an orange in your basket.
-can_bake_pie if
    instance(X, oranges),
    in_basket(X).
```

When we try verifying our program again, Flamingo finds a problem:

```
Thinking...
❌️ Conflict found! Here's the trace to a counter-example:

Objects
====================================
1 : put_fruit_in_basket where
    selected_fruit = 4.
2 : put_fruit_in_basket where
    selected_fruit = 5.
3 : put_fruit_in_basket where
    selected-fruit = 6.
4 : oranges.
5 : apples where
    variety = golden_delicious.
6 : apples where
    variety = golden_delicious.

History
=====================================
occurs(1).
occurs(2).
occurs(3).

Conflict
=====================================
can_bake_pie = true by axiom 5.
can_bake_pie = false by axiom 7.
```
(Your output may be slightly different as there's some non-determinism
involved in finding counter-examples.)

What Flamingo is saying is that it found a set of objects and a sequence
of actions that produced the conflict in the `Conflict` section of the output.
Specifically, it found that if you put an orange in the basket and then two
apples, `can_bake_pie` becomes both true and false by our fifth and seventh
axioms respectively.

This rule is silly, so let's replace it with a slightly less
silly rule. Suppose we _really_ want to make sure we can bake
a pie. We could have an axiom like this:

"The basket must never be full if we can't bake a pie"

This could be expressed in ALM like so:
```alm
-basket_is_full if -can_bake_pie.
```

Alternatively, we could phrase it in an logically equivalent way:

"It must never be the case that the basket is full and we cannot bake
a pie"

The phrase "it must never be the case" is equivalent to `false` in ALM
(since `false` can never be `true`), so we could write the same rule like
so:

```alm
false if basket_is_full, -can_bake_pie.
```

What form you write your rules in is up to you - in this case I like
the former, but often write the latter.

As you can guess, Flamingo finds a problem with this constraint:

```
$ flamingo verify fruit_and_basket.alm
Thinking...
❌️ Conflict found! Here's the trace to a counter-example:

Objects
====================================
1 : put_fruit_in_basket where
    selected_fruit = 4.
2 : put_fruit_in_basket where
    selected_fruit = 5.
3 : put_fruit_in_basket where
    selected_fruit = 6.
4 : oranges.
5 : oranges.
6 : oranges.

History
=====================================
occurs(1).
occurs(2).
occurs(3).

Conflict
=====================================
basket_is_full = true by axiom 3.
basket_is_full = false by axiom 7.
```

We filled up our basket with oranges, and so we didn't have enough apples
for a pie!

To prevent this "bug" in our program, we need an axiom that says something
like this:

"You can't put anything except an apple in the basket unless you have enough
apples to bake a pie."

For this, we need an executability condition (the type of axiom we skipped
in the last section). Here's the syntax:

```
impossible occurs(A) if
    instance(A, put_fruit_in_basket),
    selected_fruit(A) = Fruit
    -instance(Fruit, apples),
    -can_bake_pie.
```

Checking the program again finds no conflicts! 

```
$ flamingo verify fruit_and_basket.alm
Thinking...
✔️ No conflicts found!
```

As we've said, in ALM, crafting correct programs comes down to defining good
states and transitions ruling out bad states and transitions. In the previous
section on axioms, we focused on defining the good states. At runtime, these
are all your program needs to work. In this section, we've focused on ruling
out bad states, which Flamingo uses at verification time to make sure your
program is correct. In particular:
- We used _negative state constraints_ to rule out bad states. These had the form
`false if ...` or `-some_function if ...`.
- We used _executability conditions_ to rule out bad transitions by saying which
actions aren't allowed to occur in a particular state.

Understanding when to use which method is crucial for designing correct systems.

Negative state constraints allow you to define what it means for your system
to be correct _at a every given instant in time_. Because of their semantics,
Flamingo can come behind you and check your logic, making sure your constraints
are all internally consistent and finding counter-examples if any exist. If you
define all possible error states as negative constraints and Flamingo verifies
your program as consistent, you can be sure that your program will never enter
a bad state at runtime (up to certain conditions we'll discuss in the more extended
TodoMVC tutorial).

By contrast, when you use an executability condition, you're telling Flamingo
"Trust me, it's _impossible_ for this particular action to occur if this
particular condition is true", and Flamingo will indeed trust you. If that
action _does_ occur in that state, it will produce a runtime error, potentially
crashing your program! Be absolutely sure that the given situation _really is
impossible_ before using an executability condition. In our fruit and basket 
example, if we were designing a GUI driven by our ALM program, we might achieve
this by disabling the "Put Fruit in Basket" button unless our criteria were met.

The last item of note for verification is that, at present, Flamingo can only
verify _finite_ domains, that is, where every sort has some fixed number of objects
in it (extending Flamingo to infinite domains is the subject
of my Master's thesis!). Usually, only a small number of objects in each sort
is required to find subtle bugs in your axioms.

Phew! We've designed and verified our first system with Flamingo 🍻!
Along the way, we've learned the handful of constructs that make up the
ALM language, all of which can be scaled to produce elegant encodings of
large, complex, formally verified systems!

In the next tutorial, we'll learn some of the tricks of the trade for modeling
larger, more realistic systems, as well as how to hook Flamingo's runtime up
to the DOM to produce working UI!
