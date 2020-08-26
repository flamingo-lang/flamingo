# Basics 🤓

Writing a Flamingo program involves five steps:

1. Decide what _sorts_ of objects make up your domain. These include concrete 
things like people or places, but can also be more abstract entities like 
integers or groups.

1. Decide the _relationships_ between objects. 

1. Describe the _actions_ or events that cause change in your domain.

1. Describe the _axioms_ of your domain, the laws that bring it to life.

1. Test the program, verifying the relationships are maintained in every
possible sequence of actions.

If you've worked with a typed language, steps 1-3 are equivalent to writing
down the all the types you'll be working with. Step 4 is equivalent to
writing the implementations, and where things really diverge from imperative
or functional programming. Step 5 is done _automatically_ by the Flamingo
compiler - no need to write tests by hand!

In the next few sections, we'll go through each step in the context of designing
a simple example system: fruits and a fruit basket. Our system won't be
"plugged in" to the DOM or anything - we'll cover that in the
[TodoMVC example](./../todomvc/todomvc.md) a bit later.
