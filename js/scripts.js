// 使用 JavaScript 动态加载导航栏
document.addEventListener("DOMContentLoaded", function() {
    fetch('navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-placeholder').innerHTML = data;
        });
});

document.addEventListener("DOMContentLoaded", function() {
    // 定义要加载的Markdown文件列表
    const posts = [
        { title: "Example Post 1", file: "posts/example.md" },
    ];

    // 获取要插入内容的容器
    const postsList = document.getElementById('posts-list');

    // 遍历每个Markdown文件
    posts.forEach(post => {
        fetch(post.file)
            .then(response => response.text())
            .then(markdown => {
                // 使用 marked.js 将 Markdown 转换为 HTML
                const htmlContent = marked.parse(markdown);
                
                // 创建新的 post div
                const postDiv = document.createElement('div');
                postDiv.className = 'post';
                
                // 插入标题和内容摘要
                postDiv.innerHTML = `
                    <h2>${post.title}</h2>
                    <div class="post-content">
                        ${htmlContent.split("\n")[0]} <!-- 显示Markdown的第1行作为摘要 -->
                        <p><a href="${post.file}" target="_blank">Read more</a></p>
                    </div>
                `;
                
                // 添加到postsList中
                postsList.appendChild(postDiv);
            });
    });
});
