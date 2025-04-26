> **Note for Assistant and User:**  
> The `cursor-context` folder contains documentation, planning, and reference materials for this project.  
> - `overall-context.md` (this file) provides the high-level overview, project goals, and infrastructure plans.  
> - Each other `.md` file (e.g., `adhd-n-d.md`, `snake.md`, `wordle.md`, etc.) contains context, planning, or documentation for a specific subproject or app.  
> - `project-journal.md` is used for progress tracking and as a personal reference.  
> - These files are somewhat interrelated (as they all relate to the same codebase and project), but are also independent (each focuses on a different app or aspect).  
> - The assistant should use these files for documentation, planning, and to provide better support in the future.

# Overall Context

## Project Goal
Build as many simple toy AI applications as possible in 12 hours, all within a single, well-organized React + TypeScript codebase.

## Infrastructure Plan
- The project will be a single React app (TypeScript, mobile-first).
- The main page will serve as a gallery, displaying preview images for each toy app.
- Clicking a preview takes the user to that app, which should feel standalone.
- Navigation options:
  - Each app has a back button to return to the gallery, OR
  - A top nav bar with a drop-down or back button for navigation.
- The codebase should be well-organized and easy to extend as new apps are added.
- **Currently implemented apps:**
  - ADHD+D (D&D-inspired to-do app)
  - Snake (classic arcade game)
  - Wordle Clone (word guessing game)
  - Spelling Bee Clone (word puzzle game)
  - Brick Breaker (arcade brick-breaking game)

## Folder Structure
- `cursor-context/`: For assistant context, planning, and documentation.
- `src/components/`: For shared components used across multiple apps.
- `src/[app-name]/`: For app-specific components and logic.

## Shared Components
- `AppHeader`: A reusable header component that provides:
  - Back button navigation
  - App title
  - Theme picker integration
  - Support for additional children (e.g., tabs)
  - Consistent styling across apps
- All apps use the shared AppHeader and theme system for a unified look and feel.
- Future shared components to consider:
  - Common button styles
  - Modal templates
  - Loading states
  - Error boundaries

## Next Steps
- Set up the initial React + TypeScript project structure.
- Design the gallery and navigation system.
- Identify and extract more shared components.
- Standardize theme usage across apps.

## Notes
- The assistant (Cursor) will ask questions or request guidance if needed.
- The user is open to suggestions for navigation and organization.
- When building new apps, consider what components could be shared.
- Use TypeScript for better type safety and code organization.

## Global Theme Picker (Planned)
- A palette/theme picker will be available as a small modal.
- Accessible from both the navigation bar of any individual app and the main home page (gallery).
- Themes are hardcoded (no user customization of individual colors).
- Initial theme: **Bold Classic**
  - Colors: Black, White, Russian Violet (#241E4E), Penn Red (#960200), Sunglow (#FFD046), Process Cyan (#30BCED)
- The selected theme should persist (e.g., via localStorage) across sessions and apply to all apps.
- The modal will allow users to select from available themes (only one to start, more to be added later).
- Theming applies app-wide for a consistent experience.
- When implementing themes in apps:
  - Use theme.palette for colors
  - Consider contrast and accessibility
  - Use theme.spacing for consistent margins/padding
  - Leverage theme.shadows for depth
  - Use theme.breakpoints for responsive design 

---

## Comprehensive Review & Recommendations (Test-and-Polish Phase)

### 1. Continuity of Look-and-Feel

**Strengths:**
- Most mini-apps use MUI components and the shared `AppHeader` for navigation and theming, providing a consistent baseline.
- The main gallery and app cards have a unified style.

**Inconsistencies:**
- Some games (e.g., Pac-Man, Tetris) use custom CSS for their play areas, which may not fully reflect the selected theme (e.g., hardcoded backgrounds, colors).
- Some games (e.g., Tetris, Pac-Man) do not use the `AppHeader` or theme context in their main game area, while others do.
- Button and overlay styles in game overlays (e.g., Pac-Man overlays, Brick Breaker, etc.) are sometimes custom and not always MUI-based.

**Recommendations:**
- Ensure all games use `AppHeader` with theme picker and back button for consistency.
- Refactor custom overlays (e.g., Pac-Man overlays, game over screens) to use MUI `Dialog` or `Paper` with theme-based colors.
- Replace hardcoded colors in CSS (e.g., backgrounds, walls, overlays) with values from the current MUI theme (`theme.palette.*`), possibly using CSS variables or inline styles.
- Unify button styles by using MUI `Button` everywhere, even in overlays.

### 2. Opportunities to Incorporate Themes

- **Game Area Styling:** Use the MUI theme for backgrounds, text, and accent colors in all game areas. For example, Pac-Man's maze and Tetris's playfield backgrounds should use `theme.palette.background.default` or similar.
- **Dynamic CSS Variables:** Consider injecting CSS variables for theme colors at the root, so custom CSS (e.g., Pac-Man walls, Snake food) can use them.
- **Tetromino Colors:** Tetris uses a custom pastel palette. Consider making these theme-aware or allowing the user to pick a "Tetris color theme" as a stretch feature.
- **Scoreboards, overlays, and modals:** Use MUI components and theme colors for all overlays and popups.

### 3. Stretch Features (to document in `cursor-context/PROJECT_STRETCH_FEATURES.md`)

- **Accessibility:** Add ARIA labels, keyboard navigation, and colorblind-friendly modes.
- **Sound Effects:** Add toggleable sound effects for actions (e.g., eating pellets, clearing lines, collecting coins).
- **Mobile Controls:** Add on-screen controls for all games (some already have, but unify the approach).
- **High Score Persistence:** Store and display high scores for all games using `localStorage`.
- **User Profiles:** Allow users to enter a name and track their scores across games.
- **Dark Mode:** Add a true dark mode theme.
- **Customizable Controls:** Let users remap keys or choose between WASD/arrow keys.
- **Animations:** Add subtle animations for transitions, overlays, and game events.
- **Achievements/Badges:** Track and display achievements for milestones in each game.
- **Share Feature:** Allow users to share their scores or challenge friends.

### 4. Obvious Bugs or Issues

- **Theme Not Applied to Custom CSS:** Games with custom CSS (Pac-Man, Tetris, Snake) may not update their look when the theme changes.
- **Tetris Entry Point:** Tetris does not use `AppHeader` or theme context in its main export. Consider wrapping it in a component that does.
- **Pac-Man Mobile Controls:** The tip says "swipe to move" but there's no swipe handler implemented.
- **Game Over/Restart Logic:** Ensure all games reset their state fully on restart (e.g., Pac-Man resets ghosts, Tetris resets high score if needed).
- **LocalStorage Key Collisions:** Use unique keys for each game's localStorage data.

### 5. Edge Cases

- **Window Resize:** Some games may not handle window resizing gracefully (e.g., fixed-size canvases).
- **Rapid Key Presses:** Games should debounce or throttle input to prevent bugs (e.g., Tetris hard drop, Pac-Man direction changes).
- **Mobile Safari/Touch Events:** Ensure all games are playable on mobile browsers, and that touch events don't cause scrolling or zooming.
- **Accessibility:** Some overlays may not trap focus or be screen-reader friendly.

### 6. Other Recommendations

- **Testing:** Add unit and integration tests for game logic, especially for edge cases (e.g., collision detection, win/loss conditions).
- **Performance:** For large word lists (Spelling Bee, Wordle), consider web workers or async loading to avoid blocking the UI.
- **Documentation:** Add a README for each mini-app with rules, controls, and credits.
- **Code Organization:** Consider moving shared logic (e.g., high score management, overlays) to a common utilities folder.

### 7. Action Items

- [ ] Refactor all mini-apps to use `AppHeader` and theme context.
- [ ] Replace hardcoded colors in custom CSS with theme-based values.
- [ ] Document stretch features in `cursor-context/PROJECT_STRETCH_FEATURES.md`.
- [ ] Add accessibility improvements and test on mobile.
- [ ] Review and unify overlay/modal implementations.
- [ ] Add or improve localStorage high score tracking for all games.

--- 