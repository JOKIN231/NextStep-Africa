// Thin wrapper around gtag.js (loaded directly in index.html <head>).
//
// Why this file exists at all: gtag's automatic pageview only fires once,
// on the initial script load. This app is a single-page app — switching
// between Home / Opportunities / Blog / Tracker never reloads the page or
// changes the URL, so without this, Analytics would only ever see one
// pageview no matter how much someone actually browses. trackPageView()
// is called on every tab change to send a proper "virtual pageview" for
// each section, and trackEvent() covers specific actions worth measuring
// (newsletter signups, apply-link clicks, article reads).

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

function gtagReady(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

export function trackPageView(path: string, title: string) {
  if (!gtagReady()) return;
  window.gtag('event', 'page_view', {
    page_title: title,
    page_path: path,
    page_location: window.location.href,
  });
}

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (!gtagReady()) return;
  window.gtag('event', eventName, params || {});
}
