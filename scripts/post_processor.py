#!/usr/bin/env python3
import os
import re
import sys
import json
import shutil
from datetime import datetime
from pathlib import Path
import markdown
import frontmatter

class PostProcessor:
    def __init__(self):
        self.root_dir = Path(__file__).parent.parent
        self.posts_dir = self.root_dir / 'posts'
        self.posts_html_dir = self.root_dir / 'posts-html'
        self.components_dir = self.root_dir / 'components'
        
        # Create directories if they don't exist
        self.posts_html_dir.mkdir(exist_ok=True)
        
    def process_markdown(self, md_file: Path) -> dict:
        """Process a markdown file and return its metadata and HTML content."""
        post = frontmatter.load(md_file)
        
        # Validate required metadata
        required_fields = ['title', 'date', 'tags', 'description']
        missing_fields = [field for field in required_fields if field not in post.metadata]
        if missing_fields:
            raise ValueError(f"Missing required metadata fields: {', '.join(missing_fields)}")
        
        # Convert markdown to HTML
        html_content = markdown.markdown(
            post.content,
            extensions=['fenced_code', 'codehilite', 'tables', 'toc']
        )
        
        return {
            'metadata': post.metadata,
            'html_content': html_content,
            'id': md_file.stem
        }
    
    def generate_html_file(self, post_data: dict):
        """Generate an HTML file for the post."""
        template = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - Songtao Li</title>
    <link rel="stylesheet" href="../css/styles.css">
</head>
<body>
    <div id="navbar-placeholder"></div>
    <div class="container">
        <article class="post-full">
            <h1>{title}</h1>
            <div class="post-meta">
                <span class="post-date">{date}</span>
                <div class="post-tags">
                    {tags}
                </div>
            </div>
            <div class="post-content">
                {content}
            </div>
            <div class="post-navigation">
                <a href="#" onclick="navigateTo('posts')" class="back-to-posts">← Back to Posts</a>
            </div>
        </article>
    </div>
    <script src="../js/scripts.js"></script>
</body>
</html>
        """.strip()
        
        tags_html = ''.join(f'<span class="tag">{tag}</span>' for tag in post_data['metadata']['tags'])
        
        html_content = template.format(
            title=post_data['metadata']['title'],
            date=post_data['metadata']['date'],
            tags=tags_html,
            content=post_data['html_content']
        )
        
        output_file = self.posts_html_dir / f"{post_data['id']}.html"
        output_file.write_text(html_content, encoding='utf-8')
        
    def update_posts_list(self, all_posts: list):
        """Update the posts list in posts.html."""
        posts_html = self.components_dir / 'posts.html'
        
        # Sort posts by date (newest first)
        all_posts.sort(key=lambda x: datetime.strptime(x['metadata']['date'], '%B %Y'), reverse=True)
        
        posts_list_html = []
        for post in all_posts:
            meta = post['metadata']
            tags_html = ''.join(f'<span class="tag">{tag}</span>' for tag in meta['tags'])
            
            post_html = f"""
            <div class="post-item">
                <h2><a href="posts-html/{post['id']}.html">{meta['title']}</a></h2>
                <div class="post-meta">
                    <span class="post-date">{meta['date']}</span>
                    <span class="post-tags">
                        {tags_html}
                    </span>
                </div>
                <p class="post-description">
                    {meta['description']}
                </p>
            </div>
            """.strip()
            
            posts_list_html.append(post_html)
        
        template = f"""
<div class="container">
    <h1>Posts</h1>
    <div class="posts-list" id="posts-list">
        {os.linesep.join(posts_list_html)}
    </div>
</div>
        """.strip()
        
        posts_html.write_text(template, encoding='utf-8')
    
    def process_all_posts(self):
        """Process all markdown files in the posts directory."""
        all_posts = []
        
        for md_file in self.posts_dir.glob('*.md'):
            try:
                print(f"Processing {md_file.name}...")
                post_data = self.process_markdown(md_file)
                self.generate_html_file(post_data)
                all_posts.append(post_data)
            except Exception as e:
                print(f"Error processing {md_file.name}: {e}")
                continue
        
        if all_posts:
            self.update_posts_list(all_posts)
            print(f"Successfully processed {len(all_posts)} posts.")
        else:
            print("No posts found to process.")

if __name__ == '__main__':
    processor = PostProcessor()
    processor.process_all_posts() 