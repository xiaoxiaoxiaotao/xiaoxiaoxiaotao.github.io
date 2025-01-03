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
        const posts = [
            { title: "Example Post 1", file: "posts/example.md" },
        ];

        const postsList = document.getElementById('posts-list');
        if (!postsList) return;

        for (const post of posts) {
            const response = await fetch(post.file);
            if (!response.ok) throw new Error(`Failed to load post: ${post.title}`);
            const content = await response.text();
            const html = marked.parse(content);
            
            const article = document.createElement('article');
            article.innerHTML = html;
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
