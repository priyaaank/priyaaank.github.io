---
title: "Objects that are loose and discrete"
date: 2014-08-18
slug: objects-that-are-loose-and-discrete
tags: [tech, oop]
excerpt_short: State vs behavior, Tell-Don't-Ask, unidirectional associations, Law of Demeter, and dependency injection — guidelines that keep object models loosely coupled.
---

This is my third blog in the series of "Decoding ThoughtWorks' coding problems". If you haven't checked out the first two blogs, please read my blog on [Decoding ThoughtWorks coding problems](/writing/decoding-thoughtworks-coding-problems/) and [Objects that talk domain](/writing/objects-that-talk-domain/).

We looked at how models need to represent the language of a domain. Now lets explore a bit around the concepts that help us build the solution that has loosely coupled models. It is worth talking about why loose coupling between objects is desirable. First, as Martin Fowler defines in his [article on coupling](http://martinfowler.com/ieeeSoftware/coupling.pdf), "If changing a module in program requires a change in another module, then coupling exists". Coupling itself isn't bad, as long as objects are not too tightly coupled. I will try to present some guidelines to help quantity what would qualify as "tightly coupled" design. On the other hand, these could also be used as design principles to build a loosely coupled program.

## State vs. Behavior

State of an object is a snapshot in time of it's attributes and their values. This snapshot is one of the possible and a legitimate combination of attribute values for a given domain. A simple example is that of a light switch. If an object represents a flip switch with a boolean, then possible states of an object are "ON" and "OFF". A similar example with in context of mars rover solution would be, Mars rover pointing North, with coordinates marked as 2,3. The combination is valid both from program's and domain perspective. Behavior, on the other hand, is a set of rules that often change the state of current or other objects else based on current state of the participating objects.

Poor encapsulation of state inadvertently leads to tight coupling between objects. A discrete object is one, which is mindful about exposing its internal state. Drawing clear distinction between state and behavior is the first step to loose coupling. In our example code, if we look at the method of moving a rover, we see that a "move" command generates a new set of coordinates for rover internally, and hence changes state. However oblivious to this, rest of the world just relies on the understanding that "rover has moved". Here coordinate is the internal state that represents movement, "move" is the behavior that can be called on a rover.

In case of a flip switch for a light, to preserve the state, the switch object will not allow anyone to set the boolean "ON/OFF" value directly, instead it would expose methods "switchOn" and "switchOff" to world, which are responsible for modifying the state.

## Tell, don't ask

Among all the objects that participate in building our solution, we should aspire for interactions where objects "Tell" another object about what needs to be done and "not ask". This promotes the encapsulation of state, since only behavior is exposed and not state. A simple example from mars rover would be, checking if a coordinate is within the bounds of a plateau. If I asked the plateau its boundary coordinates and compared that myself, then I have accessed the internal state and plateau by itself has no value to contribute in the program. It poignant existence would be that of a value holder object. However by exposing the behavior, we centralize the logic in one place and irrespective of dependent objects, needed change in logic would be required only once, should it change.

## Unidirectional associations

Keep your object model simple. If two objects share bidirectional association, then chances are that a change or modification in either will affect the other. Also, their reusability with other objects becomes questionable as their existence is closely coupled with each other. Bi-directional associations ties two objects together and reduces reusability. Unidirectional objects, when used with abstractions of interfaces, promotes reusability and loose coupling both.

In Mars rover, Coordinates exhibit unidirectional relationship with rover. Since coordinates do not know about rover in specific, it also means that any object can use coordinates to represent its position.

Here is a dependency graph for the Mars Rover application. It is worth noting that Rover and commands share a bidirectional relationships. It is definitely something worth improving however, given the context and problem statement, it seems a bit pre-mature to sort that out. In any case, the association has been abstracted by creating a command interface so that coupling isn't concrete.

![Mars Rover object relationships](/assets/images/objects-loose-discreet/object-relationships.png)

## Law of Demeter or principle of least knowledge

[Law of demeter](http://en.wikipedia.org/wiki/Law_of_Demeter) is a design philosophy which has following three guidelines.

- Each object should have limited knowledge about other objects. It should know about objects, which are closest to it in domain.
- Each object should talk to only objects it knows about and not an unknown object. Here the objects that a model may know about are the objects that it contains and the objects those objects contain subsequently. Synonymous to "Friend of a friend" on facebook.
- Only talk to the objects that you know directly and not their friends. So in facebook analogy, you should not interact with friend of a friend. A friend should do that on your behalf if need be.

To elaborate the guidelines with mars rover solution there three instances, each representing a guideline.

- A rover knows about most of the other objects, however the relationship is unidirectional. Domain does not demand that a direction, coordinate or plateau knows about a rover, and so they don't. Bringing in that knowledge will couple all of them together tightly.
- In accordance with second guideline, the objects identified as part of mars rover solution interact with only objects they are closely associated with and not to an object they don't know about.
- A command object like "MoveCommand" knows about the Rover and it needs to change the rover's state. One possible way for move command, is to ask rover it's coordinate or direction and modify it directly. But that would be breaking the last guideline. Instead that action is delegated to rover, which in turns extracts information from friend and updates the state.

A simple way to put this principle across is, that if you see a long method chaining in an object, that runs deep across objects, then it is most probably breaking the law of demeter. e.g.

> rocket.engine.blastOff();

In statement above, someone is accessing an action on rockets' friend engine, even though it only knows about rocket directly. Changing following to

> rocket.liftOff();

and have "liftOff" internally call "blastOff" on engine is a more decoupled way of doing the same thing.

## Dependency injection

Finally, to manage dependency between objects it is advisable to program to interfaces and use constructor injection to plant an object instance. Elaborating it in context of mars rover, once again, passing in plateau, direction and coordinates to a rover allows a program to inject a specialized version of an object. For example if instead of Mars, same rover was deployed on Pluto, I can inject a pluto plateau with different boundary values. This would automatically change the program output, when a mars rover crosses a boundary (which would be much smaller in pluto's case, since the size of the planet is relatively smaller).

This is especially effective when done in combination with generic interfaces that define contract. The reason I have not done it here is because I personally think, creating interfaces up front without variation in subclasses' behavior sort of comes off as an over engineering. I tend to add interfaces when I have more than one concrete type and when situation demands for it. It is always relatively easier to extract them out. More about it in section that talks about YAGNI and KISS.

In mars rover, only place where an interface made sense was for command objects. ICommand represents a generic contract for all the move or rotate commands. And that helps in executing a command on a rover in a uniform way.

Tight coupling between objects is pervasive and if it becomes entrenched in a program, it directly affects readability and maintainability. Bi-directional relationships require a bloated thought bubble to contextualize all interactions between models making it hard to understand and navigate through code.

Hopefully, this gave you some sense about how to decouple your objects using some basic guidelines. Please head over to the next blog post to read more about [Design patterns for win](/writing/design-patterns-for-win/).
