import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './.generated-content/content' }),
  schema: z.object({
    type: z.string().min(1), domain: z.string().min(1), course: z.string().optional(),
    title: z.string().min(1), description: z.string().min(1), created: z.coerce.date(), updated: z.coerce.date(),
    tags: z.array(z.string().min(1)), status: z.string().min(1), publish: z.literal(true), slug: z.string().regex(/^(?!\/)(?!.*\.\.)(?!.*\\).*(?<!\/)$/),
    difficulty: z.string().optional(), featured: z.boolean().default(false), series: z.string().optional(), cover: z.string().optional(),
    'source-url': z.url().optional(), author: z.string().optional(), stability: z.string().optional(), internal: z.boolean().default(false)
  }).refine((value) => value.updated >= value.created, { message: 'updated 不得早于 created' })
});
export const collections = { articles };
