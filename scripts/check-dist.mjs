import { readFileSync, existsSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const must = (cond, message) => {
  if (!cond) {
    console.error(message);
    process.exitCode = 1;
  }
};

must(existsSync('dist/index.html'), 'missing dist/index.html');
must(existsSync('dist/publications/index.html'), 'missing dist/publications/index.html');
must(existsSync('dist/about/index.html'), 'missing dist/about/index.html');
must(existsSync('dist/404.html'), 'missing dist/404.html');
must(existsSync('dist/CNAME'), 'missing dist/CNAME');
must(existsSync('dist/sitemap.xml'), 'missing dist/sitemap.xml');
must(existsSync('dist/robots.txt'), 'missing dist/robots.txt');
must(existsSync('dist/images/photo.jpg'), 'missing portrait');

const home = read('dist/index.html');
const pubs = read('dist/publications/index.html');
const about = read('dist/about/index.html');
const sitemap = read('dist/sitemap.xml');
const cname = read('dist/CNAME').trim();

must(home.includes("Welcome to Songtao Li's Personal Website"), 'home title copy missing');
must(home.includes('Hello! I\'m a PhD student at The Hong Kong Polytechnic University (PolyU).'), 'home intro missing');
must(home.includes('Large Language Models'), 'interest missing');
must(home.includes('September 2026:'), 'news missing');
must(home.includes('National Scholarship'), 'honor missing');
must(home.includes('© 2024 Songtao Li. All rights reserved.'), 'footer missing');
const titleAt = home.indexOf("Welcome to Songtao Li's Personal Website");
const introAt = home.indexOf("Hello! I'm a PhD student");
must(titleAt !== -1 && introAt > titleAt, 'welcome heading or intro missing');
const underTitle = home.slice(titleAt, introAt);
must(underTitle.includes('aria-label="GitHub"') && underTitle.includes('https://github.com/xiaoxiaoxiaotao'), 'GitHub icon is not directly under the welcome heading');
must(underTitle.includes('aria-label="LinkedIn"') && underTitle.includes('https://www.linkedin.com/in/songtao-li-a0a757274/'), 'LinkedIn icon is not directly under the welcome heading');
must(!home.includes('>GitHub<') && !home.includes('>LinkedIn<'), 'social text buttons still present');
must(home.includes('shqscMoQB9y_7zGeN6nEwFwJpYUC8tpuNc1AmfvPwps'), 'google verification missing');
must(home.includes('application/ld+json'), 'json-ld missing');
must(pubs.includes('Multimodal Alignment and Fusion: A Survey'), 'survey title missing');
must(pubs.includes('https://doi.org/10.1007/s11263-025-02667-1'), 'survey doi link missing');
must(pubs.includes('DA34FL: A Robust Dynamic Accumulator-based Authentication and Key Agreement with Preserving Model Training Data Integrity for Federated Learning'), 'second title missing');
must(pubs.includes('https://doi.org/10.1038/s41598-025-33685-1'), 'second doi link missing');
must(pubs.includes('<strong class="author-self">Songtao Li</strong>'), 'author bold missing');
must(pubs.includes('Hao Tang'), 'coauthor missing');
must(home.includes('class="container container-narrow"'), 'home content width missing');
must(pubs.includes('class="container container-narrow"'), 'publications content width missing');
must(about.includes('class="container container-narrow"'), 'about content width missing');
must(about.includes("Hello! I'm Li Songtao, a PhD student at The Hong Kong Polytechnic University (PolyU), Department of Computing."), 'about copy missing');
must(about.includes('Sep 2026 – present'), 'phd dates missing');
must(about.includes('PhD student'), 'phd degree missing');
must(about.includes('Department of Computing, The Hong Kong Polytechnic University (PolyU)'), 'phd school missing');
must(about.includes('https://ninghaohello.github.io/'), 'supervisor link missing');
must(about.includes('Sep 2022 – Jul 2026'), 'bachelor dates missing');
must(about.includes('Bachelor of Engineering'), 'bachelor degree missing');
must(about.includes('Sydney Smart Technology College, Northeastern University (China)'), 'bachelor school missing');
must(about.includes('Chinese chess, jogging, traveling'), 'interests missing');
must(!about.includes('class="interest-list"'), 'interests still use pills');
must(about.includes('Prof. Ninghao Liu'), 'supervisor wording changed');
must(!about.includes('Additional Information'), 'additional information heading restored');
must(!about.includes('CET6-579') && !about.includes('IELTS'), 'language line restored');
must(!about.includes('Programming:') && !about.includes('Pytorch') && !about.includes('MS Office'), 'tools line restored');
must(cname === 'www.lisongtao.eu.org', `unexpected CNAME: ${cname}`);
must(sitemap.includes('https://www.lisongtao.eu.org/publications/'), 'sitemap publications path missing');
must(sitemap.includes('https://www.lisongtao.eu.org/about/'), 'sitemap about path missing');
must(!sitemap.includes('/#publications'), 'sitemap still lists hash publications URL');
must(!sitemap.includes('/#about'), 'sitemap still lists hash about URL');
must(!home.includes('This website needs JavaScript'), 'stale noscript message still present');

if (process.exitCode) process.exit(process.exitCode);
console.log('dist checks passed');
