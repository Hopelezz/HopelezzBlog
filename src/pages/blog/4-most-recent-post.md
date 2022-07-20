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
tag: framework, astro, navigation, navbar
---

# The Concept

So I had a navigation bar but nothing really posted to it aside from what I was refereing to as Dashboard and links to my social sites.

## How it works

As soon as you press the button the Nav button is linked to the latest published dates of all the posts. This is done by using the `publishDate` field in the frontmatter of the `.md` file. This is a date in the format `DD MM YYYY`. The `publishDate` field is already used to sort all the posts by date to show the users the most recent post first.

## The Thought Process

I wanted to add some functionality to the Nav bar. So I thought if I was in a post how would I be able to navigate to the latest published post? Eventually I might just change this to a dropmenu or some "Stumble Upon" kinda button that randomly returns a publication, but for now I have a button.

## The Code

Astro has what's known as [YAML Frontmatter](https://docs.astro.build/en/guides/markdown-content/#frontmatter) or Frontmatter for short. This data is at the font of all `.astro` & `.md` files.

### Go Fetch

First we'll want to define how we will collect the data we want to reference. Within all markdown files on this blog there is a `publishDate` variable within our post frontmatter.


```
---
layout: ../../layouts/BlogPost.astro
setup: |
  import Author from '../../components/Author.astro'
title: Most Recent Post
publishDate: 16 JUL 2022    <-- This
name: Mark Spratt
href: https://twitter.com/_Hopelezz
value: 128
description: A simple button, to navigate to the most recent post despite where you are.
tag: framework, astro, navigation, navbar
---
```

When press our button we want to return a single post, but first we need to find all the posts, sort them by date, and return a single post. In order to do that we need to write something like the following:

```js
// Data Fetching: List all Markdown posts in the repo.
let allPosts = await Astro.glob('../pages/*.md');

// Sorts the Posts based on Published Date and reuses the allPosts variable.
allPosts = allPosts.sort((a, b) => new Date(b.frontmatter.publishDate).valueOf() - new Date(a.frontmatter.publishDate).valueOf());

// creates a mostRecentPost based on the last post publishDate.
let mostRecentPost = allPosts[0]; <-- We want to reference this variable in our button.
```

According to the Astro documentation `Astro.glob()` is a way to load many local files into your static site setup. The catch is you can only use it within a `.astro` file. These are special files that give us access to the Astro API.

To recap, the mostRecentPost variable will return an array of objects that is sorted by the frontmatter property label called `publishDate`. Then it will only return the first item in the array.

How do we attach it to our Button? If this was built outside of the component we need to import the fetches return and deconstruct the posts url in the href. To do that we need add  `{mostRecentPost.url}` to the href of our anchor.

### HTML Searchbar Structure:
```html
<li>
    <a href={ mostRecentPost.url }>   <-- 
        <i class='bx bx-book'></i>    <-- This is the Icon
        <span class="links_name">Recent Blog</span>  <-- This is the Class name and text displayed
    </a>
    <span class="tooltip">Recent Blog</span>
</li>
```