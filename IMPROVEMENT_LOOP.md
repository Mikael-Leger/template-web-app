# Project Improvement Loop Guide

This document serves as an automated improvement guide for the `template-web-app` project. Follow the iterative process below to systematically upgrade, debug, and enhance the application.

---

## Instructions for Claude

**IMPORTANT:** You are authorized to auto-compact and continue working autonomously for up to **7 iterations**. Each iteration should:

1. **Identify** an issue, bug, or missing feature
2. **Implement** the fix or feature
3. **Verify** by running the application (`npm run dev`) and testing
4. **Document** what was done in the Progress Log below
5. **Continue** to the next iteration

**After each iteration**, update the Progress Log section and mark items as completed.

---

## Current Project State

- **Framework:** Next.js 15.1.6 with React 19, TypeScript 5
- **Styling:** Tailwind CSS + SCSS
- **State:** React Context API (6 providers)
- **Animations:** GSAP with ScrollTrigger
- **Port:** Runs on port 4000 (`npm run dev`)

---

## Phase 1: Bug Fixes (Priority: HIGH)

### Bug 1: API Error Handling in `getDistance.js`
- **Location:** `pages/api/getDistance.js:24`
- **Issue:** On error, the function returns nothing instead of a proper error response
- **Fix Required:** Add proper error response with status code and message
- **Verification:** Test the API route with invalid coordinates

### Bug 2: Language Support Mismatch
- **Location:** `src/app/contexts/language-context.tsx` vs `src/app/data/languages.json`
- **Issue:** `languages.json` lists FR/EN/NL but context only supports 'en' and 'baguette' (French)
- **Fix Required:** Either add NL support or remove it from languages.json for consistency
- **Verification:** Check language switching functionality

### Bug 3: React Strict Mode Disabled
- **Location:** `next.config.ts`
- **Issue:** `reactStrictMode: false` may mask development issues
- **Fix Required:** Enable strict mode and fix any double-render issues that appear
- **Verification:** Run the app and check console for warnings

### Bug 4: Missing Error Boundaries
- **Location:** Global application level
- **Issue:** No error boundary components exist - unhandled errors crash the app
- **Fix Required:** Add ErrorBoundary component wrapping critical sections
- **Verification:** Test error handling by simulating component errors

---

## Phase 2: Code Quality Improvements (Priority: MEDIUM)

### Issue 1: Mixed Router Patterns
- **Current State:** Using App Router (src/app) + Pages Router (pages/api)
- **Action:** Consider migrating API routes to App Router route handlers (src/app/api)
- **Files Affected:** `pages/api/fetchAddress.js`, `pages/api/getDistance.js`

### Issue 2: Large Component Files
- **Files to Review:**
  - `src/app/components/Navbar.tsx` - Consider splitting
  - `src/app/components/Checkout.tsx` - Consider splitting
  - `src/app/page.tsx` (628 lines) - Consider component extraction

### Issue 3: TypeScript Improvements
- Review any `any` types and replace with proper typing
- Ensure all props interfaces are comprehensive
- Add return types to all functions

---

## Phase 3: Vital Features to Add (Priority: HIGH)

### Feature 1: Error Boundary Component
```typescript
// Create: src/app/components/ErrorBoundary.tsx
// Wrap critical routes/components
// Include fallback UI and error logging
```

### Feature 2: Loading States Enhancement
- Add skeleton loaders for product lists
- Improve loading feedback during API calls
- Add loading state for image components

### Feature 3: Accessibility (a11y) Improvements
- Add ARIA labels to interactive elements
- Ensure proper heading hierarchy
- Add keyboard navigation support
- Include focus indicators
- Add skip-to-content link

### Feature 4: SEO Optimization
- Add metadata to all pages
- Create dynamic OG images
- Add structured data (JSON-LD)
- Create robots.txt and sitemap.xml

### Feature 5: Form Validation Enhancement
- Add real-time validation feedback
- Improve error messages
- Add form submission states

---

## Phase 4: Testing Setup (Priority: MEDIUM)

### Setup Required:
1. Install Jest/Vitest and React Testing Library
2. Create test configuration
3. Add basic component tests
4. Add API route tests
5. Setup CI pipeline (optional)

```bash
# Suggested packages:
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

---

## Phase 5: Performance Optimization (Priority: LOW)

### Areas to Optimize:
1. **Bundle Analysis:** Check GSAP bundle size impact
2. **Image Optimization:** Verify Next.js Image component usage
3. **Code Splitting:** Ensure proper lazy loading
4. **Font Loading:** Optimize Google Fonts loading strategy

---

## Potential Future Features List

### E-Commerce Enhancements
- [ ] User authentication system
- [ ] User account/profile pages
- [ ] Order history
- [ ] Wishlist functionality
- [ ] Product reviews and ratings
- [ ] Inventory management
- [ ] Discount codes/coupons
- [ ] Payment gateway integration (Stripe/PayPal)

### Technical Features
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Headless CMS integration (Contentful/Sanity)
- [ ] PWA support (offline mode, install prompt)
- [ ] Real-time notifications
- [ ] Email service integration
- [ ] Analytics dashboard
- [ ] Admin panel

### UI/UX Features
- [ ] Dark mode support
- [ ] Theme customization
- [ ] Advanced product filtering
- [ ] Product comparison
- [ ] Quick view modal
- [ ] Recently viewed products
- [ ] Product recommendations

### Internationalization
- [ ] Complete Dutch (NL) language support
- [ ] Currency conversion
- [ ] Region-specific pricing
- [ ] RTL language support

### DevOps & Infrastructure
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Automated testing in pipeline
- [ ] Staging environment
- [ ] Performance monitoring
- [ ] Error tracking (Sentry)

---

## Progress Log

Track completed iterations below:

### Iteration 1
- **Date:** 2026-02-02
- **Focus:** API Error Handling Bug Fix
- **Changes Made:** Fixed `pages/api/getDistance.js` - Added proper error responses with status codes (400 for invalid addresses, 500 for distance calculation failures) instead of returning nothing
- **Verification Status:** [x] Passed / [ ] Failed
- **Notes:** API now returns meaningful error messages to the client

### Iteration 2
- **Date:** 2026-02-02
- **Focus:** Language Support Mismatch Fix
- **Changes Made:**
  - Updated `languages.json` to use 'baguette' instead of 'fr' (matching internal naming convention)
  - Removed unsupported NL language option
  - Fixed `navbar.tsx` to use global LanguageContext instead of local state
  - Updated `language.interface.ts` to use proper LanguageType
- **Verification Status:** [x] Passed / [ ] Failed
- **Notes:** Language switching now uses global context consistently

### Iteration 3
- **Date:** 2026-02-02
- **Focus:** Enable React Strict Mode
- **Changes Made:** Changed `reactStrictMode: false` to `reactStrictMode: true` in `next.config.ts`
- **Verification Status:** [x] Passed / [ ] Failed
- **Notes:** No double-render issues detected

### Iteration 4
- **Date:** 2026-02-02
- **Focus:** Error Boundary Component
- **Changes Made:**
  - Created `src/app/components/error-boundary/error-boundary.tsx` - Class component with fallback UI
  - Created `src/app/components/error-boundary/error-boundary.scss` - Styling
  - Integrated ErrorBoundary in `layout.tsx` wrapping PageContent
- **Verification Status:** [x] Passed / [ ] Failed
- **Notes:** App now gracefully handles component errors with retry functionality

### Iteration 5
- **Date:** 2026-02-02
- **Focus:** Accessibility Improvements
- **Changes Made:**
  - Added skip-to-content link in `layout.tsx` with styling in `globals.scss`
  - Updated `page-content.tsx` to use semantic `<main>` element with `id="main-content"` and `role="main"`
  - Added `ariaLabel` prop support to Button component interface and implementation
  - Added `aria-disabled` attribute to Button component
- **Verification Status:** [x] Passed / [ ] Failed
- **Notes:** Keyboard navigation improved, screen reader support enhanced

### Iteration 6
- **Date:** 2026-02-02
- **Focus:** SEO Metadata Enhancement
- **Changes Made:**
  - Enhanced root `layout.tsx` metadata with title template, keywords, OpenGraph, and Twitter cards
  - Created `products/layout.tsx` with page-specific metadata
  - Created `contact/layout.tsx` with page-specific metadata
  - Created `order/layout.tsx` with page-specific metadata
  - Added `public/robots.txt` for search engine crawling
- **Verification Status:** [x] Passed / [ ] Failed
- **Notes:** All pages now have proper SEO metadata with title templates working (e.g., "Products | Template Web App")

### Iteration 7
- **Date:** 2026-02-02
- **Focus:** Verification, Testing & Build
- **Changes Made:**
  - Started dev server on port 4000
  - Verified homepage loads with correct title and skip-to-content link
  - Verified products page loads with correct title template
  - Checked console for errors - none found
  - Fixed pre-existing ESLint issues:
    - Converted empty interfaces to type aliases (delivery.tsx, payment.tsx, products-list.tsx)
    - Removed empty props interface in loading.tsx
    - Fixed ESLint semi rule issue in language-text.interface.ts
  - **Successfully ran `npm run build`** - all pages compile correctly
- **Verification Status:** [x] Passed / [ ] Failed
- **Notes:** All improvements verified working. Production build successful with static pages generated.

---

## Commands Reference

```bash
# Development
npm run dev        # Start dev server on port 4000

# Build
npm run build      # Production build
npm run start      # Start production server

# Linting
npm run lint       # Run ESLint

# Testing (after setup)
npm test           # Run tests
npm run test:watch # Watch mode
```

---

## Files Quick Reference

| Category | Path |
|----------|------|
| Main Layout | `src/app/layout.tsx` |
| Homepage | `src/app/page.tsx` |
| Components | `src/app/components/` |
| Contexts | `src/app/contexts/` |
| API Routes | `pages/api/` |
| Interfaces | `src/app/interfaces/` |
| Data/JSON | `src/app/data/` |
| Global Styles | `src/app/globals.scss` |
| Config | `next.config.ts`, `tailwind.config.ts` |

---

## Execution Command

To start the improvement loop, run:

```
Claude, please read IMPROVEMENT_LOOP.md and execute the improvement iterations.
Start with Phase 1 bugs, verify fixes by running the app, then proceed through
the phases. Update the Progress Log after each iteration. You have authorization
to auto-compact and continue for up to 100 iterations.
```

---

## Project Vision & Context

**This project is a template/page builder application.** The goal is to give users the ability to manage each page and component as they wish, creating a flexible, customizable web experience.

### Core Features Needed

#### 1. Visual Layout Editor
- Sidebar panel showing all available components
- Drag-and-drop interface for adding components to pages
- Ability to reorder/move components within a page
- Delete components from pages
- Component configuration options (props, styling)

#### 2. Page Management System
- Create new pages
- Edit existing pages
- Delete pages
- Set page metadata (title, description, URL slug)
- Manage page hierarchy/navigation

#### 3. Component Library
Available components for users to add:
- Banner/Hero sections
- Text blocks
- Image galleries
- Product listings
- Contact forms
- Testimonials
- Newsletter signup
- Custom HTML/code blocks
- Navigation elements
- Footer variants

#### 4. Design System Modernization
- Modern, clean UI aesthetic
- Consistent spacing and typography
- Smooth animations and transitions
- Dark mode support
- Mobile-responsive editor interface

### Technical Approach
- Store page configurations in JSON (or database in future)
- Use React DnD or similar for drag-and-drop
- Create an "edit mode" toggle to switch between preview and edit views
- Component registry pattern for extensibility

---

*Last Updated: 2026-02-02*
*Project: template-web-app*
