# Milestack Learning Platform - Design Guidelines

## Design Approach

**Selected Approach**: Design System (Material Design) + EdTech Best Practices

**Justification**: Educational platform requiring clear information hierarchy, consistent patterns for learning workflows, and trust-building through professional design. The utility-focused nature (learning verification, assignment tracking, progress monitoring) combined with information-dense content (challenges, assignments, AI interactions) calls for a systematic approach prioritizing usability and clarity.

**References**: Material Design for interaction patterns, Khan Academy for educational hierarchy, Duolingo for gamification aesthetics, Linear for modern professional feel.

**Key Principles**:
1. **Clarity Over Cleverness**: Learning pathways and academic integrity requirements must be immediately understandable
2. **Trust Through Professionalism**: Design conveys educational legitimacy and ethical AI usage
3. **Progressive Disclosure**: Complex features revealed as users advance through competency levels
4. **Motivational Feedback**: Gamification elements encourage without overwhelming core educational purpose

---

## Core Design Elements

### A. Color Palette

**Primary Colors** (Light Mode):
- Primary Blue: 210 100% 52% (core brand, CTAs, active states)
- Cyan Accent: 190 100% 50% (gradients, highlights, success states)
- Neutral Gray: 220 13% 18% (text, headings)
- Light Gray: 220 13% 96% (backgrounds, cards)

**Primary Colors** (Dark Mode):
- Primary Blue: 210 100% 60% (adjusted for dark bg)
- Cyan Accent: 190 100% 55% (adjusted for dark bg)
- Text Light: 220 13% 91% (primary text on dark)
- Dark Surface: 220 13% 12% (main background)
- Card Surface: 220 13% 16% (elevated cards)

**Semantic Colors**:
- Success Green: 142 71% 45% (completed milestones, achievements)
- Warning Orange: 25 95% 53% (due dates, alerts)
- Error Red: 0 72% 51% (validation, critical warnings)
- Info Blue: 210 100% 52% (informational messages)

**Gamification Colors**:
- Gold Points: 45 93% 58% (point displays, rewards)
- Purple Badge: 261 51% 63% (achievement badges, premium features)
- Gradient: Primary Blue to Cyan (hero sections, premium CTAs)

### B. Typography

**Font Families**:
- Primary: 'Inter' (Google Fonts) - UI, body text, headings
- Monospace: 'JetBrains Mono' (Google Fonts) - code snippets, technical content

**Type Scale**:
- Display (Hero): 48px/56px, Bold (font-bold)
- H1: 36px/44px, Bold
- H2: 30px/38px, Semibold (font-semibold)
- H3: 24px/32px, Semibold
- H4: 20px/28px, Medium (font-medium)
- Body Large: 18px/28px, Regular (font-normal)
- Body: 16px/24px, Regular
- Small: 14px/20px, Regular
- Caption: 12px/16px, Medium

**Context Usage**:
- Headings: Bold/Semibold weights for clear hierarchy
- Body: Regular for readability, Medium for emphasis
- Code: Monospace at 14px for inline, 16px for blocks
- Points/Stats: Bold with larger size for visual impact

### C. Layout System

**Spacing Scale**: Tailwind units of **2, 4, 6, 8, 12, 16, 20, 24** (e.g., p-4, mt-8, gap-6)

**Common Patterns**:
- Section padding: py-12 md:py-20 (mobile to desktop)
- Card padding: p-6 md:p-8
- Element spacing: gap-4 (default), gap-6 (generous), gap-2 (compact)
- Container max-width: max-w-7xl (main content), max-w-6xl (focused sections)

**Grid System**:
- Dashboard: 3-column grid on desktop (lg:grid-cols-3), single column mobile
- Assignment cards: 2-column (md:grid-cols-2), stack on mobile
- Challenge library: 4-column grid (lg:grid-cols-4 md:grid-cols-2)

**Responsive Breakpoints**:
- Mobile: base (< 640px)
- Tablet: md (640px+)
- Desktop: lg (1024px+)
- Wide: xl (1280px+)

### D. Component Library

**Navigation**:
- Sticky header (bg-white, border-b, shadow-sm on scroll)
- Logo + horizontal nav items (desktop), hamburger menu (mobile)
- Profile dropdown with points display and user avatar
- Active state: border-b-2 with primary blue color

**Cards**:
- Assignment cards: White background, rounded-xl, shadow-md, hover:shadow-lg transition
- Challenge cards: Similar to assignments, include difficulty badge
- Achievement cards: Gradient borders for premium/completed items
- Padding: p-6, spacing between elements: space-y-4

**Buttons**:
- Primary: Gradient bg (blue to cyan), white text, rounded-lg, font-medium, px-6 py-3
- Secondary: Border (border-2), primary blue text, transparent bg, same sizing
- Ghost: No border, primary color text, hover:bg-gray-100
- Danger: Red background for destructive actions
- Disabled: 50% opacity, cursor-not-allowed

**Forms**:
- Input fields: border border-gray-300, rounded-lg, p-3, focus:border-blue-500 focus:ring-2 focus:ring-blue-200
- Labels: text-sm font-medium mb-2, gray-700 color
- Error states: border-red-500, text-red-600 for error messages
- File upload: Dashed border, hover state with blue accent

**Progress Indicators**:
- Progress bars: rounded-full, gradient fill showing completion percentage
- Milestone checkpoints: circular indicators with checkmark (completed) or lock icon (locked)
- Streaks: Fire icon with count, glowing effect for active streaks
- Level badges: Circular with gradient border, number display

**AI Chat Interface**:
- Message bubbles: User (right-aligned, blue bg), AI (left-aligned, gray bg)
- Rounded-2xl bubbles with p-4
- Typing indicator: animated dots
- Input: Fixed bottom, full-width with send button

**Modals/Overlays**:
- Background: bg-black/50 (50% opacity overlay)
- Modal: White bg, rounded-2xl, max-w-md to max-w-2xl, p-8
- Close button: top-right, hover:bg-gray-100 transition
- Slide-up animation on entry

**Data Displays**:
- Stats cards: Large number (text-3xl font-bold), label below (text-sm text-gray-600)
- Tables: Alternating row colors, hover states, sticky headers
- Leaderboard: Gradient highlights for top 3 positions
- Timeline: Vertical line with circular nodes for completed steps

### E. Animations

**Use Sparingly**:
- Hover transitions: 200ms ease for buttons, cards
- Page transitions: Fade or slide (300ms) when switching views
- Progress updates: Smooth width transitions for progress bars (500ms)
- Achievement unlocks: Gentle scale + fade-in (400ms)
- NO distracting scroll animations or parallax effects

---

## Images

**Hero Section** (Dashboard/Landing):
- Large hero image (1920x800px) showing students collaborating with laptops
- Subtle gradient overlay (blue to transparent) for text readability
- Position: Full-width at top of dashboard or marketing pages
- Style: Modern, diverse students, bright educational environment

**Assignment Thumbnails**:
- Small icons/illustrations representing assignment types (150x150px)
- Position: Top-left of assignment cards
- Style: Simple line art or flat illustrations, primary blue color

**Achievement Badges**:
- Custom SVG icons for different badge types (80x80px)
- Position: Profile page, achievement gallery
- Style: Gradient fills, medal/trophy aesthetic

**Empty States**:
- Illustrations for "no assignments yet", "no challenges completed"
- Position: Center of empty content areas
- Style: Friendly, encouraging, matching color palette

**AI Tutor Avatar** (Optional):
- Friendly robot/assistant illustration (60x60px circular)
- Position: AI chat interface header
- Style: Simple, approachable, gradient blue/cyan

---

## Academic Integrity Visual Language

**Trust Indicators**:
- Shield icon for honor code sections (primary blue)
- Checkmarks in circles for completed verification steps (green)
- Lock icons for gated content (gray when locked, blue when accessible)
- Document icons for learning pathway transparency

**Competency Verification UI**:
- Clear visual separation between "earn points" and "spend points" sections
- Progress rings showing completion percentage
- Color-coded point costs (gold) vs point earnings (green)
- Milestone unlock animations celebrate achievement

**Download Ethics**:
- Checklist UI with large checkboxes for pre-download requirements
- Warning banner (orange) if requirements not met
- Success state (green gradient) when qualified to download
- Documentation summary shown before final download

This design system balances educational professionalism with motivational gamification, ensuring students feel supported while maintaining the platform's commitment to academic integrity and genuine learning outcomes.