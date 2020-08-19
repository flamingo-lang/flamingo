# Basics

Writing a Flamingo program involves four steps:

1. Decide what _sorts_ of objects make up your domain. These include concrete 
things like people or places, but can also be more abstract entities like 
integers or groups.
1. Decide the _relationships_ between objects. 
1. Describe the _actions_ or events that cause change in your domain.
1. Describe the _axioms_ of your domain, the laws that bring it to life.

## Step 1: Sorts

Every object in a Flamingo system has a _sort_. Sorts are roughly analogous
to classes in object-oriented languages or types in typed functional languages,
but Flamingo sorts are simpler than both. Here's what you need to know:

- Sorts can optionally declare _attributes_. Every element of the will have
instances of those attributes associated with it. These are like class-level
properties, except they are immutable.
- Every sort is a subsort of another sort (except the top sort, called
`universe`). Any attributes associated with a sort are inherited by its
subsorts.

Let's write a Flamingo module modeling fruits:

```alm
module fruits
sorts
    fruits :: universe
    apples :: fruits
    oranges :: fruits
```

The `::` is called the _specialization operator_. `fruits :: universe` reads
"the sort `fruits` is a subsort of `universe`". `apples` and `oranges` are both
subsorts of `fruits`. This means you can use an element of `apples` anywhere
an element of `fruits` is required, but, obviously, you can't use an element
of `oranges` where an element of `apples` is required.

You can also define a by explicitly enumerating its elements:

```
varieties :: { macintosh, fuji, golden_delicious, granny_smith }
```

Let's modify our definition of `fruits` to include variety as an attribute:

```
...
    apples :: universe
        attributes
            variety : varieties
...
```

Now, when we construct an instance of `apples`, we must give an element of
`varieties` to be associated with it (the same would hold for any subsort
of `apples`).

In addition to user-defined sorts, there are several built-in sorts like
`booleans`, `naturals` (the numbers 0 to ∞), and the `integers`. 

## Step 2: Relationships

The next step is to define the _relationships_ between our objects. In Flamingo, we
capture relationships with _functions_. These are functions in the mathematical sense:
they aren't a unit of computation like in imperative or functional programming - rather,
they are just labels that map elements of zero or more sorts into another sort (denotationally,
both kinds of functions represent the same thing, but practically, they're quite different).

There are two kinds of functions in Flamingo: _statics_, whose mappings never change,
and _fluents_, whose mappings change over time as a consequence of actions.

Let's extend our fruit example with some statics and fluents:
```alm
module fruits
sorts
    fruits :: universe
    apples :: fruits
    oranges :: fruits
statics
    good_for_baking : varieties -> booleans
fluents
    basic
        in_basket : fruit -> booleans
    defined
        can_bake_pie : booleans
```

Our first function, the static `good_for_baking` will be used to denote whether an variety
of apple can be used in making a pie.

The fluent `in_basket` indicates that a particular fruit is in our basket. Note that `in_basket`
is a _basic_ fluent. Basic fluents have _inertia_: if you put a fruit in the basket, it will stay
there until you remove it.

The fluent `can_bake_pie` indicates we have enough fruit to bake a pie. As a function, it takes zero
parameters (hence, no `->`). Note that `can_bake_pie` is a _defined_ fluent. The return value of
defined fluents is always `booleans`. Additionally, defined fluents do _not_ have inertia - they
are only true when something _makes them true_, and immediately become false if there conditions
are not satisfied (we'll define the conditions for `can_bake_pie` shortly).
