import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatPostDate(date: Date) {
  return dateFormat.format(date);
}

export function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function postHref(post: BlogPost) {
  return `/blog/${post.id}/`;
}

export async function publishedPosts() {
  const posts = await getCollection('blog', ({ data }) => data.draft !== true);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
