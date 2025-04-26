# Pac-Man Clone

A modern, web-based clone of the classic Pac-Man arcade game, built with React, TypeScript, and Material UI. This app aims to faithfully recreate the original game's maze, ghost AI, and gameplay, while supporting both mobile and desktop play. The project features modular code for easy extensibility, responsive design, and full integration with the shared AppHeader and theme system.

## Features
- Original Pac-Man maze faithfully recreated
- Four ghosts (Blinky, Pinky, Inky, Clyde) with authentic AI behaviors
- Pellets, power pellets, tunnels, and ghost house
- Level progression with new maze layouts per level
- Keyboard controls (desktop) and swipe controls (mobile)
- Score, lives, and level UI
- Shared AppHeader and theme integration
- Clear hook for a Blinky-related easter egg

## Folder Structure
- `mazeData.ts` — Maze layout and tile encoding
- `types.ts` — Shared types for game logic and rendering
- `index.tsx` — Main entry point and placeholder (to be replaced with PacManGame)
- `PacManGame.tsx` — Main game logic and rendering (to be implemented)
- `README.md` — This file

## Special Notes
- **Maze**: The maze is a pixel-accurate recreation of the original Pac-Man layout. Each level can load a new or modified layout for variety.
- **Ghost AI**: Each ghost uses its original targeting and scatter logic. Blinky's logic includes a clear spot for a custom easter egg.
- **Mobile**: Swipe in any direction to move Pac-Man. On-screen instructions are provided for mobile users.
- **Extensibility**: The codebase is modular, making it easy to add new mazes, features, or polish.
- **Status**: The MVP is in progress, with core architecture and design established. Future enhancements include sound, polish, and additional features.

## TODO (Technical Spec)

### 1. Game Board & Rendering
- [ ] Render the maze grid, matching original wall and path layout
- [ ] Draw walls, paths, tunnels, and ghost house with pixel-accurate styling
- [ ] Place pellets and power pellets at correct locations
- [ ] Render score, lives, and level UI (desktop and mobile responsive)
- [ ] Animate pellet and power pellet consumption
- [ ] Support both light and dark themes via Material UI

### 2. Player (Pac-Man) Mechanics
- [ ] Render Pac-Man sprite with mouth animation (directional)
- [ ] Implement keyboard (desktop) and swipe (mobile) controls
- [ ] Smooth, grid-based movement with wall collision detection
- [ ] Handle tunnel wraparound (left/right exits)
- [ ] Animate Pac-Man death sequence
- [ ] Detect and handle pellet and power pellet consumption

### 3. Ghosts (Enemies)
- [ ] Render four ghosts (Blinky, Pinky, Inky, Clyde) with unique colors and eyes
- [ ] Implement ghost state machine: scatter, chase, frightened, eaten
- [ ] Implement authentic ghost AI targeting logic for each ghost
- [ ] Animate ghosts (normal, frightened, eyes-only)
- [ ] Handle ghost respawn in ghost house after being eaten
- [ ] Implement ghost exit/entry logic for ghost house

### 4. Game Logic
- [ ] Track and update score (pellets, power pellets, ghosts eaten)
- [ ] Track and display remaining lives
- [ ] Handle level progression (new maze, reset positions, increase speed)
- [ ] Handle game over and win conditions
- [ ] Implement pause, resume, and restart functionality
- [ ] Support for high score tracking (local storage)

### 5. Collision Detection
- [ ] Detect Pac-Man vs. wall collisions
- [ ] Detect Pac-Man vs. pellet/power pellet collisions
- [ ] Detect Pac-Man vs. ghost collisions (normal and frightened states)
- [ ] Handle simultaneous collisions (e.g., eating pellet and ghost at same tile)

### 6. Power-Ups & Special States
- [ ] Implement power pellet effect (ghosts become frightened)
- [ ] Timer for frightened state, with flashing warning
- [ ] Allow Pac-Man to eat ghosts in frightened state (score multiplier)
- [ ] Handle ghost state transitions and animations

### 7. Audio & Visual Effects
- [ ] Add sound effects: chomp, power pellet, ghost eaten, death, level up, etc.
- [ ] Add background music (looping, pause on death)
- [ ] Add visual effects for power-ups, frightened state, and state transitions
- [ ] Animate level start, death, and level complete sequences

### 8. UI/UX & Polish
- [ ] Add start screen, instructions, and mobile tips
- [ ] Responsive design for mobile and desktop
- [ ] Add pause overlay and game over screen
- [ ] Integrate with shared AppHeader and theme
- [ ] Add Blinky easter egg (clear hook in code)
- [ ] Modularize code for extensibility (new mazes, features) 