import { defineConfig } from 'astro/config'; // import preact from '@astrojs/preact';

import solid from '@astrojs/solid-js';
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  integrations: [solid(), mdx()],
  markdown: {
    draft: true,
  },
});