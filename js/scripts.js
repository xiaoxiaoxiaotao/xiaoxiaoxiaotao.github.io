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
    try {
        toggleLoading(true);
        const response = await fetch('posts/posts.json');
        if (!response.ok) throw new Error('Failed to load posts');
        const data = await response.json();
        
        const postsList = document.getElementById('posts-list');
        if (!postsList) return;

        // Sort posts by date (newest first)
        const posts = data.posts.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        for (const post of posts) {
            const article = document.createElement('article');
            article.className = 'blog-post';
            
            let content = `
                <h2>${post.title}</h2>
                <div class="post-date">${post.date}</div>
                <div class="post-content">
                    <p>${post.description}</p>
                    ${post.link ? `<p><a href="${post.link}" target="_blank">Read More →</a></p>` : ''}
                    ${post.status ? `<p><em>${post.status}</em></p>` : ''}
                    ${post.tags ? `
                        <div class="tags">
                            ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
            
            article.innerHTML = content;
            postsList.appendChild(article);
        }
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
        
        const response = await fetch(`components/${page}.html`);
        if (!response.ok) throw new Error(`Failed to load page: ${page}`);
        const content = await response.text();
        
        document.getElementById('content-placeholder').innerHTML = content;
        
        if (page === 'blog') {
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
