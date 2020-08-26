# Step 4: Axioms 🧾

In imperative programming, we bring our program to life with _procedures_
that implement some particular _algorithm_. In contrast, ALM is completely
_declarative_ - we state _what must always be true_, and the Flamingo runtime
makes it so (or the Flamingo compiler explains why it can't). Axioms are the
rules for what must always be true.

There are four kinds of axioms:
- Facts, which hold true unconditionally. The syntax is a function expression with a period, e.g.:
    ```
    f(x) = y.
    ```
- State constraints, which say, e.g., "if f(X) is true in given state, then g(X) is also true
in that same state". These have the syntax[[1](#1)]:
    ```
    g(X) if f(X).
    ```

- Causal laws, which say, e.g., "if f(X) is true in a given state, and Y occurs, then g(X) is
true in the next state". These have the syntax:
    ```
    occurs(Y) causes g(X) if f(X).
    ```

- Executability conditions, which say "if a given condition is true in a given state,
then it is impossible for a given action to occur in that state."
    ```
    impossible occurs(A) if [some condition].
    ```
(We'll cover executability conditions more in the next section).

This syntax might be strange at first, but will make sense with a few more examples.
Let's write  out the axioms of our fruit and basket system (in plain English first):

- Golden Delicious and Granny Smith apples are good for baking.
- The basket is full if there are three distinct fruits in it.
- You can bake a pie if you have two apples that are good for baking.
- When you put a fruit in the basket, it becomes in the basket.

> 💡 Always write your axioms out in plain English first. You don't really know
> what you're writing until you've done so, and converting it to ALM's syntax
> afterwards is usually trivial. Always write it out! _Always!_

The first axiom represents two facts about varieties of apples. The
syntax is pretty straight forward:

```
good_for_baking(golden_delicious).
good_for_baking(granny_smith).
```

The next axiom is a state constraint. In ALM's syntax:
```alm
// The basket is full if there are three distinct fruits in it. 
basket_is_full = true if
    in_basket(X) = true,
    in_basket(Y) = true,
    in_basket(Z) = true,
    X != Z,
    X != Y,
    Y != Z.
```
A few things of note:
- Identifiers that begin with an uppercase letter stand for _variables_. These will try to
match _any_ value that fits in that "position" - e.g, in this example, `X`, `Y`, and `Z` all
stand for `fruits` since, in our function declaration for `in_basket`, the first parameter is
`fruits`.
- Different variables do not automatically represent different values. Thus, we must explicitly
compare the fruits `X`, `Y`, and `Z` with the `!=` operator to ensure they are truly distinct.
- Boolean functions are so common in ALM that they have built-in shorthands. Any function
like `f(x) = true` can be written as just `f(x)`, and any expression `f(x) = false` as `-f(x)`.
So the idiomatic syntax for the first axiom is as follows [[2](#2)]:
```alm
// The basket is full if there are three distinct fruits in it. 
basket_is_full if
    in_basket(X),
    in_basket(Y),
    in_basket(Z),
    X != Z,
    X != Y,
    Y != Z.
```

Our third axiom, also a state constraint, is quite similar:
```alm
// You can bake a pie if you have two apples that are good for baking.
can_bake_pie if
    in_basket(X),
    in_basket(Y),
    good_for_baking(X),
    good_for_baking(Y),
    X != Y.
```

The last axiom, a causal law, is a bit different:
```
// When you put a fruit in the basket, it becomes in the basket.
occurs(A) causes in_basket(Fruit) if
    instance(A, put_fruit_in_basket),
    selected_fruit(A) = Fruit.
```

This ALM axiom would read something like this in English:

"When action `A` occurs, it causes `Fruit` to be `in_basket` if
`A` is an instance of the `put_fruit_in_basket` action AND
the `selected_fruit` of `A` is `Fruit`."

The `instance` function is a built-in static function that returns
true if the first argument is an instance of the sort given in
the second argument (or a transitive subsort).
The `instance` function is _extremely_ useful - you can use it do all kinds
of cool object-oriented tricks for modular goodness. That said, we'll
leave the fancier stuff for later examples.

That's all the axioms of our fruit and basket system. In fact, that's
the whole system! Let's the see the whole program all together:

```alm
module fruits
sorts
    fruits :: universe
    varieties :: { macintosh, fuji, golden_delicious, granny_smith }
    apples :: universe
        attributes
            variety : varieties
    oranges :: fruits
actions
    put_fruit_in_basket :: action
        attributes
            selected_fruit : fruits
statics
    good_for_baking : varieties -> booleans
fluents
    basic
        in_basket : fruit -> booleans
        basket_is_full : booleans
    defined
        can_bake_pie : booleans
axioms
    good_for_baking(golden_delicious).
    good_for_baking(granny_smith).

    // The basket is full if there are three distinct fruits in it. 
    basket_is_full if
        in_basket(X),
        in_basket(Y),
        in_basket(Z),
        X != Z,
        X != Y,
        Y != Z.
    
    // You can bake a pie if you have two apples that are good for baking.
    can_bake_pie if
        in_basket(X),
        in_basket(Y),
        good_for_baking(X),
        good_for_baking(Y),
        X != Y.   
    
    // When you put a fruit in the basket, it becomes in the basket.
    occurs(A) causes in_basket(Fruit) if
        instance(A, put_fruit_in_basket),
        selected_fruit(A) = Fruit.
```

The syntax of logic programming takes practice. But note something important:
each axiom has a very straightforward reading in English that is _very similar_
to its original formulation in English. This is what Flamingo is all about: reducing
the gap between informal specification (in English) and the formal specification (in
a programming language). This leads to more simpler, more compact, and easier-to-maintain
code.

---

[<a name="1">1</a>]: While it's sometimes it's more natural in English to say "if [condition],
then [conclusion]", Flamingo follows decades of logic programming tradition
and puts the conclusion first.

[<a name="2">2</a>]: This method of "counting" up to three is pretty tedious and doesn't scale -
counting to 50 would require 50 variables and 1225 comparisons! This problem
is solved by a construct called _aggregates_, which allow functions like min, max,
sum, and count. These haven't been added to Flamingo
yet, but are high on the priority list!
