// 初始组件
document.addEventListener("DOMContentLoaded", function() {
    fetch('components/navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-placeholder').innerHTML = data;
        });
    navigateTo('home'); // Load home page by default on first load
});


function loadPosts() {
    const posts = [
        { title: "Example Post 1", file: "posts/example.md" },
    ];

    const postsList = document.getElementById('posts-list');

    posts.forEach(post => {
        fetch(post.file)
            .then(response => response.text())
            .then(markdown => {
                const htmlContent = marked.parse(markdown);
                const firstParagraph = htmlContent.split("</p>")[0] + "</p>";

                const postDiv = document.createElement('div');
                postDiv.className = 'post';
                postDiv.innerHTML = `
                    <h2>${post.title}</h2>
                    <div class="post-content">${firstParagraph}</div>
                    <p><a href="${post.file}" target="_blank">Read more</a></p>
                `;

                postsList.appendChild(postDiv);
            })
            .catch(error => {
                console.error('Error loading Markdown file:', error);
            });
    });
}


function navigateTo(page) {
    let url = '';
    switch (page) {
        case 'home':
            url = 'components/home.html';
            break;
        case 'posts':
            url = 'components/posts.html';
            break;
        case 'about':
            url = 'components/about.html';
            break;
        default:
            console.log("Unknown page: " + page);
            return;
    }

    // 使用 fetch API 请求并插入HTML内容
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            // 将请求到的HTML内容插入到页面中的某个容器
            document.getElementById('content-placeholder').innerHTML = data;
            // 如果是posts页面，则加载Markdown内容
            if (page === 'posts') {
                loadPosts();
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}
