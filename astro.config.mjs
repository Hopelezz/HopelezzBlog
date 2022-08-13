import { defineConfig } from 'astro/config';
import { remarkReadingTime } from './remark-reading-time.mjs';

import preact from '@astrojs/preact';
import mdx from "@astrojs/mdx";
import image from '@astrojs/image';
import solid from "@astrojs/solid-js";
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  integrations: [solid(), preact(), mdx(), image()],
  markdown: {
    draft: true,
    remarkPlugins: [remarkReadingTime],
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'dracula',
      wrap: true,
      langs: [],
    },
  },
  output: 'server',
  adapter: vercel(),
});