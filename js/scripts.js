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

// Load blog posts
async function loadPosts() {
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

        // Display posts
        data.posts.forEach(post => {
            const article = document.createElement('article');
            article.className = 'blog-post';
            
            let content = `
                <h2>${post.title || 'Untitled Post'}</h2>
                ${post.date ? `<div class="post-date">${post.date}</div>` : ''}
                <div class="post-content">
                    ${post.description ? `<p>${post.description}</p>` : ''}
                    ${post.link ? `<p><a href="${post.link}" target="_blank" rel="noopener noreferrer">Read More →</a></p>` : ''}
                    ${post.status ? `<p><em>${post.status}</em></p>` : ''}
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
                <button onclick="loadPosts()" class="retry-button">Retry</button>
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
            await loadPosts();
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
