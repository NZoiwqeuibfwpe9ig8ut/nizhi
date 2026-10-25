/**
 * GitHub Pages-safe URL helpers.
 * `BASE_URL` is injected by Astro from `base` in astro.config.mjs.
 * It always ends with a slash, e.g. "/" or "/inland/".
 */
const rawBase = import.meta.env.BASE_URL || '/';
const normalizedBase = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

export const basePath = normalizedBase;

export function withBase(path = ''): string {
  if (!path) return normalizedBase;
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('#') || path.startsWith('mailto:')) {
    return path;
  }
  return `${normalizedBase}${path.replace(/^\/+/, '')}`;
}

export function absoluteUrl(path = ''): string {
  const site = import.meta.env.SITE || 'https://example.github.io';
  return new URL(withBase(path), site.endsWith('/') ? site : `${site}/`).href;
}

export function assetUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('data:')) return path;
  return withBase(path);
}

export function postUrl(id: string): string {
  return withBase(`notes/${id}/`);
}

export function tagUrl(tag: string): string {
  return withBase(`tags/${encodeURIComponent(tag)}/`);
}
