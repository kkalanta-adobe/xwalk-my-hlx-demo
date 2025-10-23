function parseTags(tagsText) {
  if (!tagsText) return [];
  const tags = [];
  const tagPairs = tagsText.split(',').map((t) => t.trim());
  tagPairs.forEach((pair) => {
    const [text, color] = pair.split('|').map((p) => p.trim());
    if (text && color) {
      tags.push({ text, color: color.toLowerCase() });
    }
  });
  return tags;
}

export default function decorate(block) {
  // Destructure fields based on model order: image, date, title, excerpt, link, tags
  const [imageEl, dateEl, titleEl, excerptEl, linkField, tagsEl] = [...block.children];

  // Extract values from each field element
  const article = {
    image: imageEl?.querySelector('img')?.src || imageEl?.textContent.trim() || '',
    date: dateEl?.textContent.trim() || '',
    title: titleEl?.textContent.trim() || '',
    excerpt: excerptEl?.textContent.trim() || '',
    link: linkField?.querySelector('a')?.href || linkField?.textContent.trim() || '',
    tags: parseTags(tagsEl?.textContent.trim() || ''),
  };

  if (!article.title) return;

  // Create structure while preserving editable elements
  const container = document.createElement('div');
  container.className = 'container';

  const card = document.createElement('article');
  card.className = 'blog-card';

  const linkEl = document.createElement('a');
  linkEl.href = article.link;
  linkEl.className = 'blog-card-link';

  // Move image element to preserve editability
  const imageContainer = document.createElement('div');
  imageContainer.className = 'blog-image-container';
  if (imageEl?.querySelector('img') || imageEl?.querySelector('picture')) {
    const imgContent = imageEl.querySelector('picture') || imageEl.querySelector('img');
    if (imgContent) {
      const img = imgContent.tagName === 'PICTURE' ? imgContent.querySelector('img') : imgContent;
      img.className = 'blog-image';
      img.alt = article.title;
      imageContainer.appendChild(imgContent);
    }
  } else if (article.image) {
    const img = document.createElement('img');
    img.src = article.image;
    img.alt = article.title;
    img.className = 'blog-image';
    imageContainer.appendChild(img);
  }

  const content = document.createElement('div');
  content.className = 'blog-content';

  // Wrap date element to preserve editability
  const dateWrapper = document.createElement('time');
  dateWrapper.className = 'blog-date';
  if (dateEl) {
    while (dateEl.firstChild) {
      dateWrapper.appendChild(dateEl.firstChild);
    }
  } else {
    dateWrapper.textContent = article.date;
  }

  const header = document.createElement('div');
  header.className = 'blog-header';

  // Wrap title element to preserve editability
  const titleWrapper = document.createElement('h3');
  titleWrapper.className = 'blog-title';
  if (titleEl) {
    while (titleEl.firstChild) {
      titleWrapper.appendChild(titleEl.firstChild);
    }
  } else {
    titleWrapper.textContent = article.title;
  }

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

  header.appendChild(titleWrapper);
  header.appendChild(arrow);

  // Wrap excerpt element to preserve editability
  const excerptWrapper = document.createElement('p');
  excerptWrapper.className = 'blog-excerpt';
  if (excerptEl) {
    while (excerptEl.firstChild) {
      excerptWrapper.appendChild(excerptEl.firstChild);
    }
  } else {
    excerptWrapper.textContent = article.excerpt;
  }

  const tagsContainer = document.createElement('div');
  tagsContainer.className = 'blog-tags';

  article.tags.forEach((tag) => {
    const span = document.createElement('span');
    span.className = `tag tag-${tag.color}`;
    span.textContent = tag.text;
    tagsContainer.appendChild(span);
  });

  content.appendChild(dateWrapper);
  content.appendChild(header);
  content.appendChild(excerptWrapper);
  content.appendChild(tagsContainer);

  linkEl.appendChild(imageContainer);
  linkEl.appendChild(content);
  card.appendChild(linkEl);
  container.appendChild(card);

  // Clear block and append new structure
  block.innerHTML = '';
  block.appendChild(container);
}

