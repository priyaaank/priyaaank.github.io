---
title: "Decoding ThoughtWorks' coding problems"
date: 2014-08-18
slug: decoding-thoughtworks-coding-problems
tags: [tech, oop]
excerpt_short: An intro to a series on what "good code" means in the context of ThoughtWorks' interview code reviews, using the Mars Rover problem.
---

I think it is only apt that I introduce myself before I kick start an in-depth post about Object Oriented design of coding problems that we send out in Thoughtworks' interview process.

I have been developer for 10 years and more than half of that time has been spent at ThoughtWorks. I have actively worked across languages and frameworks like Java, Ruby, C#, Rails and now mobile technologies. In recent years my involvement in developing mobile applications and frameworks for hybrid apps has been prolific. And as part of my day job, I am often presented with an opportunity, every now and then, to evaluate the codes that have been sent in for review as part of interview process.

It is those learnings of my own and expectations of several other ThoughtWorkers that I am trying to distill into a series of blogs. My end goal is to talk about things that some of us, as code reviewers, would look for in a solution. And hopefully I can rationalize the reasoning for those expectations.

Use of Object Oriented paradigm to develop programs is not a new one. It has been around for years and as a developer myself I am on a journey to refine my understanding of it as I continue to practice it everyday. My suggestions, rationale and illustrations here are merely a single way to present what is "one of the better" (or at least I think so) approaches to development. But it is by no means, "the only way". I hope you are open to look at things from a different point of view, because I am. A closed mind and a dogmatic approach is probably the biggest injustice one can do to a subjective topic like "good code and good design".

As part of my involvement in code reviews, I have often seen individual potential eclipsed by misplaced understanding of "good code". While the definition is subjective and quite broad; my hope here is to decode; what does "good code" means in context of ThoughtWorks' code reviews? What do we look for? Along the way, I will also try to answer, what do some of us hope to gain out of this?

This series has following blog posts which focus on individual aspects of code design. Look at the list below and feel free to look at them in order you desire; I would try to keep them as independent as possible.

- [Objects that talk domain](/writing/objects-that-talk-domain/)
- [Objects that are loose and discrete](/writing/objects-that-are-loose-and-discrete/)
- [Design patterns for win](/writing/design-patterns-for-win/)
- [Reinforced design with TDD](/writing/reinforced-design-with-tdd/)

All the blog posts above use our one time favorite but now decommissioned coding problem called [Mars Rover](https://github.com/priyaaank/MarsRover) written in Java to illustrate the concepts. The code is completely open source and public. Feel free to deploy it on mars (or not!) and tear it apart if that makes you happy.

Needless to say, I would love to hear feedback and suggestion about what you disagree with and what could be improved both in code example and blogs.

Lets start our deep dive into the meat of the blog series with [Objects that talk domain](/writing/objects-that-talk-domain/).
