# Performance Optimizations

This document explains the key factors that enable this Astro static site to achieve **100/100 Lighthouse scores** across Performance, Accessibility, Best Practices, and SEO.

## Architecture Decisions

### 1. Static Site Generation (SSG)
- **Astro** generates pure static HTML at build time
- Zero JavaScript shipped to the client by default
- Only View Transitions script (~6KB) for smooth page navigation
- No client-side hydration or framework runtime

### 2. Image Optimization

All images are automatically optimized at build time:

| Image Type | Dimensions | Format | Quality | Size |
|------------|-----------|--------|---------|------|
| Hero images (blog posts) | 800×400 | WebP | 70% | 42-69 KB |
| Thumbnails (post cards) | 256×200 (2x retina) | WebP | 80% | 11-15 KB |
| Profile picture | 320×320 / 352×352 (2x retina) | WebP | 85% | 18-20 KB |

**Key techniques:**
- **2x resolution for retina displays** - Prevents blurry images on high-DPI screens
- **WebP format** - 25-35% smaller than JPEG at equivalent quality
- **Aggressive compression** - Quality 70-85% is visually identical to 100%
- **Lazy loading** - Thumbnails use `loading="lazy"` to defer off-screen images
- **Eager loading with fetchpriority** - LCP images use `loading="eager"` + `fetchpriority="high"`
- **Sync decoding for LCP** - Critical images use `decoding="sync"` to prevent paint delays

### 3. Font Loading

```javascript
// Fonts bundled locally instead of Google Fonts CDN
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono'; // Only on blog post pages
```

- **Self-hosted variable fonts** - Eliminates third-party request latency
- **Single font file per family** - Variable fonts vs multiple weight files
- **Code font loaded conditionally** - JetBrains Mono only imported in BlogPost layout

### 4. CSS Strategy

- **Tailwind CSS v4** with Vite plugin for optimal tree-shaking
- **No unused CSS** - Only classes actually used are included
- **Critical CSS inlined** - Astro automatically inlines critical styles
- **Single CSS bundle** - Reduces HTTP requests

### 5. JavaScript Minimization

```html
<!-- Only scripts on the site -->
<script defer src="analytics.js"></script>  <!-- Deferred analytics -->
<ViewTransitions />                          <!-- ~6KB for smooth navigation -->
```

- **No framework JavaScript** - No React/Vue/Svelte runtime
- **Analytics deferred** - Uses `defer` attribute
- **View Transitions API** - Native browser feature, minimal JS wrapper

### 6. HTML Optimization

- **Semantic HTML** - Proper heading hierarchy, landmarks
- **Explicit dimensions** - All images have width/height to prevent CLS
- **Preconnect hints** - For analytics domain
- **Meta tags** - Complete Open Graph and Twitter Card support

## Lighthouse Score Breakdown

### Performance (100)
- **FCP < 1.0s** - Fast first paint due to static HTML + inlined critical CSS
- **LCP < 1.5s** - Hero images preloaded with `fetchpriority="high"`
- **TBT = 0ms** - No long JavaScript tasks
- **CLS = 0** - All elements have explicit dimensions

### Accessibility (100)
- Semantic HTML structure
- Proper heading hierarchy
- Color contrast meets WCAG AA
- Focus states on all interactive elements
- Alt text on all images

### Best Practices (100)
- HTTPS everywhere
- No deprecated APIs
- Correct image aspect ratios
- No browser errors

### SEO (100)
- Meta descriptions on all pages
- Canonical URLs
- Sitemap.xml
- robots.txt
- Structured data (JSON-LD on blog posts)
- Mobile-friendly viewport

## Known Limitations

### GitHub Pages Cache Headers
GitHub Pages sets `Cache-Control: max-age=600` (10 minutes) for all assets. This means:
- Repeat visitors may re-download assets after 10 minutes
- Cannot be changed without a CDN in front (e.g., Cloudflare)

**Mitigation:** Assets have content hashes in filenames, so browsers can use cached versions indefinitely when URLs don't change.

### Render-Blocking CSS
The main CSS file is render-blocking (~10KB). This is acceptable because:
- File is small and loads quickly
- Prevents FOUC (Flash of Unstyled Content)
- Inlining would increase HTML size for every page

## Image Optimization Checklist

When adding new images:

1. **Source images** - Place in `src/assets/images/`
2. **Use Astro's Image component** - Gets automatic WebP conversion
3. **Set appropriate dimensions:**
   - Hero images: 800×400 minimum
   - Thumbnails: 256×200 (displayed at 128×100)
   - Profile pics: 320×320+ (displayed at 160×160)
4. **Choose loading strategy:**
   - Above fold: `loading="eager"` + `fetchpriority="high"` + `decoding="sync"`
   - Below fold: `loading="lazy"` + `decoding="async"`

## Build Output

Typical build generates:
- 16 HTML pages (~5KB each gzipped)
- 1 CSS file (~10KB gzipped)
- 1 JS file (~6KB gzipped for View Transitions)
- 8-12 optimized images (10-70KB each)

**Total site size: ~400KB** (excluding images that lazy load)
