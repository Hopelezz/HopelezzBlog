---
layout: ../../layouts/BlogPost.astro
setup: |
  import Author from '../../components/Author.astro'
title: Most Recent Post
publishDate: 16 JUL 2022
name: Mark Spratt
href: https://twitter.com/_Hopelezz
value: 128
description: A simple button, to navigate to the most recent post despite where you are.
tag: framework, astro, react, svelte, vue, solidjs, preact, alpine, lit, vanilla
draft: true
---

# The Concept

So I had a navigation bar but nothing really posted to it aside from what I was refereing to as Dashboard and links to my social sites.

## How it works

As soon as you press the button the Nav button is linked to the latest published dates of all the posts. This is done by using the `publishDate` field in the frontmatter of the `.md` file. This is a date in the format `DD MM YYYY`. The `publishDate` field is already used to sort all the posts by date to show the users the most recent post first. 