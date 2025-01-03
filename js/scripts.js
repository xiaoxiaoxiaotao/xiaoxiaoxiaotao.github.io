// Global state management
const state = {
    isLoading: false,
    currentPage: 'home'
};

// Toggle loading state
function toggleLoading(show) {
    state.isLoading = show;
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

// Error handling
function handleError(error) {
    console.error('Error:', error);
    alert('Loading failed. Please try again later.');
    toggleLoading(false);
}

// Initialize components
document.addEventListener("DOMContentLoaded", async function() {
    try {
        toggleLoading(true);
        const response = await fetch('components/navbar.html');
        if (!response.ok) throw new Error('Failed to load navbar');
        const data = await response.text();
        document.getElementById('navbar-placeholder').innerHTML = data;
        await navigateTo('home');
    } catch (error) {
        handleError(error);
    } finally {
        toggleLoading(false);
    }
});

// Load posts list
async function loadPostsList() {
    const postsList = document.getElementById('posts-list');
    if (!postsList) {
        console.error('Posts list container not found');
        return;
    }

    try {
        toggleLoading(true);
        postsList.innerHTML = '<div class="loading-message">Loading posts...</div>';

        const response = await fetch('posts/posts.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Clear loading message
        postsList.innerHTML = '';

        if (!data.posts || data.posts.length === 0) {
            postsList.innerHTML = '<div class="no-posts">No posts available.</div>';
            return;
        }

        // Display posts list
        data.posts.forEach(post => {
            const article = document.createElement('article');
            article.className = 'post-preview';
            
            let content = `
                <h2><a href="#" onclick="loadPostDetail('${post.id}')">${post.title || 'Untitled Post'}</a></h2>
                ${post.date ? `<div class="post-date">${post.date}</div>` : ''}
                <div class="post-preview-content">
                    ${post.description ? `<p>${post.description}</p>` : ''}
                    ${post.tags && post.tags.length > 0 ? `
                        <div class="tags">
                            ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
            
            article.innerHTML = content;
            postsList.appendChild(article);
        });
    } catch (error) {
        console.error('Error loading posts:', error);
        postsList.innerHTML = `
            <div class="error-message">
                Failed to load posts. Please try again later.
                <button onclick="loadPostsList()" class="retry-button">Retry</button>
            </div>
        `;
    } finally {
        toggleLoading(false);
    }
}

// Load post detail
async function loadPostDetail(postId) {
    try {
        toggleLoading(true);
        
        // Fetch post data
        const response = await fetch('posts/posts.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Find the specific post
        const post = data.posts.find(p => p.id === postId);
        if (!post) {
            throw new Error('Post not found');
        }

        // Load post detail template
        const templateResponse = await fetch('components/post-detail.html');
        if (!templateResponse.ok) {
            throw new Error('Failed to load post detail template');
        }
        const template = await templateResponse.text();
        
        // Insert post content into main content area
        document.getElementById('content-placeholder').innerHTML = template;
        
        // Populate post detail
        const postContent = document.getElementById('post-detail');
        if (postContent) {
            postContent.innerHTML = `
                <h1>${post.title}</h1>
                <div class="post-meta">
                    <div class="post-date">${post.date || ''}</div>
                    ${post.status ? `<div class="post-status">${post.status}</div>` : ''}
                </div>
                <div class="post-content">
                    ${post.content || post.description}
                    ${post.link ? `
                        <div class="post-link">
                            <a href="${post.link}" target="_blank" rel="noopener noreferrer">
                                View Project →
                            </a>
                        </div>
                    ` : ''}
                </div>
                ${post.tags && post.tags.length > 0 ? `
                    <div class="tags">
                        ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="post-navigation">
                    <a href="#" onclick="navigateTo('posts')" class="back-to-posts">← Back to Posts</a>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading post detail:', error);
        document.getElementById('content-placeholder').innerHTML = `
            <div class="error-message">
                Failed to load post. Please try again later.
                <button onclick="navigateTo('posts')" class="retry-button">Back to Posts</button>
            </div>
        `;
    } finally {
        toggleLoading(false);
    }
}

// Page navigation
async function navigateTo(page) {
    try {
        toggleLoading(true);
        state.currentPage = page;
        
        const response = await fetch(`components/${page}.html`);
        if (!response.ok) throw new Error(`Failed to load page: ${page}`);
        const content = await response.text();
        
        document.getElementById('content-placeholder').innerHTML = content;
        
        if (page === 'posts') {
            await loadPostsList();
        }
        
        // Update active navigation item
        document.querySelectorAll('.navbar a').forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-page') === page);
        });
    } catch (error) {
        handleError(error);
    } finally {
        toggleLoading(false);
    }
}
