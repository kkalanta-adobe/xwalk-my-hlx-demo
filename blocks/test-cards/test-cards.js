export default function decorate(block) {
  /* get the first and only cell from each row */
  const cells = [...block.children].map((row) => row.firstElementChild);
  block.textContent = '';

  /* create list */
  const ul = document.createElement('ul');
  cells.forEach((cell) => {
    const li = document.createElement('li');
    li.innerHTML = cell.innerHTML;
    ul.append(li);
  });

  ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(img));
  block.append(ul);
}


