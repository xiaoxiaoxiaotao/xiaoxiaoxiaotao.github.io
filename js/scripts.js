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

        if (!currentPath.includes('/posts-html/')) {
            await navigateTo('home');
        }
    } catch (error) {
        handleError(error);
    } finally {
        toggleLoading(false);
    }
});

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

        // Update URL without page reload
        const newUrl = baseUrl + `#${page}`;
        window.history.pushState({ page }, '', newUrl);
    } catch (error) {
        handleError(error);
    } finally {
        toggleLoading(false);
    }
}
