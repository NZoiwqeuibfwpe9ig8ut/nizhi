export const PROFILE = {
  name: '倪志',
  latinName: 'NI ZHI',
  role: '财务管理本科生',
  focus: '项目统筹 / 运营执行 / 财务分析',
  target: '财务 / 行政 / 运营',
  school: '重庆移通学院',
  major: '财务管理（本科）',
  period: '2023.09 — 2027.06',
  ranking: '专业前 15% · 班级第一',
  location: '重庆 / CHONGQING',
  coordinates: '29.5630° N / 106.5516° E',
  email: '2363655215@qq.com',
  intro:
    '我是倪志，一名财务管理本科生，也是一个习惯把目标拆成步骤、把现场变成复盘的人。',
} as const;

export interface Metric {
  value: string;
  label: string;
}

export interface Project {
  id: string;
  index: string;
  period: string;
  title: string;
  shortTitle: string;
  role: string;
  summary: string;
  postId?: string;
  metrics: Metric[];
  highlights: string[];
  tags: string[];
}

export interface Internship {
  company: string;
  role: string;
  period: string;
  summary: string;
  postId?: string;
  metrics: Metric[];
  highlights: string[];
}

export const PROJECTS: Project[] = [
  {
    id: 'rice-fish',
    index: '01',
    period: '2024.09 — 至今',
    title: '“稻香商链·智惠凤山”双产助农项目',
    shortTitle: '稻香商链 · 双产助农',
    role: '学生负责人',
    summary:
      '与合川区三庙镇合作，以“稻鳖共生”为生态运营模式，把直播、品牌活动、农户与媒体资源组织成一条可持续的销售链。',
    postId: 'rice-fish-chain',
    metrics: [
      { value: '40%', label: '产业复购率增长至' },
      { value: '20–30%', label: '养鳖户收入增长' },
      { value: '60%+', label: '稻鳖线上销售占比' },
    ],
    highlights: [
      '负责直播选题、排期执行与数据复盘，围绕“稻鳖共生”设计直播话术与推广内容。',
      '参与策划“稻蟹文化节”等品牌活动，联动农户、合作社与媒体资源进行线上线下宣传。',
      '项目在“成渝双城经济圈发展”赛道获得省级奖项。',
    ],
    tags: ['助农', '项目统筹', '直播运营'],
  },
  {
    id: 'red-culture',
    index: '02',
    period: '2025.06 — 至今',
    title: '“青衿薪火”红色基因传承实践项目',
    shortTitle: '青衿薪火 · 红色宣讲',
    role: '主要负责人',
    summary:
      '依托重庆本土红色文化，从招募、培训到排班与复盘，搭建一支能持续运转的青年宣讲团队。',
    postId: 'red-culture-speaker-team',
    metrics: [
      { value: '70+', label: '宣讲类活动' },
      { value: '10+', label: '互动体验活动' },
      { value: '2+', label: '权威媒体报道' },
    ],
    highlights: [
      '制定宣讲标准、内容脚本与排班机制，建立从招募到复盘的完整流程。',
      '对接当地红色场馆，策划常态化公益宣讲、互动体验与主题实践活动。',
      '项目被中国青年报、中国思政网等权威媒体报道。',
    ],
    tags: ['组织', '公益', '内容策划'],
  },
  {
    id: 'sandbox',
    index: '03',
    period: '2026.04 — 2026.06',
    title: '企业模拟经营沙盘',
    shortTitle: '企业沙盘 · 生产总监',
    role: '生产总监',
    summary:
      '在多组企业模拟经营对抗中负责生产排产、产能协调、原料采购与库存优化，让生产端的决定跟得上市场订单。',
    postId: 'sandbox-production-director',
    metrics: [
      { value: 'TOP 3', label: '团队综合排名' },
      { value: '1+ 个月', label: '多轮经营对抗' },
      { value: '校级', label: '“商道杯”奖项' },
    ],
    highlights: [
      '根据订单与产能制定生产计划，协调原料采购与库存，减少滞销积压。',
      '在多轮沙盘对抗中推动企业营收稳步增长，团队取得第三名。',
      '获得“商道杯”竞赛校级奖项。',
    ],
    tags: ['财务', '生产计划', '模拟经营'],
  },
];

export const INTERNSHIPS: Internship[] = [
  {
    company: '诸暨市华贝润滑机械有限公司',
    role: '仓库管理员',
    period: '2025.07 — 2025.09',
    summary:
      '在真实的仓库现场处理物料、单据、盘点与备料，让账、物、单三者彼此对得上。',
    postId: 'warehouse-and-scenic-area',
    metrics: [
      { value: '400+', label: '出入库单据' },
      { value: '99%', label: '账实相符率' },
      { value: '20%', label: '停工待料减少' },
    ],
    highlights: [
      '处理润滑机械零部件与原材料入库验收、出库登记，两个月核对约 1,500 项物料型号。',
      '参与 300 个 SKU 的库存盘点，输出盘点报表，库存数据准确率约 98%。',
      '规范物料分区与备料流程，保障车间生产物料供应，物料短缺/停工待料减少约 20%。',
    ],
  },
  {
    company: '重庆佛影峡农业发展有限公司',
    role: '景区管理员',
    period: '2026.07 — 2026.09',
    summary:
      '在景区运营现场处理游客、秩序、客流数据、物资与安全档案，把高峰期的不确定性变成可追踪的台账。',
    postId: 'warehouse-and-scenic-area',
    metrics: [
      { value: '5,000+', label: '累计接待游客' },
      { value: '98%', label: '客流统计准确率' },
      { value: '300+', label: '归档运营资料' },
    ],
    highlights: [
      '负责游客接待、现场秩序维护与信息登记，整理运营台账约 30 份。',
      '使用 Excel 制作约 45 张客流统计表，覆盖约 60 天运营数据，为排班和物资准备提供依据。',
      '协助物资盘点、出入库登记与安全巡查，对接内部部门及合作商户约 15 家。',
    ],
  },
];

export const LEADERSHIP = {
  organization: '北山书院学生会自治委员会',
  role: '主席',
  period: '2025.09 — 2026.06',
  summary:
    '统筹书院活动与志愿服务，把“目标拆解—进度追踪—复盘优化”变成团队共同使用的工作方法。',
  metrics: [
    { value: '4 场', label: '校级大型活动' },
    { value: '3,000+', label: '覆盖师生' },
    { value: '90+', label: '公益活动' },
    { value: '1,200+', label: '动员志愿者' },
  ],
  highlights: [
    '主导 4 场校级活动，覆盖 3,000+ 师生，活动好评率 90%+。',
    '落地 90+ 场公益活动，动员 1,200+ 志愿者，累计服务时长 5,000+ 小时。',
    '搭建“目标拆解—进度追踪—复盘优化”机制，推动活动落地效率提升约 30%。',
  ],
} as const;

export const EDUCATION = {
  school: '重庆移通学院',
  major: '财务管理（本科）',
  period: '2023.09 — 2027.06',
  ranking: '专业排名前 15% · 班级排名第一',
  courses: ['市场营销', '财务管理', '会计学', '统计学', '大数据财务管理'],
  note: '累计志愿时长 380+ 小时；累计获得各类奖学金 15,000 元以上；获得国家级、省部级、校级奖项 40 余项。',
} as const;

export const SKILLS = [
  {
    title: '财务与数据',
    en: 'FINANCE & DATA',
    items: ['财务管理、会计核算基础', 'Excel 数据整理与统计分析', '商业案例分析与项目测算'],
  },
  {
    title: '办公与表达',
    en: 'OFFICE & STORY',
    items: ['WPS / Excel / PPT', '汇报材料与运营台账', 'Python 基础编程工具'],
  },
  {
    title: '视觉与内容',
    en: 'VISUAL & CONTENT',
    items: ['Photoshop / 可画', '剪映影像处理', '秀米公众号排版'],
  },
  {
    title: '项目与组织',
    en: 'PROJECT & PEOPLE',
    items: ['大型活动策划落地', '跨部门沟通协调', '团队统筹与目标拆解'],
  },
] as const;

export const HONORS = [
  {
    level: '国家级',
    title: '2024 公益未来·大学生就业力实践项目',
    result: '全国 45 强',
  },
  {
    level: '国家级',
    title: '2025 全国大学生“人工智能+”创新创业大赛',
    result: '三等奖',
  },
  {
    level: '国家级',
    title: '第九届全国大学生环保知识竞赛',
    result: '优秀组织者',
  },
  {
    level: '省部级',
    title: '第 44 届“动感地带”川渝“校园之春”项目大赛',
    result: '铜奖',
  },
  {
    level: '省部级',
    title: '2024–2025 年川渝大学生志愿服务项目大赛',
    result: '铜奖',
  },
  {
    level: '校级',
    title: '2025 全国高校商业精英挑战赛会计管理案例竞赛',
    result: '三等奖',
  },
  {
    level: '校级',
    title: '2026 iCAN 大学生创新创业大赛“商道杯”',
    result: '三等奖',
  },
  {
    level: '校级',
    title: '重庆移通学院第七届志愿服务项目大赛',
    result: '1 银奖 · 2 铜奖',
  },
] as const;
