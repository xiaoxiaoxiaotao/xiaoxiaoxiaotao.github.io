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
            { 
                title: "Blockchain-based Authentication in Federated Learning",
                file: "posts/blockchain-authentication.md",
                date: "March 15, 2024"
            },
            { 
                title: "Building an Ensemble Model for Bank Card Customer Prediction",
                file: "posts/machine-learning-project.md",
                date: "March 10, 2024"
            },
        ];

        const postsList = document.getElementById('posts-list');
        if (!postsList) return;

        for (const post of posts) {
            const response = await fetch(post.file);
            if (!response.ok) throw new Error(`Failed to load post: ${post.title}`);
            const content = await response.text();
            const html = marked.parse(content);
            
            const article = document.createElement('article');
            article.className = 'blog-post';
            article.innerHTML = `
                <h2>${post.title}</h2>
                <div class="post-date">${post.date}</div>
                <div class="post-content">${html}</div>
            `;
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
