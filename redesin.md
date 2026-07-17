COMPLETE IMPLEMENTATION SPECIFICATION
Goal

Completely redesign the landing page hero of Contribo.

This is not a traditional SaaS hero with an illustration floating beside text.

The hero should feel like a premium editorial landing page similar to Apple, Linear, Notion, Raycast and Stripe.

The right side contains a custom 3D workspace illustration while the left side contains all primary content.

The illustration is decorative.

The content is the primary focus.

Everything should feel calm, minimal, realistic and intentionally designed.

Avoid anything that feels AI-generated, neon, cyberpunk, over-animated or gradient-heavy.

Overall Layout

The hero should occupy almost the full viewport.

 ---------------------------------------------------------
| Navbar                                                  |
-----------------------------------------------------------
|                                                         |
|    LEFT CONTENT             RIGHT 3D WORKSPACE          |
|                                                         |
|                                                         |
|                                                         |
|_________________________________________________________|
|                  Floating Statistics Card               |
-----------------------------------------------------------

This is NOT a two-column layout.

The hero is one large canvas.

The workspace illustration is absolutely positioned on the right.

The content sits on top.

Hero Container
max-width: 1440px
margin: auto

min-height: calc(100vh - 80px)

padding-top: 110px
padding-bottom: 150px

padding-left: clamp(32px,6vw,90px)
padding-right: clamp(32px,6vw,90px)

position: relative
overflow: hidden

Never use

height:100vh;

Always use

min-height

so mobile browsers work correctly.

Left Content Width

Never exceed

620px

Do NOT allow the text to become wider.

Large headlines become unreadable if wider.

Hero Illustration

The illustration is the highlight.

It should look like a real 3D product render.

Not a flat SVG.

Not an AI painting.

Not a cartoon.

Imagine a professional render created in Blender.

It contains

• Modern laptop

• Code editor open

• Small plant

• Coffee mug

• Notebook

• Mechanical keyboard

• Soft desk lamp

• Warm wooden desk

Everything should feel realistic.

Illustration Placement

This is where Gemini usually fails.

Use these exact rules.

position:absolute;

right:-120px;

bottom:-40px;

width:min(720px,52vw);

height:auto;

pointer-events:none;

z-index:0;

Never center it.

Never stretch it.

Never scale beyond

720px
Desktop Position

The laptop occupies roughly

Right 42%

of the hero.

The screen points slightly toward the user.

The keyboard faces the bottom-left corner.

Do NOT rotate dramatically.

The coffee mug

appears near

82%

viewport width.

The plant

appears

upper right.

Notebook

bottom right.

Nothing overlaps the heading.

Ever.

Layering

Illustration

z-index 0

Content

z-index 2

Stats card

z-index 5

Navbar

z-index 100

Background

No gradients.

No purple glows.

No blue effects.

Use

background:

#F8F6F2

Very subtle warm ivory.

Add only

radial-gradient

rgba(201,183,148,.10)

towards

top-right

Opacity

less than

10%.

The user should barely notice.

Illustration Shadow
filter:

drop-shadow(
0 60px 90px rgba(0,0,0,.10)
);

No glowing shadows.

Heading
Accelerate Your

Open Source Career.

Always break after

Your

Never let the browser decide.

Font

Geist

or

Inter

Weight

800

Size

Desktop

76px

Tablet

60px

Mobile

44px

Letter spacing

-3px

Line height

0.92

Highlight

Only

Open Source

Color

#2F7A52

Everything else

#181818
Description

Max width

560px

Size

22px

Weight

400

Color

#5B5B5B

Line height

1.7

Search Bar

Width

620px

Height

72px

Radius

36px

White

Border

1px

#E6E3DC

Shadow

0 12px 30px rgba(0,0,0,.05)

No glassmorphism.

No glow.

Buttons

Primary

Green

#2F7A52

Hover

#256645

Secondary

White

Border

#D8D5CF

Hover

Light Grey

Statistics Card

Floating card.

Never inside hero content.

position:absolute;

bottom:-60px;

left:50%;

transform:translateX(-50%);

Width

1180px

Max

Inside

5 columns

Projects

Organizations

Programs

Contributors

Success Rate

Background

White

Radius

20px

Shadow

0 20px 60px rgba(0,0,0,.08)
Navbar

Height

80px

Sticky

Blur

backdrop-filter:blur(20px)

Background

rgba(248,246,242,.85)

Thin border bottom.

Animation

Animation must be subtle.

Avoid "wow" animations.

Use only:

Hero

fade

24px upward

0.8 seconds

Illustration

opacity

0 → 1

scale

0.97 → 1

Duration

1 second

No bounce.

Stats

delay

0.25s

rise

12px

Buttons

Hover

Translate

-2px

Shadow increases

5%.

Cards

Hover

translateY(-3px)

Only.

Responsive Behaviour
≥1440px

Illustration width

720px

1200px

Illustration

620px

1024px

Illustration

500px

Content width

560px

900px

Illustration shifts further right

about 35% visible

Content remains full width

768px

Remove absolute positioning.

Stack layout.

Illustration moves below text.

Centered.

Width

90%

Search

100%

Buttons

Stack vertically.

Statistics become

2 columns.

480px

Heading

44px

Buttons

Full width.

Statistics

single column.

Illustration

320px.

No horizontal scrolling anywhere.

Design Principles (Do Not Violate)
Do not use split-screen layouts.
Do not use glassmorphism.
Do not use oversized gradients or neon glows.
Do not stretch the illustration.
Do not allow imagery to overlap typography.
Do not animate continuously.
Do not use more than one accent color.
Do not center the illustration.
Maintain generous whitespace throughout.

## HERO BACKGROUND ILLUSTRATION (MOST IMPORTANT)

The hero section should use a realistic custom 3D workspace illustration as part of the background.

This illustration is NOT a foreground image.
It is NOT a normal <img> placed beside the content.
It is NOT a two-column layout.

Instead, treat it as environmental artwork that lives inside the hero.

Implementation:

• The hero container must be position: relative.
• The illustration should be position: absolute.
• The illustration sits behind the content (z-index:0).
• The content container sits above it (z-index:2).

Illustration positioning:

Desktop (≥1440px)
-------------------
right: -120px;
bottom: -30px;
width: 720px;

Large Desktop (1200px–1440px)
-------------------
right: -80px;
bottom: -20px;
width: 620px;

Laptop (1024px–1200px)
-------------------
right: -60px;
bottom: 0;
width: 520px;

Tablet (<900px)
-------------------
Disable absolute positioning.
Move illustration below the hero content.
Center align.
Width: 90%.

Mobile (<768px)
-------------------
Stack below the buttons.
Width: 100%.
Maximum width: 340px.

The illustration should never overlap the heading.

The illustration should never cover the search bar.

The illustration should never touch the navbar.

There must always be at least 80px of whitespace between the laptop and the typography.

The illustration should occupy approximately the rightmost 40–45% of the hero.

Do NOT scale it larger than 720px wide.

The illustration should preserve its aspect ratio at all times.

Use object-fit: contain.

Never stretch the image.

Never crop the laptop screen.

Never crop the coffee mug.

Never crop the notebook.

Only allow the far-right edge of the plant to be cropped naturally.

The illustration should feel like a premium product render placed on a desk—not wallpaper.

Background:

Use a warm ivory background.

background: #F8F6F2;

Add a very soft radial light behind the illustration.

Example:

radial-gradient(
circle at 82% 42%,
rgba(209,194,170,0.12),
transparent 55%
)

Opacity must stay under 12%.

There should be NO blue gradients.

NO purple gradients.

NO glowing effects.

NO cyberpunk styling.

The background should resemble Apple's website, Notion, or Linear.

## Hero Rules

1. The content block has a maximum width of 620px.

2. The illustration is absolutely positioned.

3. The illustration begins only after approximately 65% of the viewport width.

4. Crop the illustration so only the laptop, mug, notebook and plant are visible.

5. Fade the LEFT edge of the illustration using CSS mask-image.

6. Never allow the illustration to overlap typography.

7. Never render the entire photograph.

8. The hero background remains a single uninterrupted canvas.

9. The illustration should feel like environmental storytelling rather than a side panel.

10. The content always has visual priority.

11. The heading should always remain exactly two lines on desktop.

12. The heading width must never exceed 620px.

13. Never stretch the illustration.

14. Never use width:50%.

15. Never use grid-cols-2.

16. Never use justify-between for the hero.