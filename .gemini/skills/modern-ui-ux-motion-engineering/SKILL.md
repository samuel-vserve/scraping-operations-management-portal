---
name: modern-ui-ux-motion-engineering
description: Audit, modernize, animate, and quality-check an existing web application using a coherent premium SaaS design system, accessible motion, responsive layouts, and verified interaction testing. Use when asked to modernize an application UI, improve visual polish, add animations, fix layout consistency, or perform a full UI/UX and frontend quality pass.
---

# Modern UI/UX & Motion Engineering

## Mission

Transform the existing application into a polished, modern, production-quality interface while preserving its current business logic, APIs, authentication, permissions, routes, and data behavior.

Work across the entire application, not only the currently visible page. Deliver implemented changes and verified results—not just recommendations or mockups.

## Non-negotiable operating rules

1. Inspect the repository, framework, package manager, routing, styling system, component library, and current architecture before editing.
2. Reuse the existing stack and established patterns wherever practical.
3. Do not migrate frameworks or replace the component library without a clear technical reason and explicit approval.
4. Do not break APIs, backend behavior, authentication, role-based access, permissions, data contracts, or existing workflows.
5. Do not remove features or replace real data with dummy data.
6. Do not install dependencies until checking whether the project already has an equivalent capability.
7. Do not create a new visual style on every page. Establish one coherent design system and apply it consistently.
8. Do not add animation merely for decoration. Motion must communicate hierarchy, feedback, continuity, or state change.
9. Never claim an issue is fixed or tested unless it has actually been verified.
10. If a backend, credential, external service, or test environment blocks verification, record the item as BLOCKED.

## Phase 1 — Repository and application discovery

Inspect:

- Project tree and entry points.
- Framework and framework version.
- Package manager and lockfile.
- Routes, layouts, and page modules.
- Existing design tokens, CSS variables, themes, and global styles.
- Reusable buttons, inputs, cards, tables, dialogs, menus, and navigation.
- Icons, typography, charting, animation, and form libraries.
- API clients, state management, authentication, and authorization.
- Existing tests, linting, type checking, and build commands.

Build a route inventory. Identify shared components and duplicated implementations.

Before changing code, provide a concise implementation plan and note risky areas. Then proceed with the work; do not stop at the plan unless approval is genuinely required.

## Phase 2 — Define a cohesive visual direction

Aim for a premium, modern SaaS/product interface: clear hierarchy, restrained color, excellent spacing, crisp typography, purposeful depth, and subtle motion.

Use these as visual references, not as permission to copy their branding:
- Linear: https://linear.app/
- Stripe: https://stripe.com/
- Vercel: https://vercel.com/
- shadcn/ui: https://ui.shadcn.com/

Choose a visual direction appropriate to the product and its users. Avoid generic template appearance, excessive gradients, excessive glassmorphism, oversized rounded cards, random colors, and unnecessary decoration.

### Design-system requirements

Create or refine reusable tokens for:

- Brand, primary, secondary, accent, background, surface, elevated surface, border, muted text, primary text, success, warning, danger, and info colors.
- Typography family, sizes, weights, line heights, and letter spacing.
- Spacing scale based on a consistent unit (prefer a 4px base).
- Control heights and density.
- Border widths and radius scale.
- Elevation and shadow levels.
- Focus rings.
- Motion durations and easing curves.
- Responsive breakpoints.

Use semantic color tokens rather than hardcoding unrelated colors in individual components. Ensure all states have deliberate styling.

Suggested starting values (adapt to the existing product and density):
- Compact controls: 32–36px.
- Standard controls: 40px.
- Comfortable touch controls: 44–48px.
- Body text: 14–16px.
- Helper text: 12–13px.
- Card radius: 8–12px.
- Standard control radius: 6–8px.
- Card padding: 16–24px.
- Common spacing: 4, 8, 12, 16, 24, 32, 48px.

These are design recommendations, not universal accessibility requirements. Keep dense data-management screens efficient and readable.

## Phase 3 — Modernize the application shell

Review and improve:

- App shell and content container.
- Sidebar and collapsible navigation.
- Top bar, breadcrumbs, page titles, and page actions.
- Responsive navigation behavior.
- User profile and account menus.
- Notification and activity areas.
- Loading, empty, error, and permission-denied states.

Ensure active navigation is obvious, navigation does not jump unexpectedly, content has a consistent alignment grid, and the layout works at desktop, tablet, and mobile widths.

## Phase 4 — Component-by-component modernization

### Buttons and actions
- Establish consistent variants: primary, secondary, outline, ghost, destructive, link, and icon-only.
- Align icon and text; use consistent gaps and control heights.
- Provide hover, active, focus-visible, disabled, and loading states.
- Prevent duplicate submissions while requests are pending.
- Ensure each action has a real, verified handler.

### Forms and fields
- Align labels, fields, helper text, validation messages, and required indicators.
- Use consistent field heights, padding, borders, and focus states.
- Preserve validation rules and submitted data.
- Show errors next to the relevant field and provide useful feedback.
- Support keyboard operation and accessible names.

### Cards and dashboards
- Establish consistent card headers, content spacing, actions, and footers.
- Use restrained shadows and borders.
- Keep related metrics visually grouped.
- Avoid decorative cards that obscure data hierarchy.
- Ensure loading skeletons match the final layout to reduce layout shift.

### Tables and data-heavy screens
- Align headers and cells precisely.
- Keep row density consistent.
- Improve sorting, filtering, search, pagination, selection, and action menus.
- Handle long values, empty states, loading, errors, and narrow viewports.
- Preserve bulk actions and role-based access.
- Prefer responsive overflow containers or a deliberate mobile representation rather than breaking the page.

### Dialogs, drawers, menus, and tooltips
- Use consistent overlay, spacing, sizing, focus management, and stacking.
- Support Escape and appropriate light-dismiss behavior.
- Keep focus within modal dialogs while open and return focus when closed.
- Prevent background scrolling where appropriate.
- Ensure overlays are not clipped by parent containers.

### Feedback
- Standardize toast notifications, inline alerts, confirmation dialogs, progress indicators, and status badges.
- Announce important asynchronous updates accessibly.
- Do not use color alone to communicate status.

## Phase 5 — Motion and animation system

Use motion to make the interface feel responsive, coherent, and understandable.

### Motion principles

- Prefer subtle, short, purposeful motion.
- Keep interactions interruptible and responsive.
- Use consistent easing and timing tokens.
- Prefer CSS transitions for simple interactions.
- Use the existing animation library when suitable.
- For React projects, Motion for React may be considered if it adds meaningful value and is not already covered by the current stack.
- Prefer animating `transform` and `opacity`; avoid animating layout-triggering properties such as `width`, `height`, `top`, and `left` unless necessary.
- Avoid `transition: all`; specify only intended properties.
- Avoid large-scale parallax, constant decorative movement, excessive bounce, and distracting effects.
- Avoid layout shifts and delayed interaction caused by animation.

### Suggested motion tokens

Use as starting points and tune to the product:

- Instant feedback: 100–140ms.
- Small control transitions: 140–200ms.
- Menus and popovers: 160–220ms.
- Dialog and drawer entry: 180–260ms.
- Page or major layout transitions: 200–320ms.
- Easing: standard ease-out for entrances; ease-in for exits; a restrained ease-in-out for state changes.

Do not force every animation to use the same duration.

### Apply motion selectively

- Buttons: subtle color, border, and pressed-state feedback.
- Cards: restrained hover elevation or border emphasis where clickable.
- Navigation: smooth active indicator and controlled collapse/expand.
- Tabs: animated indicator where it improves orientation.
- Dialogs: subtle opacity and small-distance entrance/exit.
- Dropdowns: quick opacity and transform transition.
- Accordions: smooth height or grid-based expansion without content clipping.
- Lists: modest stagger only when it improves comprehension; avoid animating large datasets.
- Charts: animate initial data presentation only when it does not delay interpretation.
- Page transitions: preserve continuity and avoid making navigation feel slower.
- Loading: use skeletons or progress indicators that communicate actual loading state.

Do not animate every table row, every dashboard metric, or every element on every render. Respect `prefers-reduced-motion`; disable or replace non-essential spatial motion for users who request reduced motion. Avoid autoplaying persistent motion; provide pause/stop controls when required. Never use flashing effects.

## Phase 6 — Accessibility and responsive behavior

Use WCAG 2.2 Level AA as the accessibility baseline.

Verify:
- Text contrast: 4.5:1 for normal text and 3:1 for large text.
- Non-text UI and meaningful graphical contrast: 3:1 where required.
- Keyboard access and visible focus.
- Correct semantic elements and accessible names.
- Labels and instructions for form fields.
- Useful validation and error identification.
- No color-only communication.
- Reflow at 320 CSS pixels without unnecessary two-dimensional scrolling, except content that inherently requires it.
- Pointer target size meets WCAG 2.2 requirements, including applicable exceptions.
- Reduced-motion behavior is implemented.

Test representative widths: 1920, 1440, 1366, 1024, 768, 390, and 360 CSS pixels. Test both orientations where relevant.

## Phase 7 — Full functional and visual bug audit

Inspect every route and interactive component.

Check:
- Broken links and routes.
- Buttons with missing or incorrect handlers.
- Forms, validation, and duplicate submissions.
- Search, filters, sorting, and pagination.
- CRUD actions and confirmation flows.
- File upload and download.
- API success, empty, loading, and failure states.
- Authentication, authorization, and role-specific visibility.
- Browser console errors and failed network requests.
- Null/undefined data, overflow, clipping, and layout shifts.
- Keyboard and focus behavior.
- Theme switching and persisted theme behavior, if supported.

Do not change business logic to make a visual test pass. Record any discovered pre-existing behavior that appears intentional but cannot be confirmed.

## Phase 8 — Browser verification and regression testing

Use the project's existing test tooling. If browser automation is available, use Playwright for:

- Route-by-route smoke tests.
- Screenshot capture at representative viewport sizes.
- Critical user journeys.
- Button and form interaction checks.
- Modal and dropdown behavior.
- Console and network error monitoring.
- Responsive overflow checks.
- Visual comparison before and after changes.

Use axe-core or an equivalent accessibility checker where practical. Automated checks do not replace keyboard and manual review.

Run the available:
- Lint command.
- Type-check command.
- Unit and integration tests.
- Production build.
- Browser tests.

Fix regressions introduced by the changes. Do not suppress errors or weaken tests just to obtain a passing result.

## Phase 9 — Final deliverables

Provide:

1. Routes and modules inspected.
2. Design direction and design tokens established.
3. Components created or standardized.
4. Animations implemented and where they are used.
5. Functional bugs found and fixes applied.
6. Accessibility issues found and status.
7. Responsive viewport results.
8. Tests and build commands executed with actual outcomes.
9. Issues blocked by unavailable APIs, credentials, or environments.
10. Files changed and any dependency changes.

Use this issue status:
- FIXED — implementation and verification completed.
- PARTIALLY FIXED — implementation exists but verification is incomplete.
- BLOCKED — cannot verify due to an external dependency or missing access.
- OPEN — not fixed.

## Acceptance criteria

The task is complete only when:

- The entire route inventory has been reviewed.
- The application uses a coherent, reusable design system.
- Visual hierarchy, spacing, typography, and component styling are consistent.
- Motion is purposeful, smooth, performant, and accessible.
- Reduced-motion preferences are respected.
- Core workflows and existing business logic remain intact.
- Responsive behavior is verified.
- No new critical console, build, or functional regressions remain.
- The final report accurately distinguishes verified fixes from blocked work.

Begin with repository inspection. Then establish the design system, modernize shared components, update each route, and run regression tests. Continue through implementation rather than stopping after an audit or proposal.
