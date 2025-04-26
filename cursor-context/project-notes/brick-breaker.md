# Brick Breaker Planning & Notes

## MVP Features
- [x] Simple brick breaker game using React + TypeScript
- [x] Uses project theme colors (see overall-context.md)
- [x] Responsive: works on desktop (keyboard) and mobile (on-screen buttons)
- [x] Paddle controlled by left/right arrows (desktop) or buttons (mobile)
- [x] Ball bounces off walls, ceiling, paddle
- [x] Ball bounces off bricks (brick collision/removal)
- [x] Bricks: 3–4 rows to start
- [ ] Add a row each level
- [x] Score: +1 per brick
- [x] Lives: 3 (displayed as hearts)
- [x] Start/Restart: Button and spacebar support
- [ ] High score saved in localStorage (consider shared storage for all apps)
- [x] UI: Score, lives, start/restart buttons, back to gallery

## To-Do List
- [x] Set up new app folder and component structure
- [x] Implement game board layout and theming
- [x] Paddle movement (keyboard and mobile controls)
- [x] Ball movement and collision logic (walls, paddle)
- [x] Brick layout and removal (collision detection)
- [x] Score and lives tracking
- [ ] Level progression (add row each level)
- [x] Start/restart/game over logic (basic)
- [ ] High score persistence (localStorage)
- [x] Responsive UI and mobile controls
- [x] Integrate with gallery and navigation

## Implementation Notes
- Use theme.palette for all colors
- Use simple shapes (rectangles, circles)
- Paddle is a flat plane; ball bounces with simple reflection
- No advanced physics (no spin, no acceleration)
- Use shared components (AppHeader, buttons) where possible
- Consider a consolidated localStorage strategy for all mini-apps

## Progress Summary (as of current implementation)
- Game board, paddle, and ball are rendered and styled with theme colors.
- Paddle movement is smooth and works with both keyboard and mobile controls.
- Ball movement is smooth and bounces off walls, paddle, and bricks (bricks disappear on hit).
- Score and lives are tracked and displayed in the UI.
- Start/Restart logic is implemented (button and spacebar).
- Bricks are rendered in a static grid.
- App is integrated into the gallery and navigation.

## Next Phase
- Implement level progression (add a row each level after clearing all bricks).
- Add high score persistence (localStorage).
- (Optional for this phase) Add power-ups or special bricks.

## Stretch Goals & Future Ideas
- Power-ups (multi-ball, larger paddle, laser, etc.)
- Multi-hit/color-changing bricks
- Special bricks (unbreakable, explosive)
- Sound effects and music
- Animated backgrounds or effects
- Multiple balls
- Brick patterns or randomized layouts
- Level editor or custom levels
- Achievements or challenges
- Leaderboard (local or online)
- Accessibility improvements (colorblind mode, etc.)

## Notes
- Keep code modular and easy to extend
- Prioritize clarity and maintainability
- Revisit this doc as features are added or ideas evolve 