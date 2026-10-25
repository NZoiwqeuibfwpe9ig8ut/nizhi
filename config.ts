import { PROFILE } from './data/profile';

/**
 * The one place to make this journal yours.
 * Deeper resume data lives in src/data/profile.ts.
 */
export const SITE = {
  title: '内陆 INLAND',
  shortTitle: 'INLAND',
  author: PROFILE.name,
  role: `${PROFILE.role} / 项目实践者`,
  description:
    '倪志的个人实践档案：财务管理本科生，记录助农、红色宣讲、运营实习与校园组织中的真实现场。',
  lang: 'zh-CN',
  locale: 'zh_CN',
  coordinates: PROFILE.coordinates,
  location: PROFILE.location,
  since: '2023',
  email: PROFILE.email,
  github: 'https://github.com/mli341325-A11y',
  jobTarget: PROFILE.target,
  social: [
    { label: 'GitHub', href: 'https://github.com/mli341325-A11y', external: true },
    { label: 'Email', href: `mailto:${PROFILE.email}`, external: false },
    { label: 'RSS', href: '/rss.xml', external: false },
  ],
} as const;

export const NAV = [
  { label: '实践', en: 'PRACTICE', href: '/#practice' },
  { label: '笔记', en: 'NOTES', href: '/#notes' },
  { label: '关于', en: 'ABOUT', href: '/about/' },
] as const;

export const MOTION_STORAGE_KEY = 'inland:motion';
