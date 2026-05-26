---
title: "Design patterns for win"
date: 2014-08-18
slug: design-patterns-for-win
tags: [tech, oop]
excerpt_short: Why design patterns are worth learning — illustrated with Command and Strategy refactorings on the Mars Rover problem.
---

If you are not familiar with design pattern, then I would explain design pattern as "a tried and tested pattern or template to organize your object design, given a set of constraints and requirements around object interaction. In other words, they are dictionary of formalized best object design practices to handle common issues of object interactions".

Design patterns do several things for me.

**They are tried and tested way of organizing object interactions.** Most of the design patterns emphasize on basic code hygiene that we have talked about in previous blog post of [discrete objects and loose coupling](/writing/objects-that-are-loose-and-discrete/). This means, that using a design pattern means not having to reinvent the wheel and have a tried and tested way to solve a design problem. It makes me more efficient and code cleaner.

**They embody a design approach in a succinct definition.** When I am pairing with someone (ThoughtWorks adopts [Extreme Programming](http://martinfowler.com/bliki/ExtremeProgramming.html) practices on day to day basis, which involves pairing) to solve a business problem in context of domain, the name of design patterns tells me what my pair is thinking and intends to do, without an elaborate discussion. An example would be "Hey, lets convert this switch case branching of rules for tax calculation at Airport or City with a strategy pattern". I would presume, that anyone who is familiar with strategy pattern, this statement would indicate to you instantly where the refactoring will go to.

**They leave code more predictable and readable**. Purely from readability point of view; when I am looking at a code that I haven't written I am left to my own means to build the mental models required to understand the cobweb of object interactions. However, for instance, if I see "visitor" keywords somewhere indicating a "Visitor pattern", I instantly grasp what the intention and structure of object interactions. Thereby simplifying the code for me. The structure becomes more readable and predictable.

That being said, it must be noted that lot of design patterns seem like a "simple and obvious" choice only if you have read and experienced them once. Without the knowledge the design can come off as obtuse and complex. Benefit of better collaboration is only evident when all involved people understand design patterns. And therefore to be a better programmer and a collaborative pair, it is recommended you understand at least some of the commonly used design patterns.

In this post, I will explore few design patterns to relay the benefits they bring in. Also I'll talk about the mars rover problem and show how [Command Pattern](http://en.wikipedia.org/wiki/Command_pattern) simplifies the design extremely without any conditional branching in logic.

**Command Pattern to parse rover commands**

A typical rover command's implementation can often look like: [gist](https://gist.github.com/priyaaank/bfae96a306afd3bc88fd).

If you look closely above, the logic is concise to start with but it is using branching to distinguish flows. While in this specific instance refactoring further in order to simplify the logic is somewhat debatable, in large and complex systems code fragments like this tend to bind several flows and evolve into labyrinth of incomprehensible and unreadable code.

A simple choice of Command Pattern can alleviate the issue here. In contrast the code can be refactored to as follows: [gist](https://gist.github.com/priyaaank/1afc714ccde8a05b5230).

As I mentioned already if you are not familiar with design patterns, at first glance the code above can seem like a refactoring that has created more components and files. However once you have experienced the benefits of design patterns in context of flexibility and extensibility first hand you will see the rationale of this refactoring.

Additionally, another most popular pattern to handle conditional branching and switch cases is using polymorphism or "Strategy Pattern". Here is an example code before refactoring: [gist](https://gist.github.com/priyaaank/6e4c37b238d5d64c875a).

Lets create a strategy to create a beverage which has concrete classes that implement that strategy to prepare a beverage based on the type of strategy. When a beverage needs to be created, a concrete type of beverage strategy must be instantiated and injected into the prepare method. Resulting code creates a clear separation of concerns and isolates case specific steps that need to be executed to prepare a beverage. Look at the resulting structure below. You will notice that it also hints at using builder pattern apart from strategy to prepare a beverage: [gist](https://gist.github.com/priyaaank/d4a84b98879b68d67556).

Beyond singleton, factory and abstract factory patterns; some of the other popular design patterns that I have found immensely helpful more often than others, to solve common design problems while coding or brainstorming are as follows:

- Observer pattern
- Strategy pattern
- Command pattern
- Builder pattern
- Decorator pattern
- Bridge pattern
- Visitor pattern

Based on my personal experience I would recommend reading, understanding and applying these patterns in suitable conditions. A number of available good books can tell you how to identify the situation which presents a motivation to use a specific pattern. Adding knowledge of these to your toolbelt will equip you well to handle design problems with ease and proven patterns.

As an additional read, [Martin Fowler](http://martinfowler.com/) maintains a comprehensive list of refactoring situations and examples on [refactoring.com](http://www.refactoring.com/catalog/). Please do check these out. In addition to design patterns I find these helpful to guide me refactor code to a more readable state. A more detailed rationale for each each refactoring can be found in his [book](http://www.flipkart.com/refactoring-improving-design-existing-code-english/p/itmdut8erf2chp3r).

You might want to check out the next blog post in the series, [Reinforced design with TDD](/writing/reinforced-design-with-tdd/).
