Contribo v2 — Universal Open Source Programs Platform
Product Vision

Contribo is evolving from a Google Summer of Code discovery platform into the world's largest open-source opportunity platform.

The platform should help contributors discover, understand, prepare for, and apply to every major open-source mentorship program from a single interface.

The current GSoC functionality must remain 100% intact while becoming one module within a much larger ecosystem.

Contribo should eventually support:

Google Summer of Code
Outreachy
LFX Mentorship
MLH Fellowship
Hacktoberfest
GirlScript Summer of Code
Season of KDE
Google Season of Docs
C4GT
FOSSASIA
Linux Kernel Mentorship
CNCF Mentoring
Summer of Bitcoin
24 Pull Requests
and additional programs over time.
Core Product Goals

The platform revolves around four major pillars.

1. Discover

Help contributors find:

programs
organizations
projects
mentors
beginner issues
repositories

using search, filters and AI recommendations.

2. Understand

Provide structured information for every program.

Examples:

eligibility
timeline
stipend
application process
proposal requirements
organization details
previous project ideas
FAQs

The platform should become the first place users visit before applying.

3. Prepare

Help contributors become application-ready.

Includes

AI recommendation engine
proposal resources
learning roadmaps
contribution guides
GitHub onboarding
application checklist
4. Track

Allow users to manage multiple applications.

Examples

saved organizations
saved projects
application progress
proposal drafts
deadline reminders
dashboard
Product Principles

The redesign must follow these rules.

DO NOT

❌ Remove existing GSoC functionality

❌ Break existing APIs

❌ Change existing URLs unnecessarily

❌ Duplicate components

❌ Create separate experiences for every program

DO

✅ Generalize everything

✅ Make GSoC just another program

✅ Build reusable components

✅ Keep APIs backwards compatible

✅ Make future program additions require minimal code changes

Technical Vision

The current application is heavily GSoC-specific.

The new architecture should be program-first.

Instead of

Organization

↓

Projects

The hierarchy becomes

Program

↓

Organizations

↓

Projects

Every page should derive from the Program entity.

Example

Programs

Google Summer of Code

↓

Apache

↓

Apache Arrow Project

or

Programs

Outreachy

↓

Mozilla

↓

Firefox Accessibility
Data Architecture

Introduce a new top-level entity.

Program

id

name

slug

logo

banner

description

officialWebsite

applicationStatus

timeline

eligibility

stipend

duration

difficulty

technologies

colorTheme

resources

socialLinks

createdAt

updatedAt

Organizations become

Organization

programId

name

description

logo

website

github

mentorCount

acceptedProjects

tags

difficulty

languages

repositories


Projects

Project

organizationId

programId

title

description

difficulty

skills

technologies

mentors

ideas

repository

status


Everything should reference

Program

↓

Organization

↓

Project
Phase 0 — Foundation
Goal

Convert the application into a program-driven platform.

Tasks

Audit

current database
APIs
matcher
dashboards
filters
routing

Create

Program table

Migrate

Existing GSoC

624 organizations

↓

programId = gsoc

Migrate

12,000+

projects

without modification.

Create ingestion pipeline

CSV

↓

Normalizer

↓

Database

Every future program must use the same ingestion interface.

Deliverable

Current site behaves exactly the same while internally using the new schema.

Phase 1 — Programs Platform

Create

Programs

page.

Each card contains

logo
status
timeline
stipend
duration
organizations
projects

Create reusable

Program Detail page

Sections

Hero

Overview

Timeline

Eligibility

Application Process

Organizations

Projects

Resources

FAQs

Do not create custom pages.

Every program uses the same template.

Phase 2 — Content Layer

Build

Guidelines Hub

instead of scattering guides.

Structure

Getting Started

Git & GitHub

Choosing Programs

Writing Proposals

Communication

Good First Issues

Application Timelines

Interview Tips

Open Source Roadmaps

Frequently Asked Questions

Use MDX or CMS.

Phase 3 — Design System

Current design

↓

Single GSoC theme

New design

↓

Platform theme

Dark

Neutral

Minimal

Each program only changes

badge
accent color
timeline color

Never the entire website.

Component library

Program Card

Organization Card

Project Card

Timeline

Eligibility Tags

Status Chips

Stipend Badge

Difficulty Badge

Search Filters

Statistics Cards

Phase 4 — AI Platform

Rename

AI Matcher

↓

Contribo Compass

The engine should answer

Which program fits me?

Which organizations should I apply to?

Which projects match my skills?

How competitive is this organization?

What should I learn before applying?

It should recommend across all programs.

Not just GSoC.

Phase 5 — Dashboard

Dashboard becomes

Contributor Workspace

Sections

Saved Programs

Saved Organizations

Saved Projects

Applications

Proposal Drafts

Upcoming Deadlines

Contribution Tracker

Recommendations
Phase 6 — Data Expansion

Priority

1

Outreachy

2

LFX Mentorship

3

MLH Fellowship

Then

Hacktoberfest

Season of KDE

Season of Docs

Summer of Bitcoin

GirlScript Summer of Code

C4GT

Linux Foundation

CNCF

FOSSASIA

Each ingestion pipeline

Source

↓

Scraper/API

↓

Validator

↓

Normalizer

↓

Database
Phase 7 — Community

Add

Mentor Profiles

Success Stories

Discussion Threads

Deadline Notifications

Bookmarks

Collections

Organization Ratings

Community Contributions

Phase 8 — Future Features
GitHub OAuth integration
Personalized opportunity recommendations
Contribution streaks
Resume builder
Proposal reviewer
AI proposal feedback
AI interview preparation
Open-source portfolio
Mentor directory
Open-source roadmap generator
Community leaderboards
Weekly digest email
Browser deadline notifications
Calendar sync
Public contributor profile
Team collaboration for applicants
Success Criteria

The migration is successful when:

✅ Existing GSoC users notice no regression in functionality.
✅ Adding a new program requires only data ingestion and configuration, not new page development.
✅ Every program uses the same reusable UI components and routing structure.
✅ AI recommendations span multiple programs instead of being GSoC-specific.
✅ The platform becomes a year-round destination for open-source contributors rather than a seasonal GSoC tool.