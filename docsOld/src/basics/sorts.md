# Step 1: Sorts 🌎

Every object in an ALM system has a _sort_. Sorts are roughly analogous
to classes in object-oriented languages or types in typed functional languages,
but ALM sorts are simpler than both. Here's what you need to know:

- Sorts can optionally declare _attributes_. Every element of the will have
instances of those attributes associated with it. These are like class-level
properties, except they are immutable.
- Every sort is a subsort of another sort (except the top sort, called
`universe`). Any attributes associated with a sort are inherited by its
subsorts.

In our fruit and basket system, fruits are obviously going to need to be
an sort of object in our domain. Let's further suppose there are two kinds
of fruits: apples and oranges. Here's how we would write that in ALM:

```alm
module fruit_and_basket
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

While not used in this example, the right hand side of the specialization
operator accepts a comma-separated list of sorts, e.g:
```
sort1 :: sort2, sort3, sort4
```

You can also define a sort by explicitly enumerating its elements.
Let's do that to define several varieties of apples:

```
varieties :: { macintosh, fuji, golden_delicious, granny_smith }
```

Objects often have _attributes_ associated with them, that is,
properties that are intrinsic and never change.
Let's modify our definition of `apples` to include variety as an attribute:

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

There you have it! We've defined the sorts of our fruit and basket system!
In addition to user-defined sorts, there are several built-in sorts like
`booleans`, `naturals` (the numbers 0 to ∞), and the `integers`. 
