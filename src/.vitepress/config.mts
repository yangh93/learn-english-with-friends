import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'

const sourceDirectory = fileURLToPath(new URL('../', import.meta.url))

// Discover notes at build time so new seasons and episodes appear automatically.
const seasons = readdirSync(sourceDirectory, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^season\d+$/.test(entry.name))
  .sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }))
  .map((entry) => {
    const seasonNumber = Number(entry.name.slice('season'.length))
    const notes = readdirSync(`${sourceDirectory}/${entry.name}`)
      .filter((file) => /^learn_\d+\.md$/.test(file))
      .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))

    return {
      text: `第 ${seasonNumber} 季`,
      collapsed: false,
      items: [
        { text: '本季介绍', link: `/${entry.name}/` },
        ...notes.map((file) => ({
          text: `第 ${Number(file.match(/(\d+)\.md$/)![1]) % 100} 集`,
          link: `/${entry.name}/${file.replace(/\.md$/, '')}`,
        })),
      ],
    }
  })

export default defineConfig({
  lang: 'zh-CN',
  title: '跟着老友记学英语',
  description: '按季、按集整理的 Friends 英语学习笔记：词汇、地道表达和中文解读。',
  base: '/learn-english-with-friends/',
  // Publish learning notes; leave the existing transcript files out of the site.
  srcExclude: ['**/SUMMARY.md', '**/[0-9]*.md'],
  lastUpdated: true,

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '第一季', link: '/season1/' },
    ],
    sidebar: seasons,
    search: { provider: 'local' },
    outline: { label: '本页目录', level: [2, 3] },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdated: { text: '最后更新于' },
    sidebarMenuLabel: '学习目录',
    returnToTopLabel: '回到顶部',
    darkModeSwitchLabel: '外观',
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/yangh93/learn-english-with-friends',
      },
    ],
  },

  transformPageData(pageData) {
    const note = pageData.relativePath.match(/^season(\d+)\/learn_(\d+)\.md$/)
    if (note) {
      pageData.title = `第 ${Number(note[1])} 季 · 第 ${Number(note[2]) % 100} 集`
    }
  },
})
