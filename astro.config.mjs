import { defineConfig } from 'astro/config'; // import preact from '@astrojs/preact';

import solid from '@astrojs/solid-js';
import mdx from "@astrojs/mdx";
import image from '@astrojs/image';

import solidJs from "@astrojs/solid-js";

// https://astro.build/config
export default defineConfig({
  integrations: [solid(), mdx(), image(), solidJs()],
  markdown: {
    draft: true
  }
});