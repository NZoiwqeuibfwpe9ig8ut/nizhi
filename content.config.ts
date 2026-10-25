import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string().max(90),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    excerpt: z.string().min(12).max(260),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    lang: z.string().default('zh-CN'),
    updated: z.coerce.date().optional(),
  }),
});

export const collections = { posts };
