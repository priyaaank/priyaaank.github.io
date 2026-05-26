---
title: "Reinforced design with TDD"
date: 2014-08-18
slug: reinforced-design-with-tdd
tags: [tech, oop]
excerpt_short: How TDD reinforces good object design — breaking problems into small units, forcing behavior-first thinking, and building a safety net for refactoring.
---

This is my fifth blog in the series of "Decoding ThoughtWorks' coding problems". If you haven't checked out the first four blogs, please read my blogs on [Decoding ThoughtWorks coding problems](/writing/decoding-thoughtworks-coding-problems/), [Objects that talk domain](/writing/objects-that-talk-domain/), [Objects that are loose and discrete](/writing/objects-that-are-loose-and-discrete/) and [Design patterns for win](/writing/design-patterns-for-win/).

Let me begin this post with a simple explanation of TDD a.k.a [Test Driven Development](http://martinfowler.com/bliki/TestDrivenDevelopment.html). Test driven development or test first approach is as its name suggest, an approach to development where tests are written as the first step. And then code is subsequently added to pass those tests. The process can be summarized in three simple steps:

- Write a failing test for a business scenario. The code for this scenario doesn't exist.
- Add code that exclusively addresses the scenario that test covers. Nothing more, nothing less.
- Make test run and validate that it passes now.

Continue to add a series of tests and code until all business scenarios are covered and you are confident that every line that you coded is sufficiently tested. Note the usage of phrase "sufficiently tested". The emphasis is not on 100% test coverage but instead on what's practical and useful in business context.

This approach is dominant in unit tests that are written. In Java this would be done using JUnit and moq or a similar framework. C# NUnit. Ruby rspec or Test::Unit etc.

Once you get the hang of it apart from being tons of fun, this approach of development helps in several ways:

- It forces you to break down current problem into small units of functionality.
- It forces you to think about "behavior" of an object while testing it and helps in solidifying the encapsulation.
- It documents code as you go and it is a means of documenting code which doesn't get outdated. As soon as code evolves, the existing tests fail, forcing a developer to update the specs.
- It builds a safety net around codebase for a team. This helps in ensuring that quality is shipped from day one and collaboration on same codebase is faster. As a developer I would feel confident in making code changes, since I know that any changes that breaks a related/unrelated functionality will be caught by existing test suite.
- Every project that I have worked on in ThoughtWorks follows a discipline of building this safety from day one. Our pre-commit hooks and continuous integration servers run these tests and provide immediate feedback for each commit, in an event, a piece of functionality is broken.

As part of the coding problem solution sent in by candidates, we rarely get to see unit tests, let alone tests that have evidence of Test Driven Development in them. This is primarily due to lack of awareness and practice. While I personally do not penalize codebases for not having tests or TDD approach, presence of those definitely earns brownie points from me. We love to see like minded people who believe in quality and development approach that we are big proponent of.

I hope to substantiate the above concepts with some code that is part of Mars Rover problem. Take a look at the internal details of the [Rover class](https://github.com/priyaaank/MarsRover/blob/master/src/com/thoughtworks/rover/MarsRover.java) in solution. Once you understand the rover, pretend it doesn't exist. And lets write simple test structure to drive the creation of this behavior through tests.

Here is a [gist](https://gist.github.com/priyaaank/e57389b1c256a6ac0299) of skeleton methods that tests the key behavior of the rover. If you would look closely, you will see that beyond the behavior that is tested, we do not want to know anything about the rover. So the internal workings of a rover can be encapsulated and hidden from the outer world.

It is worth noting that for reference purpose while I have created a full class listing all methods to test behavior, in reality, we would approach each method's red (failing test) test and green (passing test) test cycle one by one. A more complete implementation of the [rover test](https://github.com/priyaaank/MarsRover/blob/master/test/MarsRoverTest.java) is here.

It is worth mentioning that while a huge community of developers favors unit testing, there are camps where TDD is looked down upon (not unit testing though). You can find an invigorating [debate on this subject](http://martinfowler.com/articles/is-tdd-dead/) between several luminaries.

There are additional resources and books to enrich your understanding about TDD. [An excellent chapter on TDD](http://www.jamesshore.com/Agile-Book/test_driven_development.html) by James Shore and [Test Driven Development by Kent Beck](http://www.flipkart.com/test-driven-development-example-english-1st/p/itmdvkt9muhqrkkx?pid=9780321146533) are both worth a read.
