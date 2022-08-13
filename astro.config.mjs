import { defineConfig } from 'astro/config';
import { remarkReadingTime } from './remark-reading-time.mjs';

import mdx from "@astrojs/mdx";
import image from '@astrojs/image';
import solid from "@astrojs/solid-js";
import vercel from '@astrojs/vercel/serverless';
import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({
  integrations: [solid(), preact(), mdx(), image()],
  output: 'server',
  adapter: vercel(),
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
});