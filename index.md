---
layout: default
title: Home
---

{% comment %} Collect all unique tags {% endcomment %}
{% assign all_tags = "" | split: "" %}
{% for post in site.essays %}
  {% for tag in post.tags %}
    {% unless all_tags contains tag %}
      {% assign all_tags = all_tags | push: tag %}
    {% endunless %}
  {% endfor %}
{% endfor %}
{% assign all_tags = all_tags | sort %}

{% if all_tags.size > 0 %}
<div class="tag-filter">
  <button class="tag-btn active" data-tag="all">All</button>
  {% for tag in all_tags %}
  <button class="tag-btn" data-tag="{{ tag | slugify }}">{{ tag }}</button>
  {% endfor %}
</div>
{% endif %}

<div class="posts-list">
  {% for post in site.essays reversed %}
    <article class="post-item" data-tags="{% for tag in post.tags %}{{ tag | slugify }}{% unless forloop.last %} {% endunless %}{% endfor %}">
      <h3>
        <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      </h3>
    </article>
  {% endfor %}
</div>

<style>
.tag-filter {
    margin-bottom: 1.5rem;
}

.tag-btn {
    background: none;
    border: none;
    font-size: 0.875rem;
    color: var(--text-muted);
    cursor: pointer;
    padding: 0;
    margin-right: 1rem;
    font-family: inherit;
}

.tag-btn:hover {
    color: var(--text-color);
}

.tag-btn.active {
    color: var(--text-color);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 3px;
}

.post-item {
    margin-bottom: 0.75rem;
}

.post-item.hidden {
    display: none;
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.tag-btn');
    const posts = document.querySelectorAll('.post-item');

    // Check URL for tag parameter
    const urlParams = new URLSearchParams(window.location.search);
    const tagFromUrl = urlParams.get('tag');

    function filterPosts(tag) {
        posts.forEach(post => {
            const postTags = post.dataset.tags.split(' ');
            if (tag === 'all' || postTags.includes(tag)) {
                post.classList.remove('hidden');
            } else {
                post.classList.add('hidden');
            }
        });

        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tag === tag);
        });
    }

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const tag = this.dataset.tag;
            filterPosts(tag);

            // Update URL without reload
            if (tag === 'all') {
                history.replaceState(null, '', window.location.pathname);
            } else {
                history.replaceState(null, '', '?tag=' + tag);
            }
        });
    });

    // Apply filter from URL on page load
    if (tagFromUrl) {
        filterPosts(tagFromUrl);
    }
});
</script>
