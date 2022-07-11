---
setup: |
  import Layout from '../../layouts/BlogPost.astro'
  import Cool from '../../components/Author.astro'
title: Part 1 - Starting an Astro Blog 
publishDate: 10 JUL 2022
href: https://twitter.com/_Hopelezz
name: Mark Spratt
value: 128
description: Documenting my journey in creating this website.
---
## Motivation

At the time of writing this I'm 3 month into my `Web Development` journey. Details of what I'm capable of can be found here in my [About Me](aboutMe). If that link doesn't work I've either not created the page or a custom 404 Page... they're still under construction. See [Things I want to Do](#things-i-want-to-do) for more details. 

_Not gonna lie, I just learned how to make this link to a different header on the page._

```
[Things I want to Do](#things-i-want-to-do)
```
A description plus in the url part has to have #all-words-in-lower-case with hiphens between each words.

If you are struggling with the idea of `How To` for something like this I hope I can inspires you with this journey. Admittedly, I'm winging it...enjoying the process. If I break something I try to learn why it broke and how to fix it.

## What Frameworks Does This Site Use?

This is purely Astro at the time of writting this post. However, Astro natively supports every popular framework.

- [React](https://reactjs.org/)
- [Svelte](https://svelte.dev/)
- [Vue](https://vuejs.org/)
- [Solidjs](https://solidjs.com/)
- [Preact](https://preactjs.com/)
- [Alpine](https://alpinejs.dev/)
- [Lit](https://lit.dev/)
- [Vanilla](https://www.javascript.com/)

Meaning, if I wanted to come back later and add anything specific I could with little to no issues!

This site started out with a basic [Blog template](https://stackblitz.com/github/withastro/astro/tree/latest/examples/blog?file=README.md). By comparing the two I hope just how drastically this site has changed.

## The Start

The first post I wrote actually started back in 2011 as a facebook post. My mom asked me one morning "[What is a Password Vault](1-password)". Now we're here in 2022 creating a blog. I started programming about 2 years prior learning C#. Making some tournament tracker and a  Shortly after that my roomate & my Co-worker both suggested I start learning Python. I ran through the course. I love writting in python but had no decernable direction. It feels the most intuitive to me. I even created a [Card Game](https://replit.com/@Hopelezz/War?v=1) from scratch.

One evening on Twitch I stumbled on a bootcamp called #100Devs. An instructor who goes by the name Leon was teaching about JavaScript. Honestly, at first I was just going to use the platform to hustle my way into a job, but using python instead. That was until I saw the different projects that were being built. 

### Step 1

First thing was make a Logo! So I still have to work on creating an SVG version of it. That'll come when I have some creative headroom. For now I'll be using a simple PNG.

Secondly, I wanted to add some flexibilty to my site. One thing it was missing is a navigation bar. So I created one! This is what it looked like originally:

<blockquote class="imgur-embed-pub" lang="en" data-id="a/88TWvWO"  ><a href="//imgur.com/a/88TWvWO">Sidebar</a></blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>

For the icons I used this website [Boxicons](https://boxicons.com/). You can search over 1600 icons. You can even use the icons as fonts! Because of this I was able to rather easily modify the CSS of the icons.

### Step 2

<!-- TODO -->

# Things I Want To Do:

- [ ] Turn the Logo into an SVG version
- [ ] Add a `About Me` page
- [ ] Add a `Hire Me` page
- [ ] Add a `404` page
- [ ] Add a Dark Theme.
  - [ ] Add a LeftSideBar button.
  - [ ] Invert the colors and make everything Glow.
- [ ] Fix the `Most Recent Posts` button on the LeftSideBar
- [ ] Add a Search Feature to query the posts for keywords
- [ ] Change the way `Lists` look
- [ ] Change the way `Check Boxes` look
- [ ] Make the Page More responsive to Mobile.
- [ ] Make the Page More accessible to everyone.
- [ ] Add a RightSideBar that shows the `In This Post` headers.
- [ ] Create a template for the Astro Framework based on what I've learned here
