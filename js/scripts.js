// Global state management
const state = {
    isLoading: false,
    currentPage: 'home'
};

// Toggle loading state
function toggleLoading(show) {
    state.isLoading = show;
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
    }
}

// Error handling
function handleError(error) {
    console.error('Error:', error);
    alert('Loading failed. Please try again later.');
    toggleLoading(false);
}

// Get base URL for correct path resolution
function getBaseUrl() {
    const currentPath = window.location.pathname;
    return currentPath.includes('/posts-html/') ? '../' : '';
}

// Initialize components
document.addEventListener("DOMContentLoaded", async function() {
    try {
        toggleLoading(true);
        const baseUrl = getBaseUrl();
        const response = await fetch(baseUrl + 'components/navbar.html');
        if (!response.ok) throw new Error('Failed to load navbar');
        const data = await response.text();
        document.getElementById('navbar-placeholder').innerHTML = data;
        
        // Update active navigation item based on current page
        const currentPath = window.location.pathname;
        const pageName = currentPath.split('/').pop().replace('.html', '');
        document.querySelectorAll('.navbar a').forEach(link => {
            const linkPage = link.getAttribute('data-page');
            link.classList.toggle('active', linkPage === pageName);
        });

        // Check for post ID in URL hash
        const hash = window.location.hash;
        if (hash.startsWith('#post/')) {
            const postId = hash.replace('#post/', '');
            await loadPost(postId);
        } else if (!currentPath.includes('/posts-html/')) {
            await navigateTo('home');
        }
    } catch (error) {
        handleError(error);
    } finally {
        toggleLoading(false);
    }
});

// Initialize code blocks with enhanced features
function initializeCodeBlocks() {
    // Find all code blocks
    const codeBlocks = document.querySelectorAll('.post-content .codehilite');
    
    codeBlocks.forEach((block, index) => {
        // Determine language from the code block
        let language = 'code';
        const codeElement = block.querySelector('code');
        if (codeElement && codeElement.className) {
            const langMatch = codeElement.className.match(/language-(\w+)/);
            if (langMatch) {
                language = langMatch[1];
            }
        }
        
        // Create wrapper and header
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block';
        
        const header = document.createElement('div');
        header.className = 'code-header';
        
        const langSpan = document.createElement('span');
        langSpan.className = 'code-language';
        langSpan.textContent = language;
        
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
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
        
        // Replace the original block with our enhanced version
        const parent = block.parentNode;
        parent.insertBefore(wrapper, block);
        wrapper.appendChild(header);
        wrapper.appendChild(block);
    });
}

// Load post content
async function loadPost(postId) {
    try {
        toggleLoading(true);
        state.currentPage = 'post-detail';
        
        // First load the publication-detail template
        const baseUrl = getBaseUrl();
        const templateResponse = await fetch(baseUrl + 'components/publication-detail.html');
        if (!templateResponse.ok) throw new Error('Failed to load publication detail template');
        const template = await templateResponse.text();
        document.getElementById('content-placeholder').innerHTML = template;
        
        // Then load the post content from posts-html directory
        const postResponse = await fetch(baseUrl + `posts-html/${postId}.html`);
        if (!postResponse.ok) throw new Error('Failed to load post content');
        const postContent = await postResponse.text();
        
        // Extract the article content from the full HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = postContent;
        const articleContent = tempDiv.querySelector('.post-full').innerHTML;
        
        // Insert the content
        document.getElementById('post-content').innerHTML = articleContent;
        
        // Initialize enhanced code blocks
        initializeCodeBlocks();
        
        // Update URL without page reload
        window.history.pushState({ postId }, '', `#post/${postId}`);
        
        // Update active navigation
        document.querySelectorAll('.navbar a').forEach(link => {
            link.classList.remove('active');
        });
    } catch (error) {
        handleError(error);
    } finally {
        toggleLoading(false);
    }
}

// Page navigation
async function navigateTo(page) {
    try {
        toggleLoading(true);
        state.currentPage = page;
        
        const baseUrl = getBaseUrl();
        const response = await fetch(baseUrl + `components/${page}.html`);
        if (!response.ok) throw new Error(`Failed to load page: ${page}`);
        const content = await response.text();
        
        document.getElementById('content-placeholder').innerHTML = content;
        
        // Update active navigation item
        document.querySelectorAll('.navbar a').forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-page') === page);
        });

        // Update document title
        document.title = page === 'home' ? 'Songtao Li: Personal Portfolio' : `${page.charAt(0).toUpperCase() + page.slice(1)} - Songtao Li`;

        // Load publications data if navigating to publications page
        if (page === 'publications') {
            await loadPublications();
        }

        // Update URL without page reload
        const newUrl = baseUrl + `#${page}`;
        window.history.pushState({ page }, '', newUrl);
    } catch (error) {
        handleError(error);
    } finally {
        toggleLoading(false);
    }
}

// Load publications from JSON and render them
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
            const pubItem = document.createElement('div');
            pubItem.className = 'post-item';
            
            const statusBadge = pub.status === 'published' 
                ? `<span class="status-badge published">Published</span>`
                : `<span class="status-badge accepted">Accepted (${pub.acceptDate})</span>`;
            
            const venueInfo = pub.status === 'published'
                ? `<div class="publication-venue">${pub.venue}</div>`
                : `<div class="publication-venue">${pub.venue} <span class="accept-info">(Accepted: ${pub.acceptDate})</span></div>`;
            
            const doiLink = pub.doi 
                ? `<a href="${pub.url}" target="_blank" class="doi-link">DOI: ${pub.doi}</a>`
                : '';
            
            const tagsHtml = pub.tags 
                ? `<div class="post-tags">
                    ${pub.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                   </div>`
                : '';
            
            pubItem.innerHTML = `
                <h2>${pub.title}</h2>
                <div class="post-meta">
                    <span class="post-authors">${pub.authors}</span>
                    <span class="post-year">${pub.year}</span>
                    ${statusBadge}
                </div>
                ${venueInfo}
                ${doiLink ? `<div class="publication-doi">${doiLink}</div>` : ''}
                <p class="post-description">${pub.abstract}</p>
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
