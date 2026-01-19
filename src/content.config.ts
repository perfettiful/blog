import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/blog" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    image: z.string().optional(),
    // heroImage can be either an optimized image or a string path
    heroImage: image().optional(),
    sources: z.array(z.object({
      title: z.string(),
      url: z.string().url(),
    })).optional(),
  }),
});

export const collections = { blog };
