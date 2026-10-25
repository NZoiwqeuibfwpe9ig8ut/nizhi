import { getCollection, type CollectionEntry } from 'astro:content';
import { postUrl } from './urls';

export type Post = CollectionEntry<'posts'>;

const byNewest = (a: Post, b: Post) => b.data.date.valueOf() - a.data.date.valueOf();

export async function getAllPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.sort(byNewest);
}

export function postTitle(post: Post): string {
  return post.data.title;
}

export function postHref(post: Post): string {
  return postUrl(post.id);
}

export function formatDate(date: Date, style: 'long' | 'short' = 'long'): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: style === 'long' ? 'long' : '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Shanghai',
  })
    .format(date)
    .replace(/\//g, '.');
}

export function formatIsoDate(date: Date): string {
  return date.toISOString();
}

export function readingMinutes(body: string | undefined): number {
  if (!body) return 1;
  const chineseCharacters = (body.match(/[\u3400-\u9fff]/g) || []).length;
  const latinWords = (body.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) || []).length;
  // ~420 CJK characters or 220 words per minute, rounded up.
  return Math.max(1, Math.ceil(chineseCharacters / 420 + latinWords / 220));
}

export function allTags(posts: Post[]): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}

export function adjacentPosts(posts: Post[], current: Post): { previous?: Post; next?: Post } {
  const index = posts.findIndex((post) => post.id === current.id);
  return {
    previous: index > 0 ? posts[index - 1] : undefined,
    next: index >= 0 && index < posts.length - 1 ? posts[index + 1] : undefined,
  };
}
