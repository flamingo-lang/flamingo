# Step 3: Actions 💣

So far we've described our objects and relationships between them,
but our system is still quite boring, since nothing ever happens and
nothing ever changes. Let's fix that!

So what are the actions in our fruit and basket system? Well, for starters,
we could have a "put fruit in basket" action. We notate this in the same
way as objects:

```alm
actions
    put_fruit_in_basket :: action
```

Every action in ALM is a subsort of `action`, which itself is a subsort
of `universe`.

What are the attributes of our `put_fruit_in_basket` action? Well, we probably
should select a specific fruit.


In reactive settings like user interfaces, actions are often used to describe
_events_ - e.g. a button was clicked, a key was pressed, and HTTP request returned,
etc.

Note that we haven't defined at all _what happens_ when a `put_fruit_in_basket` action
occurs; we'll do that in the next section with _axioms_.

And that's all there is to it! We now have a sorts, relationships, and actions for
our system, which together comprise its _signature_. Let's see the whole thing at once:

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

```
