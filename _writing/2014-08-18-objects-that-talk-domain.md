---
title: "Objects that talk domain"
date: 2014-08-18
slug: objects-that-talk-domain
tags: [tech, oop]
excerpt_short: Why models should own behavior tied to the domain — and what's wrong with the data-transfer-object reflex many enterprise developers carry over.
---

This is my second blog in the series of "Decoding ThoughtWorks' coding problems". If you haven't checked out the first blog, please read my blog on [Decoding ThoughtWorks coding problems](/writing/decoding-thoughtworks-coding-problems/).

A significant number of candidates who apply at ThoughtWorks as a developers, often come from a rich enterprise app development background. A big part of their career has been spent in developing applications in J2EE platform or similar frameworks in other languages like C#. Years of acquired learning of layered development with plethora of services, factories and data transfer objects is hard to shrug off. And it shows.

The most common problem that plagues the coding solution is that it is ripe with prolific use of data transfer objects. They hold state and have no behavior. Everything they own is public.

Before I talk about what is putting off about that, let me ask you a question. If you were to ask your friend her age, would you just expect the friend to let you know the year, month and date separately or just tell you the age? The difference between both responses is "who owns the information" and "who responsibility is it to do the work to get the answer". I would claim, it is your friend's responsibility, since she has all the data she need to give you an answer. Divulging her year, month and date is needless when all you need is age.

I hope you catch my drift.

The core and essential part of any coding problem is it's domain. And unless that domain is succinctly represented in a set of models which own the behavior that pertains to them, a solution always seems a bit kludgy and off putting.

I would love to pick some points around utility of domain objects from Domain driven design by Eric Evans to elaborate on what a object design consideration would be.

When I say "model", I intend to talk about an object that represents an implementation which can act as a backbone of the language used by the team in context of domain. A model would represent a distilled version of domain, agreed upon as a team, to represent terms, concepts and behavior to collaborate seamlessly with domain experts without translation.

It is understandable that candidate won't have the understanding of the terminologies for an abstract coding problem like the one we ask you to solve as part of coding round. Instead we would love for candidates to define a domain terminology based on the problem statement and elaborate it for readers using the models they compose. It would be a asking too much if I did not substantiate this with an example. So to illustrate my point I would like to use a code that is a solution for one of the initial ThoughtWorks' coding problem and my favorite; [Mars Rover](https://github.com/priyaaank/MarsRover/blob/master/README.md).

Problem statement [here](https://github.com/priyaaank/MarsRover/blob/master/README.md) and solution coded in Java [here](https://github.com/priyaaank/MarsRover).

Before we look at some code, let me outline how I think about the problem in terms of models. I feel, we would have a "Rover" that should have a sense of its "Coordinates" and "Direction". Coordinate and direction together would make for a "Location" if there is enough behavior that we derive out of location itself. However currently based on problem statement it doesn't seem like, we do. There are "Commands" that rover can understand. And finally rover must have been deployed on a "Plateau" as problem states. So that summary highlights a sequence of models that represent my domain. How are they connected is driven by their interaction and that translates into the behavior each of these model encompass.

The objects I have identified in problem are as follows: [gist](https://gist.github.com/priyaaank/fcabe6575313774ac1d8).

Having had that look at the identified objects, here are few things I find comforting about this instance of object design.

- Models reflect the domain that was outlined by the problem statement. It builds concepts and interactions as behavior and actors in problem statement as models.
- Once you understand model, you can use the model names to talk about domain without having to translate. An example statement could be, for instance "Should rover process move command when it is pointing to a north direction and on the boundary coordinates of the plateau?".
- Each model is rich with behavior. It has rules to process state internally and subsequently change either its own state or other objects'. And this has been exposed as model's behavior to external world.
- The models distill the knowledge of domain to those few needed concepts and discard everything that isn't relevant to solution at hand. For example, a Plateau could do so much more if we wanted to, but in scope of this problem all we need is, to check if something within the bounds of plateau and that is it. So that is the behavior we distill and incorporate as part of Plateau model.

Of course, design is an iterative process and for me to design it even in its current form took several iterations and discussions. And I encourage you to do the same as you build your own solution.

Having identified objects pertaining to domain, we need to follow to the discipline of organizing them in such a way that they don't become too tightly coupled. This is where the design aspects take over a bit. Lets look at some of the considerations in my next blog, to find out how interactions of objects should be structured to keep them loosely coupled. Head over to [Objects that are loose and discrete](/writing/objects-that-are-loose-and-discrete/).
