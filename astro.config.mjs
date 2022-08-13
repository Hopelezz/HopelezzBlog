import { defineConfig } from 'astro/config';
import { remarkReadingTime } from './remark-reading-time.mjs';
import preact from '@astrojs/preact';
import mdx from "@astrojs/mdx";
import image from '@astrojs/image';
import solid from "@astrojs/solid-js";
import vercel from '@astrojs/vercel/serverless';

import compress from "astro-compress";

// https://astro.build/config
export default defineConfig({
  site: "https://blackskies.vercel.app/",
  integrations: [solid(), preact(), mdx(), image(), compress()],
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
  adapter: vercel()
});