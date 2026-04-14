import { Page } from '@playwright/test';

/**
 * Injects a fake grecaptcha global before the page loads so that
 * useRecaptchaV3 never hits the real Google network and always returns
 * a deterministic token string.
 *
 * Call this inside a test's beforeEach via:
 *   test.beforeEach(async ({ page }) => { await stubRecaptcha(page); });
 *
 * It must be called BEFORE page.goto() so that addInitScript fires in time.
 */
export async function stubRecaptcha(page: Page): Promise<void> {
  await page.addInitScript(() => {
    // Provide the site key env var that useRecaptchaV3 checks
    // (Next.js inlines NEXT_PUBLIC_ vars at build time, but we also need the
    //  runtime check to pass when the dev server replaces it with an empty string)
    Object.defineProperty(window, '__NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY__', {
      value: 'test-site-key',
      writable: true,
    });

    // Stub the grecaptcha global that useRecaptchaV3 looks for
    (window as any).grecaptcha = {
      ready: (cb: () => void) => cb(),
      execute: (_siteKey: string, _opts: { action: string }) =>
        Promise.resolve('fake-recaptcha-token'),
    };
  });

  // Also stub the env variable access path used by the hook at module level
  await page.addInitScript(() => {
    // Override the script injection so it never actually fetches the Google URL
    const origCreateElement = document.createElement.bind(document);
    (document as any).createElement = (tag: string, ...args: any[]) => {
      const el = origCreateElement(tag, ...args);
      if (tag === 'script') {
        Object.defineProperty(el, 'src', {
          set(val: string) {
            if (val.includes('recaptcha')) {
              // Don't actually load the real script – fire onload immediately
              setTimeout(() => {
                if (typeof (el as any).onload === 'function') {
                  (el as any).onload();
                }
              }, 0);
            } else {
              (el as any)._src = val;
            }
          },
          get() {
            return (el as any)._src ?? '';
          },
        });
      }
      return el;
    };
  });
}
