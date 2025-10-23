// Hardcoded GraphQL endpoint for blog articles
const BLOG_ARTICLES_API = 'https://publish-p93652-e1432935.adobeaemcloud.com/graphql/execute.json/aem-demo-assets/getBlogArticles';

/**
 * Parse tags from the new format (e.g., "blog:Design" -> "Design")
 */
function parseTags(tags) {
  if (!Array.isArray(tags)) return [];
  
  return tags.map((tag) => {
    // Tags come as "blog:CategoryName" or just "CategoryName"
    const parts = tag.split(':');
    const text = parts.length > 1 ? parts[1] : parts[0];
    const color = text.toLowerCase().replace(/\s+/g, '-');
    return { text, color };
  });
}

/**
 * Extract excerpt from markdown body (first 200 chars)
 */
function extractExcerpt(markdown, maxLength = 200) {
  if (!markdown) return '';
  // Remove markdown formatting and take first N characters
  const plainText = markdown.replace(/[#*_`\[\]]/g, '').trim();
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength).trim() + '...';
}

/**
 * Map GraphQL response item to article format
 */
function mapArticleData(item) {
  return {
    image: item.heroImage || '',
    date: item.publishedDate || '',
    title: item.title || '',
    excerpt: extractExcerpt(item.body?.markdown || ''),
    link: item._path || '',
    tags: parseTags(item.tags || []),
    author: item.author || '',
    category: item.category || '',
    readingTime: item.readingTimeMinutes || 0,
  };
}

/**
 * Fetch blog articles from GraphQL endpoint
 */
async function fetchBlogArticles() {
  return fetch(BLOG_ARTICLES_API)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      return {};
    })
    .then(json => {
      const data = [...json.data.blogArticleList.items];
      console.log(data);
      return data;
    })
    .catch(error => {
      console.error('Error fetching blog articles:', error);
      return [];
    });
}

/**
 * Create an article card element
 */
function createArticleCard(article, isFeatured = false, isHorizontal = false) {
  const card = document.createElement('article');
  card.className = `blog-card ${isFeatured ? 'featured' : ''} ${isHorizontal ? 'horizontal' : ''}`;

  const link = document.createElement('a');
  link.href = article.link;
  link.className = 'blog-card-link';

  const img = document.createElement('img');
  img.src = article.image;
  img.alt = article.title;
  img.className = 'blog-image';
  img.loading = 'lazy';

  const content = document.createElement('div');
  content.className = 'blog-content';

  const date = document.createElement('time');
  date.className = 'blog-date';
  date.textContent = article.date;

  const header = document.createElement('div');
  header.className = 'blog-header';

  const title = document.createElement('h3');
  title.className = isHorizontal ? 'blog-title small' : 'blog-title';
  title.textContent = article.title;

  const arrow = document.createElement('svg');
  arrow.setAttribute('width', '24');
  arrow.setAttribute('height', '24');
  arrow.setAttribute('viewBox', '0 0 24 24');
  arrow.setAttribute('fill', 'none');
  arrow.setAttribute('stroke', 'currentColor');
  arrow.setAttribute('stroke-width', '2');
  arrow.className = 'arrow-icon';
  arrow.innerHTML = `
    <line x1="7" y1="17" x2="17" y2="7"></line>
    <polyline points="7 7 17 7 17 17"></polyline>
  `;

  header.appendChild(title);
  header.appendChild(arrow);

  const excerpt = document.createElement('p');
  excerpt.className = 'blog-excerpt';
  excerpt.textContent = article.excerpt;

  const tagsContainer = document.createElement('div');
  tagsContainer.className = 'blog-tags';

  article.tags.forEach((tag) => {
    const span = document.createElement('span');
    span.className = `tag tag-${tag.color}`;
    span.textContent = tag.text;
    tagsContainer.appendChild(span);
  });

  content.appendChild(date);
  content.appendChild(header);
  content.appendChild(excerpt);
  content.appendChild(tagsContainer);

  link.appendChild(img);
  link.appendChild(content);
  card.appendChild(link);

  return card;
}

/**
 * Render the article list hero block
 */
function renderArticleListHero(block, title, articles) {
  const container = document.createElement('div');
  container.className = 'container';

  const sectionTitle = document.createElement('h2');
  sectionTitle.className = 'section-title';
  sectionTitle.textContent = title;

  const grid = document.createElement('div');
  grid.className = 'blog-grid';
  // Add featured article (first item)
  if (articles.length > 0) {
    grid.appendChild(createArticleCard(articles[0], true, false));
  }

  // Add remaining articles in a column (indices 1..)
  if (articles.length > 1) {
    const column = document.createElement('div');
    column.className = 'blog-column';

    articles.slice(1).forEach((article) => {
      column.appendChild(createArticleCard(article, false, true));
    });

    grid.appendChild(column);
  }

  container.appendChild(sectionTitle);
  container.appendChild(grid);
  block.innerHTML = '';
  block.appendChild(container);
}

/**
 * Main decorate function
 */
export default async function decorate(block) {
  // Extract only the title from block (single field)
  const titleEl = block.firstElementChild;
  const title = titleEl?.textContent.trim() || 'Recent blog posts';

  // Show loading state
  block.innerHTML = '<div class="loading">Loading articles...</div>';

  // Fetch blog articles from hardcoded endpoint
  const items = await fetchBlogArticles();
  
  if (items.length === 0) {
    block.innerHTML = '<div class="error">No articles found</div>';
    return;
  }

  // Take only first 3 items and map to article format
  const articles = items.slice(0, 3).map(mapArticleData);

  // Render the block
  renderArticleListHero(block, title, articles);
}
