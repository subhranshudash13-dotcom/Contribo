# Contribo: Enterprise Design Specification & Architecture

This document serves as the absolute source of truth for the platform's design system, component architecture, engineering standards, and product philosophy. Every new feature, UI component, and code commit must align with this specification.

## 1. Product Philosophy
1. **Answer the Core Question:** Every screen must answer one question within three seconds.
2. **Never Hide Information:** Important data must be immediately visible, not buried behind clicks.
3. **Data Before Decoration:** Real data is preferred over marketing fluff. 
4. **Reduce Uncertainty:** Every interaction should reduce uncertainty.
5. **Real Data Over Marketing:** Use exact stats and specific data.
6. **Every Element Communicates:** Visual elements must communicate status, structure, or priority, not just "look nice".

## 2. Design Tokens
### Spacing (Base-4 Grid)
- 4px, 8px, 12px, 16px, 24px, 32px, 40px, 48px, 64px, 80px

### Border Radius
- 2px, 4px, 6px, 8px, 12px

### Elevation (Z-Index / Visual Depth)
- 1: Base components
- 2: Hover states
- 3: Dropdowns / Tooltips
- 4: Modals / Drawers

### Animation Steps
- 100ms: Micro-interactions (hover, active)
- 150ms: Quick transitions (toggles)
- 200ms: Layout shifts
- 300ms: Modals, drawers, and larger layout animations

### Container Widths
- 1280px, 1440px, 1600px, 1920px

### Typography Scale (px)
- 12, 14, 16, 18, 20, 24, 32, 48, 64

## 3. Component Specifications

### Buttons
**Purpose**: Primary call to actions and interactions.
**Variants**: Primary, Secondary, Outline, Ghost.
- **Hover**: Elevates 2px (transform or shadow shift).
- **Pressed**: Background darkens 8%.
- **Keyboard**: Visible high-contrast focus ring.
- **Loading**: Shows inline spinner, disables interaction.
- **Analytics**: Always tracked (e.g., `track_home_browse_programs`).

### Cards (e.g., Program Card)
**Height / Width**: Defined by strict CSS grid constraints.
**Spacing**: Internal padding strictly follows the 8px/16px/24px scale.
**Logo Size**: 40x40px, uniformly padded.
**Content**: Title, Subtitle, Organizer, Duration, Difficulty, Stipend, Timeline.
**Interactions**: 
- **Hover**: Border highlights or slight elevation.
- **Focus**: Focus ring around the entire card or primary link.
- **Loading**: Skeleton state mirrors the exact final layout.
- **Empty/Error State**: Beautifully illustrated empty state fallback.

## 4. UX Flows (Complete UX Specification)
Every action must be a defined flow. No ambiguous links.
*Example Flow: Program Discovery*
1. **Visitor lands**
2. **Hero** (Animated schematic)
3. **Search** (Global search across all entities)
4. **Filters** (Quick category chips)
5. **Program Cards**
6. **Program Details**
7. **Organizations** (Filtered by Program)
8. **Projects** (Filtered by Org)
9. **Matcher** (If user doesn't know what to choose)
10. **Dashboard** (Saved and tracked applications)

## 5. Navigation Architecture
### Top Navigation Structure
- **Logo** (Home)
- **Programs**
- **Organizations**
- **Projects**
- **Guides**
- **AI Match**
- **Dashboard**
- **Notifications** (Icon)
- **Theme** (Toggle)
- **Profile** (Avatar)

*Components*: Command Palette (Global Search), Mobile Menu.
*States*: Clear active indicators, hover transitions (100ms), keyboard accessibility.

## 6. Information Architecture
Defines the strict hierarchy and breadcrumbs.
**Level 1**: Platform (Home)
**Level 2**: Programs (e.g., `/programs`)
**Level 3**: Organizations (e.g., `/organizations?program=gsoc`)
**Level 4**: Projects (e.g., `/projects?org=apache`)
**Level 5**: Project Details (e.g., `/projects/1234`)
*URLs must be predictable. Breadcrumbs must always be present in deep views.*

## 7. Microcopy Guide
- **Specific > Vague:** Use "Find Programs" instead of "Get Started".
- **Actionable > Passive:** Use "Compare Programs" instead of "Continue".
- **Data-Rich > Generic:** Use "Explore 182 Projects" instead of "View More".

## 8. Empty States
Every list, table, and dashboard must have an empty state:
- **Illustration**: Custom, non-generic schematic line-diagram.
- **Explanation**: Clear reason why it's empty.
- **Action**: Direct path to resolve the state (e.g., "Browse Projects", "Clear Filters").

## 9. Dashboard Specification
The dashboard is the central operating system for the user.
- **Today**: Current active deadlines or immediate actions.
- **Applications**: Tracked proposal progress.
- **Recommendations**: Suggested projects via AI.
- **Calendar**: Program timelines and upcoming events.
- **Activity**: Contribution heatmap, GitHub activity syncing.
- *Vibe*: GitHub meets Linear meets Notion.

## 10. Search (Command Palette)
- **Global Scope**: Searches Projects, Organizations, Programs, Guides, Mentors.
- **Features**: Autocomplete, keyboard navigation (Arrow keys, Enter, Escape), recent searches, trending searches, quick filters.

## 11. Accessibility (WCAG AA)
- **Keyboard Navigation**: Entire site navigable via Tab/Shift+Tab.
- **Focus Rings**: Mandatory, high-contrast, not relying on color alone.
- **Screen Readers**: Proper semantic HTML (nav, main, aside) and ARIA usage.
- **Contrast Ratios**: Minimum 4.5:1 for all text.
- **Reduced Motion**: Respect `prefers-reduced-motion` media queries.

## 12. Engineering Standards
- **Folder Structure**: Strict separation of UI components, features, and app routes.
- **Naming Conventions**: PascalCase for components, camelCase for functions/vars.
- **Error Handling**: Graceful fallback boundaries.
- **Logging & Monitoring**: Structured logging.
- **Feature Flags**: For experimental rollouts.

## 13. Visual Quality Checklist (Pre-Merge)
Before any page is accepted into the main branch:
- [ ] No placeholder icons
- [ ] No lorem ipsum
- [ ] Real logos only
- [ ] Real screenshots
- [ ] Consistent spacing (Token checked)
- [ ] Accessible contrast
- [ ] Pixel aligned
- [ ] Responsive
- [ ] Loading state exists
- [ ] Empty state exists
- [ ] Error state exists
- [ ] Keyboard accessible
- [ ] Mobile optimized
- [ ] Analytics attached
- [ ] SEO metadata
- [ ] OpenGraph
- [ ] Structured data
- [ ] Lighthouse >95
- [ ] Dark mode verified
- [ ] Light mode verified
