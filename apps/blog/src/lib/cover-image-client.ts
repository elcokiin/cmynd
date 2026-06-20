import { applyDominantColor } from './color-thief';
import { copyText, copyImage, downloadImage } from './clipboard';
import { getImageDimensions } from './image';

const FEEDBACK_DURATION = 2000;

function showFeedback(btn: Element | null, success = true) {
  if (!btn) return;
  const original = btn.innerHTML;
  btn.innerHTML = success
    ? '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>'
    : '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';
  setTimeout(() => { btn.innerHTML = original; }, FEEDBACK_DURATION);
}

export function initCoverImage() {
  const figure = document.querySelector<HTMLElement>('[data-color-thief]');
  if (!figure) return;

  const IMAGE_URL = figure.getAttribute('data-cover-url') || '';
  const PROMPT_TEXT = figure.getAttribute('data-prompt-text') || '';

  const img = document.querySelector<HTMLImageElement>('[data-color-thief-target]');
  if (img) {
    applyDominantColor(img);
  }

  const dimensionsEl = document.querySelector('[data-image-dimensions]');
  if (dimensionsEl && IMAGE_URL) {
    getImageDimensions(IMAGE_URL).then((dims) => {
      if (dims) {
        dimensionsEl.textContent = `${dims.width} × ${dims.height} px`;
      }
    });
  }

  const dismissOverlay = () => {
    figure.setAttribute('data-overlay-dismissed', '');
  };

  const restoreOverlay = () => {
    figure.removeAttribute('data-overlay-dismissed');
  };

  document.querySelector('[data-dismiss-overlay]')?.addEventListener('click', dismissOverlay);
  document.querySelector('[data-restore-overlay]')?.addEventListener('click', restoreOverlay);

  document.querySelector('[data-download]')?.addEventListener('click', async () => {
    const ok = Boolean(await downloadImage(IMAGE_URL));
    showFeedback(document.querySelector('[data-download]'), ok);
  });

  document.querySelector('[data-copy-image]')?.addEventListener('click', async () => {
    const ok = Boolean(await copyImage(IMAGE_URL));
    showFeedback(document.querySelector('[data-copy-image]'), ok);
  });

  document.querySelector('[data-copy-prompt]')?.addEventListener('click', async () => {
    if (!PROMPT_TEXT) return;
    const ok = await copyText(PROMPT_TEXT);
    if (ok) showFeedback(document.querySelector('[data-copy-prompt]'));
  });
}
