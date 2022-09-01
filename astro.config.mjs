import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import mdx from "@astrojs/mdx";
import image from '@astrojs/image';
import solid from "@astrojs/solid-js";
import compress from "astro-compress";
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';
import netlify from '@astrojs/netlify/functions';
import getReadingTime from "reading-time";
import { toString } from "mdast-util-to-string";

export default defineConfig({
  site: "https://blackskies.netlify.app/",
  integrations: [
    sitemap(), 
    robotsTxt(), 
    solid(), 
    preact(), 
    mdx({
      remarkPlugins: {
        // extends: [remarkReadingTime],
      }
    }), 
  image(), 
  compress()],
  markdown: {
    draft: true,
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'dracula',
      wrap: true,
      langs: []
    }
  },
  output: 'server',
  adapter: netlify(),
});


// function remarkReadingTime() {
//   // adds a reading time to all mdx files
//   return function (tree, file) {
//     const textOnPage = toString(tree);
//     const readingTime = getReadingTime(textOnPage);
//     file.data.astro.frontmatter.minutesRead = readingTime.text;
//   };
// }