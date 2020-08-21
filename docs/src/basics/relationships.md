# Step 2: Relationships ❤️

If we've defined our sorts, we're well on our way to a working model of our system.
But sorts aren't enough: as they say, life is all about _relationships_. In ALM, we
capture relationships with _functions_. These are functions in the mathematical sense:
they aren't a unit of computation like in imperative or functional programming - rather,
they are just labels that map elements of zero or more sorts into another sort[[1](#1)].

There are two kinds of functions in ALM: _statics_, whose mappings never change,
and _fluents_, whose mappings change over time as a consequence of actions. Fluents
come in two flavors, basic and defined - we'll address the difference shortly.

Let's extend our fruit example with some statics and fluents:
```alm
module fruits
sorts
    fruits :: universe
    varieties :: { macintosh, fuji, golden_delicious, granny_smith }
    apples :: universe
        attributes
            variety : varieties
    oranges :: fruits
statics
    good_for_baking : varieties -> booleans
fluents
    basic
        in_basket : fruit -> booleans
        basket_is_full : booleans
    defined
        can_bake_pie : booleans
```

Our first function, the static `good_for_baking` will be used to denote whether a variety
of apple can be used in making a pie.

The fluent `in_basket` indicates that a particular fruit is in our basket. Note that `in_basket`
is a _basic_ fluent. Basic fluents have _inertia_: if you put a fruit in the basket, it will stay
there until you remove it.

The basic fluent `basket_is_full` describes when we can't fit any more fruit in the basket.
As a function, it takes zero parameters; hence it doesn't have the `->`.

The fluent `can_bake_pie` indicates we have enough fruit to bake a pie. Note that `can_bake_pie`
is a _defined_ fluent. The return value of a defined fluents is always `booleans`.
Additionally, defined fluents do _not_ have inertia - they are only true when something _makes
them true_, and immediately become false if there conditions are not satisfied (we'll define the
conditions for `can_bake_pie` shortly).

----
[<a name="1">1</a>]: Ok, denotationally speaking they _are_ the same thing, but
practically, they're quite different.
