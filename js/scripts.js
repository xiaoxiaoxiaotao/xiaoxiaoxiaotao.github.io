// Global state management
const state = {
    isLoading: false,
    currentPage: 'home'
};

const PAGES = ['home', 'publications', 'about'];

let loadingTimer = null;
let navToken = 0;

function toggleLoading(show) {
    state.isLoading = show;
    const loadingElement = document.getElementById('loading');
    if (!loadingElement) return;
    clearTimeout(loadingTimer);
    if (show) {
        loadingTimer = setTimeout(() => {
            loadingElement.hidden = false;
        }, 180);
    } else {
        loadingElement.hidden = true;
    }
}

function handleError(error) {
    console.error('Error:', error);
    toggleLoading(false);
    const content = document.getElementById('content-placeholder');
    if (content) {
        content.innerHTML = '<div class="container"><p class="error-message">Loading failed. Please try again later.</p></div>';
    }
}

function getBaseUrl() {
    const currentPath = window.location.pathname;
    return currentPath.includes('/posts-html/') ? '../' : '';
}

function pageFromHash() {
    const hash = window.location.hash.replace(/^#/, '').split('/')[0];
    return PAGES.includes(hash) ? hash : null;
}

function resolvedTheme() {
    const explicit = document.documentElement.getAttribute('data-theme');
    if (explicit === 'dark' || explicit === 'light') return explicit;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function syncThemeControls(theme) {
    const button = document.querySelector('.theme-toggle');
    if (button) {
        button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#14181f' : '#f3f0e8');
}

function closeMobileNav() {
    document.body.classList.remove('nav-open');
    const toggle = document.querySelector('.nav-toggle');
    if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
    }
}

function setActiveNav(page) {
    document.querySelectorAll('#nav-menu a').forEach(link => {
        const active = link.getAttribute('data-page') === page;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });
}

function initNavbar() {
    try {
        const stored = localStorage.getItem('theme');
        if ((stored === 'dark' || stored === 'light') && !document.documentElement.getAttribute('data-theme')) {
            document.documentElement.setAttribute('data-theme', stored);
        }
    } catch (e) {}

    const toggle = document.querySelector('.nav-toggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            const open = document.body.classList.toggle('nav-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        });
    }

    const themeButton = document.querySelector('.theme-toggle');
    syncThemeControls(resolvedTheme());
    if (themeButton) {
        themeButton.addEventListener('click', () => {
            const next = resolvedTheme() === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            try { localStorage.setItem('theme', next); } catch (e) {}
            syncThemeControls(next);
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMobileNav();
    });

    document.addEventListener('click', (event) => {
        if (!document.body.classList.contains('nav-open')) return;
        if (event.target.closest('.navbar')) return;
        closeMobileNav();
    });

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onSchemeChange = () => {
        let stored = null;
        try { stored = localStorage.getItem('theme'); } catch (e) {}
        if (!stored) syncThemeControls(resolvedTheme());
    };
    if (media.addEventListener) media.addEventListener('change', onSchemeChange);
}

document.addEventListener('DOMContentLoaded', async function() {
    try {
        toggleLoading(true);
        const baseUrl = getBaseUrl();
        const response = await fetch(baseUrl + 'components/navbar.html');
        if (!response.ok) throw new Error('Failed to load navbar');
        const data = await response.text();
        document.getElementById('navbar-placeholder').innerHTML = data;
        initNavbar();

        const content = document.getElementById('content-placeholder');
        if (!content) return;

        const initialPage = pageFromHash() || 'home';
        await navigateTo(initialPage, { historyMode: 'replace' });
    } catch (error) {
        handleError(error);
    } finally {
        toggleLoading(false);
    }
});

window.addEventListener('popstate', () => {
    if (!document.getElementById('content-placeholder')) return;
    const page = pageFromHash() || 'home';
    navigateTo(page, { historyMode: 'none' });
});

function initializeCodeBlocks() {
    const codeBlocks = document.querySelectorAll('.post-content .codehilite');

    codeBlocks.forEach((block) => {
        let language = 'code';
        const codeElement = block.querySelector('code');
        if (codeElement && codeElement.className) {
            const langMatch = codeElement.className.match(/language-(\w+)/);
            if (langMatch) language = langMatch[1];
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'code-block';

        const header = document.createElement('div');
        header.className = 'code-header';

        const langSpan = document.createElement('span');
        langSpan.className = 'code-language';
        langSpan.textContent = language;

        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.type = 'button';
        copyButton.textContent = '复制';
        copyButton.onclick = function() {
            const code = block.textContent;
            navigator.clipboard.writeText(code).then(() => {
                copyButton.textContent = '已复制!';
                copyButton.classList.add('copied');
                setTimeout(() => {
                    copyButton.textContent = '复制';
                    copyButton.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                copyButton.textContent = '复制失败';
                setTimeout(() => {
                    copyButton.textContent = '复制';
                }, 2000);
            });
        };

        header.appendChild(langSpan);
        header.appendChild(copyButton);

        const parent = block.parentNode;
        parent.insertBefore(wrapper, block);
        wrapper.appendChild(header);
        wrapper.appendChild(block);
    });
}

async function navigateTo(page, options = {}) {
    const historyMode = options.historyMode || 'push';
    const content = document.getElementById('content-placeholder');
    if (!content) {
        window.location.href = getBaseUrl() + 'index.html#' + page;
        return;
    }
    if (!PAGES.includes(page)) return;

    if (historyMode === 'push' && window.location.hash === '#' + page && state.currentPage === page && content.innerHTML.trim()) {
        closeMobileNav();
        return;
    }

    const token = ++navToken;
    try {
        toggleLoading(true);
        closeMobileNav();
        state.currentPage = page;

        const baseUrl = getBaseUrl();
        const response = await fetch(baseUrl + `components/${page}.html`);
        if (!response.ok) throw new Error(`Failed to load page: ${page}`);
        const html = await response.text();
        if (token !== navToken) return;

        content.innerHTML = html;
        setActiveNav(page);

        document.title = page === 'home'
            ? 'Songtao Li: Personal Portfolio'
            : `${page.charAt(0).toUpperCase() + page.slice(1)} - Songtao Li`;

        if (page === 'publications') {
            await loadPublications();
            if (token !== navToken) return;
        }

        if (historyMode === 'push') {
            window.history.pushState({ page }, '', '#' + page);
        } else if (historyMode === 'replace') {
            window.history.replaceState({ page }, '', '#' + page);
        }

        if (historyMode !== 'none') {
            window.scrollTo(0, 0);
        }

        if (historyMode === 'push') {
            const heading = content.querySelector('h1');
            if (heading) {
                if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
                heading.focus({ preventScroll: true });
            }
        }
    } catch (error) {
        if (token === navToken) handleError(error);
    } finally {
        if (token === navToken) toggleLoading(false);
    }
}

function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]);
}

async function loadPublications() {
    try {
        const baseUrl = getBaseUrl();
        const response = await fetch(baseUrl + 'posts/publications.json');
        if (!response.ok) throw new Error('Failed to load publications data');
        const data = await response.json();

        const publicationsList = document.getElementById('publications-list');
        if (!publicationsList) return;

        publicationsList.innerHTML = '';

        data.publications.forEach(pub => {
            const pubItem = document.createElement('article');
            pubItem.className = 'post-item';

            const statusBadge = pub.status === 'published'
                ? '<span class="status-badge published">Published</span>'
                : `<span class="status-badge accepted">Accepted (${escapeHtml(pub.acceptDate)})</span>`;

            const venueInfo = pub.status === 'published'
                ? `<p class="publication-venue">${escapeHtml(pub.venue)}</p>`
                : `<p class="publication-venue">${escapeHtml(pub.venue)} <span class="accept-info">(Accepted: ${escapeHtml(pub.acceptDate)})</span></p>`;

            const doiLink = pub.doi
                ? `<a href="${escapeHtml(pub.url)}" target="_blank" rel="noopener noreferrer" class="doi-link">DOI: ${escapeHtml(pub.doi)}</a>`
                : '';

            const tagsHtml = pub.tags
                ? `<div class="post-tags">${pub.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>`
                : '';

            pubItem.innerHTML = `
                <h2>${escapeHtml(pub.title)}</h2>
                <div class="post-meta">
                    <span class="post-authors">${escapeHtml(pub.authors)}</span>
                    <span class="post-year">${escapeHtml(pub.year)}</span>
                    ${statusBadge}
                </div>
                ${venueInfo}
                ${doiLink ? `<div class="publication-doi">${doiLink}</div>` : ''}
                <p class="post-description">${escapeHtml(pub.abstract)}</p>
                ${tagsHtml}
            `;

            publicationsList.appendChild(pubItem);
        });
    } catch (error) {
        console.error('Error loading publications:', error);
        const publicationsList = document.getElementById('publications-list');
        if (publicationsList) {
            publicationsList.innerHTML = '<p class="error-message">Failed to load publications. Please try again later.</p>';
        }
    }
}
