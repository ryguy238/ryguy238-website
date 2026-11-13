// Set these paths to the original thumbnails, optional preview clips, and full videos.
const experiments = {
  skittles: { thumbnail: '', preview: '', video: '' },
  oreos: { thumbnail: '', preview: '', video: '' },
  mms: { thumbnail: '', preview: '', video: '' },
};
const partnershipEmail = 'ryguy238.business@gmail.com';

const dialog = document.querySelector('#player');
const player = dialog.querySelector('video');
const mediaStatus = document.querySelector('#media-status');
const hoverAllowed = matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)');

for (const card of document.querySelectorAll('.card[data-experiment]')) {
  const media = experiments[card.dataset.experiment];
  const cover = card.querySelector('.cover');
  const playIcon = cover.querySelector('.play');

  if (media.thumbnail) {
    const thumbnail = new Image();
    thumbnail.alt = '';
    thumbnail.loading = 'lazy';
    thumbnail.src = media.thumbnail;
    thumbnail.addEventListener('error', () => thumbnail.remove());
    cover.insertBefore(thumbnail, playIcon);
  }

  const previewSource = media.preview || media.video;
  if (previewSource) {
    const preview = document.createElement('video');
    preview.preload = 'none';
    preview.muted = true;
    preview.playsInline = true;
    preview.loop = true;
    preview.setAttribute('aria-hidden', 'true');
    cover.insertBefore(preview, playIcon);

    const stopPreview = () => {
      preview.pause();
      preview.classList.remove('playing');
    };
    preview.addEventListener('playing', () => preview.classList.add('playing'));
    preview.addEventListener('error', stopPreview);
    card.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'touch' || !hoverAllowed.matches || dialog.open) return;
      if (!preview.hasAttribute('src')) preview.src = previewSource;
      preview.play().catch(stopPreview);
    });
    card.addEventListener('pointerleave', stopPreview);
    card.addEventListener('click', stopPreview);
    hoverAllowed.addEventListener('change', stopPreview);
  }

  card.addEventListener('click', () => {
    document.querySelector('#player-title').textContent = card.querySelector('.caption').textContent;
    mediaStatus.textContent = media.video ? '' : 'The experiment video is coming soon.';
    player.hidden = !media.video;
    dialog.showModal();
    if (media.video) {
      player.poster = media.thumbnail;
      player.src = media.video;
      player.play().catch(() => {});
    }
  });
}

player.addEventListener('error', () => {
  if (!dialog.open) return;
  player.hidden = true;
  mediaStatus.textContent = 'This video could not be loaded.';
});
dialog.addEventListener('close', () => {
  player.pause();
  player.removeAttribute('src');
  player.load();
});

if (partnershipEmail) {
  const form = document.querySelector('#partnership-form');
  form.querySelector('button').disabled = false;
  document.querySelector('#email-status').textContent = 'Opens a draft in your email app for you to review and send.';
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = new FormData(form);
    const subject = encodeURIComponent('RYGUY238 partnership inquiry');
    const body = encodeURIComponent([
      'Collaboration type: ' + fields.get('type'),
      'Company: ' + fields.get('company'),
      'Product: ' + fields.get('product'),
      '',
      fields.get('brief'),
    ].join('\n'));
    window.location.href = 'mailto:' + partnershipEmail + '?subject=' + subject + '&body=' + body;
  });
}

const header = document.querySelector('.top');
const sectionLinks = [...header.querySelectorAll('nav a:not(.cta)')];
const sections = sectionLinks.map((link) => document.querySelector(link.hash));

function updateCurrentSection() {
  const readingLine = header.getBoundingClientRect().bottom + 100;
  let current = 0;
  for (let index = 1; index < sections.length; index++) {
    if (sections[index].getBoundingClientRect().top <= readingLine) current = index;
  }

  const pageHeight = document.documentElement.scrollHeight;
  if (window.scrollY > 0 && window.scrollY + window.innerHeight >= pageHeight - 2) {
    current = sections.length - 1;
  }

  sectionLinks.forEach((link, index) => {
    if (index === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

window.addEventListener('scroll', updateCurrentSection, { passive: true });
window.addEventListener('resize', updateCurrentSection);
window.addEventListener('pageshow', updateCurrentSection);
updateCurrentSection();
