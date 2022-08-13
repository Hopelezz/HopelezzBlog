import { defineConfig } from 'astro/config';
import { remarkReadingTime } from './remark-reading-time.mjs';

import solid from '@astrojs/solid-js';
import mdx from "@astrojs/mdx";
import image from '@astrojs/image';

import solidJs from "@astrojs/solid-js";
// import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({
  integrations: [solid(), mdx(), image(), solidJs()],
  markdown: {
    remarkPlugins: [remarkReadingTime],
    draft: true,
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'dracula',
      wrap: true,
      langs: [],
    },
  },
});