# Racing Game Planning & Notes

## MVP Features
- [x] Cute emoji-based racecar at the bottom of the screen
- [x] Car moves left/right via arrow keys (desktop)
- [ ] Car moves left/right via on-screen buttons (mobile)
- [ ] Horizontal track with yellow dashed lines moving right-to-left to simulate motion
- [x] Random obstacles (e.g., 🐄 cow, 🪨 rock) appear and move down
- [x] Collision detection: avoid obstacles to keep playing
- [x] Score: increases with coins collected
- [x] Start/Restart button and game over state
- [x] Responsive: works on desktop and mobile (basic, but no mobile controls yet)
- [x] Integrate with gallery and navigation

## To-Do List
- [x] Set up new app folder and component structure
- [x] Implement game board layout and theming
- [x] Emoji car and track rendering
- [x] Car movement (keyboard)
- [ ] Car movement (mobile controls)
- [ ] Animate dashed lines and obstacles moving left (track is currently vertical, obstacles move down)
- [x] Obstacle spawning and movement logic
- [x] Collision detection (car vs. obstacles)
- [x] Score tracking and display
- [x] Start/restart/game over logic
- [x] Responsive UI (basic)
- [x] Integrate with gallery and navigation

## Implementation Notes
- Uses emoji for car, obstacles, and coins for simplicity and charm
- Track is vertical (car at bottom, moves left/right)
- Obstacles and coins spawn at top and move down
- Score increases by collecting coins
- Game starts after pressing space or tapping start button
- Game over overlay and restart button implemented
- No sound, power-ups, or advanced effects yet

## Progress Summary (as of current implementation)
- Core gameplay loop is functional: car moves left/right, obstacles and coins spawn and move down, collision detection works, score is tracked, and game over is handled.
- Game is integrated into the app gallery and can be navigated to from the main menu.
- Start overlay (press space/tap to start) and restart logic are implemented.
- Responsive layout works, but there are no dedicated mobile controls (e.g., on-screen left/right buttons).
- Track is vertical, not horizontal as in original plan; no animated dashed lines for road effect yet.

## Next Phase
- Add on-screen left/right controls for mobile play
- (Optional) Add animated dashed lines or road effect for visual polish
- (Optional) Add sound effects and/or simple music
- (Optional) Add power-ups or more obstacle/coin types
- (Optional) Add accessibility improvements (colorblind mode, etc.)

## Stretch Goals & Future Ideas
- Power-ups (invincibility, speed boost, etc.)
- Multiple car/obstacle types
- Sound effects and music
- Animated backgrounds or effects
- Leaderboard (local or online)
- Achievements or challenges
- Accessibility improvements (colorblind mode, etc.)
- Settings menu (adjust speed, difficulty, lane count, etc.)
- Theme customization (different road, car, or background themes)
- Customizable controls (button size/placement, swipe controls)
- Haptic feedback (vibration on collision or coin pickup)
- Replay or share feature (save/share your best runs)
- Daily/weekly challenges or missions
- Ghost car (race against your previous best)
- Multiplayer or versus mode
- Weather effects (rain, snow, fog)
- In-game shop for cosmetic unlocks
- Tutorial or onboarding for new players

## Recommendations
- Prioritize adding mobile controls for a better mobile experience
- Consider adding a simple road animation for visual feedback
- Add sound effects for collisions and coin pickups for more engagement
- Refactor for code clarity and modularity as features grow

## Questions for the User
- Should the track remain vertical, or do you want to revisit the original horizontal design?
- What is your priority for next features: mobile controls, visual polish, or new gameplay elements?
- Do you want to add sound/music, and if so, do you have preferences for style?
- Should the score be based on coins, distance, or both?
- Any specific accessibility features you want to prioritize? 