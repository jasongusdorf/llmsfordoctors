import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const workflowCategories = [
  'note-writing',
  'clinical-reasoning',
  'patient-education',
  'literature-review',
  'admin-billing',
  'board-prep',
] as const;

const toolCategories = [
  ...workflowCategories,
  'general',
] as const;

const workflows = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/workflows' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(workflowCategories),
    tools: z.array(z.string()),
    templates: z.array(z.string()).optional(),
    trials: z.array(z.string()).optional(),
    tags: z.array(z.string()),
    timeToRead: z.number(),
    lastUpdated: z.date(),
    specialty: z.array(z.string()).optional(),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    lastUpdated: z.date(),
    featured: z.boolean().default(false),
  }),
});

const tools = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/tools' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    vendor: z.string(),
    rating: z.number().min(1).max(5),
    verdict: z.string(),
    pricing: z.string(),
    hasBaa: z.boolean(),
    categories: z.array(z.enum(toolCategories)),
    lastUpdated: z.date(),
  }),
});

const templates = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/templates' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(workflowCategories),
    targetTool: z.string(),
    workflow: z.string().optional(),
    tags: z.array(z.string()),
    lastUpdated: z.date(),
  }),
});

const trials = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/trials' }),
  schema: z.object({
    title: z.string(),
    journal: z.string(),
    year: z.number(),
    doi: z.string(),
    keyFinding: z.string(),
    lastUpdated: z.date(),
    tags: z.array(z.string()),
  }),
});

const courses = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/courses' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    lastUpdated: z.date(),
  }),
});

export const collections = {
  workflows,
  guides,
  tools,
  templates,
  trials,
  courses,
};
