import { getCollection } from 'astro:content';

/** Filter tools collection by slugs (using entry.id as the slug identifier) */
export async function getToolsBySlug(slugs: string[]) {
  const all = await getCollection('tools');
  return all.filter((entry) => slugs.includes(entry.id));
}

/** Find workflows that reference a given tool slug */
export async function getWorkflowsForTool(toolSlug: string) {
  const all = await getCollection('workflows');
  return all.filter((entry) => entry.data.tools.includes(toolSlug));
}

/** Find templates for a given workflow slug (checks both template.workflow field and workflow.templates array) */
export async function getTemplatesForWorkflow(workflowSlug: string) {
  const allTemplates = await getCollection('templates');
  const allWorkflows = await getCollection('workflows');
  const workflow = allWorkflows.find((w) => w.id === workflowSlug);
  const workflowTemplateIds = workflow?.data.templates ?? [];
  return allTemplates.filter(
    (entry) =>
      entry.data.workflow === workflowSlug ||
      workflowTemplateIds.includes(entry.id),
  );
}

/** Filter trials collection by slugs (using entry.id as the slug identifier) */
export async function getTrialsBySlug(slugs: string[]) {
  const all = await getCollection('trials');
  return all.filter((entry) => slugs.includes(entry.id));
}

/** Get the latest N guides sorted by lastUpdated descending */
export async function getLatestGuides(count: number) {
  const all = await getCollection('guides');
  return all
    .sort((a, b) => b.data.lastUpdated.getTime() - a.data.lastUpdated.getTime())
    .slice(0, count);
}

/** Get the latest N tools sorted by lastUpdated descending */
export async function getLatestTools(count: number) {
  const all = await getCollection('tools');
  return all
    .sort((a, b) => b.data.lastUpdated.getTime() - a.data.lastUpdated.getTime())
    .slice(0, count);
}

/** Aggregate tags from all taggable collections and return a Map of tag -> count */
export async function getAllTags(): Promise<Map<string, number>> {
  const [workflows, guides, tools, templates, trials] = await Promise.all([
    getCollection('workflows'),
    getCollection('guides'),
    getCollection('tools'),
    getCollection('templates'),
    getCollection('trials'),
  ]);

  const tagMap = new Map<string, number>();

  function addTags(tags: string[]) {
    for (const tag of tags) {
      tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
    }
  }

  workflows.forEach((e) => addTags(e.data.tags));
  guides.forEach((e) => addTags(e.data.tags));
  tools.forEach((e) => {
    // tools don't have a tags field in schema, skip
  });
  templates.forEach((e) => addTags(e.data.tags));
  trials.forEach((e) => addTags(e.data.tags));

  return tagMap;
}
