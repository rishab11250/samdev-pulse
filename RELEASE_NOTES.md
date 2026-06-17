# Release Notes: Pulse v2.0: The Polyglot & Visual Fusion Release

We are excited to announce the release of **samdev-pulse v2.0.0**! Since the release of `v1.5.0`, the project has undergone substantial growth with **224 commits**, introducing robust multi-platform capabilities, enhanced design options, optimized performance, and solid security features.

---

## 📊 Release Statistics

- **Total Commits**: 224
- **Files Touched**: 89 files
- **Line Modifications**:
  - **With lockfiles & snapshots**: 28,884 insertions (+), 1,170 deletions (-)
  - **Core Codebase (excluding lockfiles & snapshots)**: 12,026 insertions (+), 758 deletions (-)

---

## 🚀 Key Features Added (Comprehensive List)

1. **Codeforces Stats Integration**: Real-time stats retrieval for Codeforces users including rank, rating, and solved problems count.
2. **CodeChef Stats Integration**: Real-time stats retrieval for CodeChef users including rating, stars, division, and global rank.
3. **Adaptive Competitive Programming (CP) Card Layout**: A dynamic grid section for CP platforms that auto-adjusts layout spacing and sizing based on which platforms are enabled.
4. **Interactive Theme Preview Gallery**: A beautiful visual showcase gallery on the landing page showing how themes look.
5. **Theme Search Filter & Category Chips**: A searchable and filterable gallery with category chips and a "Show More" option to easily locate themes.
6. **Autocomplete Suggestions for Themes**: Auto-suggest suggestions list while searching for themes.
7. **Interactive Clickable Theme Cards**: Clickable gallery cards that auto-select theme dropdown configs and scroll the page down directly to the live preview.
8. **Dynamic Custom Themes via URL**: Ability to define custom themes on-the-fly using query parameters directly in the request URL.
9. **Domain-Specific Developer Persona Themes**: Handcrafted profile themes tailored for specific engineering domains (e.g. AI/ML, Game Dev, Web Dev, Mobile/Android Studio).
10. **Interactive Landing Page Navbar**: A header navbar with smooth section scroll transitions.
11. **Mobile Hamburger Menu**: Fully responsive navigation menu for small-screen users.
12. **Navbar Animated Underline Transitions**: Sleek micro-animations added to landing page navbar links.
13. **Light/Dark Mode Theme Toggle**: Ability to toggle the entire application landing page between dark and light modes.
14. **Smooth Scroll-to-Top Button**: Floating UI button for easy back-to-top page navigation.
15. **Live Loading Spinner Indicator**: A modern loading overlay that displays while fetching and rendering dashboard previews.
16. **Dashboard Form Reset**: Dedicated button to instantly clear/reset user configuration inputs in the dashboard.
17. **Quick Start Guide Copy Buttons**: One-click copy buttons in the integration guide to copy Markdown snippets.
18. **Download PNG & SVG Buttons**: Added dedicated download buttons to save generated SVGs or convert and download them to PNG files.
19. **Trophy Customization Controls**: Added a `hide_trophies` configuration parameter to specify which cards to hide, fully integrated with the docs and dashboard generator UI.
20. **Pull Request Reviews Trophy**: A new trophy metric counting PRs reviewed by the user.
21. **Semantic SVG Accessibility (A11y)**: Built-in screen reader support, descriptions, roles, and accessible labels for all generated dashboard SVGs.
22. **Graceful Failures with Error SVGs**: Returns clean, styled Error SVG cards when external APIs fail rather than failing the request or returning empty pages.
23. **Theme Comparison Board**: A side-by-side theme explorer preview at `/theme-comparison.html` that lets developers check how various themes render their stats.

---

## 🔒 Security & Reliability

- **Content Security Policy (CSP)**: Fully implemented CSP headers and input hardening on endpoints.
- **Query Validation & Normalization**: Centralized input sanitization and strict validation regex rules (preventing consecutive hyphens, etc.) to defend against injection and ReDoS vulnerabilities.
- **API Cache & Authentication**: Added Bearer token authentication to request stats for cache usage (`GET /api/cache/stats`).
- **Anonymization**: Masks the last octet of user IP addresses before writing logs to MongoDB.

---

## ⚡ Performance & Caching

- **Size-Limited LRU Cache**: Replaced standard cache implementation with a strict LRU eviction cache to completely eliminate memory leak risks.
- **Fetch Timeouts**: Implemented a hard 8-second fetch timeout for Codeforces, CodeChef, GitHub, and LeetCode API requests to prevent server hang-ups.
- **MongoDB Connection Breaker**: Integrated a circuit breaker on MongoDB logger connection logic to prevent repeating 10s connection timeouts from blocking request execution.
- **Repository Pagination Upper-bound**: Added pagination limits to prevent timeout exceptions when loading users with 500+ GitHub repositories.

---

## 🧪 Developer Experience & Testing

- **Unified Test Framework**: Converted all existing tests to Jest, providing a unified test running suite (`npm run check`).
- **API & SVG Render Unit Tests**: Added coverage for external API service modules (GitHub, LeetCode, Codeforces, CodeChef) and SVG render templates.
- **Visual Regression Snapshots**: Integrated Jest visual regression snapshots to keep SVG structures consistent and prevent unintended visual layout shifts.
- **Lightweight CI Check Pipeline**: Configured linting, formatting check, unit tests, coverage, and issue auto-labelers as automated GitHub Actions.
