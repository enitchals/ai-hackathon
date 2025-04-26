# ADHD+D (To-Do App) Requirements & Status

> **Status:** Core features, persistent storage, and major polish are complete. App is fully functional and visually polished. Only stretch goals and minor UX remain.

## Overview
A playful, D&D-inspired to-do app for people with ADHD. Users add tasks, then roll a D20 to randomly select a task to focus on. Rolling a 20 triggers a break timer. The app is mobile-friendly, visually engaging, and uses localStorage for persistence.

## Core Features (All Complete)
- Add, remove, and reorder tasks in a to-do list (drag-and-drop).
- D20 dice roller to randomly select a visible task (up to 19 shown).
- Modal displays the selected task with "I did it" (move to done) and "I give up" (move to end) actions.
- Rolling a 20 opens a break modal with a timer (5, 10, or 20 min options, beeps at end).
- Done list is on a separate tab; both lists have "Clear List" buttons with confirmation.
- All state is persisted in localStorage.
- Modern, responsive UI with MUI components and custom theming.

## Polish & UX (Mostly Complete)
- [x] Mobile-first, responsive design.
- [x] Centered title, back button aligned to content edge.
- [x] D20 and add form at top of to-do tab.
- [x] Scrollable task list fits within 100vh, with padding.
- [x] Task modal: die and number visually centered, task bold and prominent, clear action buttons.
- [x] Accessibility and keyboard navigation (basic MUI support).

## Future Enhancements (Not Started)
- [ ] Fun D&D-style sound effects or animations
- [ ] Customizable dice (D6, D12, etc.)
- [ ] Shareable lists or stats
- [ ] Update game text and UX:
  - Add first-time user introduction modal
  - Emphasize keeping tasks small (5 minutes or less)
  - Update card preview text
- [ ] Task suggestion system:
  - Add bank of pre-written task suggestions
  - "Suggest task" buttons or randomized suggestions
  - Refresh option for new suggestions
- [ ] Enhanced gamification features:
  - Special rewards for rolling 20 (dance party, kitten videos, etc.)
  - Combat system with:
    - Creature that grows stronger as tasks are completed
    - Boss battles / sudden death encounters
    - Progress tracking and rewards

## Remaining Minor Tasks
- [ ] Add more advanced accessibility features if desired.
- [ ] Further visual polish or theming tweaks as needed. 