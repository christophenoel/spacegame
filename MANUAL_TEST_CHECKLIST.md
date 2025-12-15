# Orbital Rescue - Manual Test Checklist

This checklist covers manual testing for game functionality, controls, performance, and responsive layout.

## Test Environment
- [ ] Browser: Chrome/Firefox/Safari
- [ ] Screen Resolution: _______________
- [ ] Date Tested: _______________
- [ ] Tester Name: _______________

---

## 1. Home Screen Tests

### Visual Tests
- [ ] Game title "ORBITAL RESCUE" displays correctly
- [ ] Subtitle displays correctly
- [ ] Background shows star animation
- [ ] Border and glow effects are visible
- [ ] All text is readable

### Content Tests
- [ ] Mission briefing text is present and clear
- [ ] All 5 control instructions are listed (↑/W, ↓/S, ←/A, →/D, SPACE)
- [ ] All 4 objectives are listed
- [ ] Start button displays "BEGIN MISSION"

### Interaction Tests
- [ ] Start button responds to hover (changes appearance)
- [ ] Clicking start button navigates to game screen
- [ ] No console errors on page load

---

## 2. Game Screen Tests

### Visual Tests
- [ ] Canvas renders with dark background
- [ ] Stars are visible in background
- [ ] Planet appears in center with gradient and glow
- [ ] Satellite renders with correct shape and colors
- [ ] Solar panels visible on satellite
- [ ] All 8 orbs are visible and pulsing
- [ ] Dotted orbit line is visible around planet
- [ ] HUD is visible at top of screen

### HUD Tests
- [ ] Score displays and starts at 0
- [ ] Orbs counter shows "0 / 8" initially
- [ ] Fuel bar shows full (green) at 100%
- [ ] Fuel percentage displays "100%"
- [ ] All HUD elements have proper styling

### Control Tests - Arrow Keys
- [ ] ↑ (Up Arrow) fires thrust upward
- [ ] ↓ (Down Arrow) fires thrust downward
- [ ] ← (Left Arrow) fires thrust left
- [ ] → (Right Arrow) fires thrust right
- [ ] Diagonal thrust works (multiple keys pressed)
- [ ] Thrust flame appears when thrusting
- [ ] Thrust flame disappears when keys released

### Control Tests - WASD
- [ ] W fires thrust upward
- [ ] S fires thrust downward
- [ ] A fires thrust left
- [ ] D fires thrust right
- [ ] Diagonal thrust works (multiple keys pressed)

### Control Tests - Pause
- [ ] SPACE key pauses the game
- [ ] "PAUSED" indicator appears when paused
- [ ] SPACE key resumes the game
- [ ] ESC key pauses/resumes the game
- [ ] Game physics freeze when paused

### Physics Tests
- [ ] Satellite is affected by gravity (pulls toward planet)
- [ ] Satellite maintains initial orbital velocity
- [ ] Thrusters change satellite velocity
- [ ] Satellite rotates to face direction of movement
- [ ] Smooth animation (60 FPS or close)

### Fuel System Tests
- [ ] Fuel depletes when thrusters are used
- [ ] Fuel bar color changes (green -> yellow -> red)
- [ ] Fuel percentage updates correctly
- [ ] Thrusters stop working when fuel reaches 0
- [ ] Fuel does not go negative

### Orb Collection Tests
- [ ] Orbs can be collected by touching them
- [ ] Collected orbs disappear
- [ ] Score increases by 100 per orb
- [ ] Orb counter updates (e.g., "1 / 8", "2 / 8")
- [ ] All 8 orbs can be collected

### Win Condition Tests
- [ ] Game ends when all orbs are collected
- [ ] Victory screen appears
- [ ] Final score includes orb points
- [ ] Fuel bonus is added to score
- [ ] "MISSION ACCOMPLISHED" message displays

### Loss Condition Tests
- [ ] Crashing into planet ends game
- [ ] "MISSION FAILED" screen appears
- [ ] Flying off left edge ends game
- [ ] Flying off right edge ends game
- [ ] Flying off top edge ends game
- [ ] Flying off bottom edge ends game

---

## 3. End Screen Tests

### Victory Screen Tests
- [ ] "MISSION ACCOMPLISHED" header displays
- [ ] Victory message is positive and clear
- [ ] Final score displays correctly
- [ ] Fuel efficiency bonus note is visible
- [ ] Retry button is present
- [ ] Back to Menu button is present
- [ ] Victory header is green colored

### Defeat Screen Tests
- [ ] "MISSION FAILED" header displays
- [ ] Defeat message is clear
- [ ] Final score displays correctly
- [ ] No fuel bonus note appears
- [ ] Retry button is present
- [ ] Back to Menu button is present
- [ ] Defeat header is red colored

### Interaction Tests
- [ ] Retry button restarts the game
- [ ] Back to Menu button returns to home screen
- [ ] Buttons respond to hover
- [ ] No console errors when navigating

---

## 4. Performance Tests

### Frame Rate
- [ ] Game runs smoothly (no stuttering)
- [ ] Frame rate remains consistent during thrust
- [ ] No lag when collecting orbs
- [ ] Animations are fluid

### Load Time
- [ ] Home screen loads quickly (< 2 seconds)
- [ ] Game screen loads quickly
- [ ] No loading delays between screens

### Browser Performance
- [ ] CPU usage is reasonable
- [ ] No memory leaks after multiple replays
- [ ] Browser remains responsive

---

## 5. Responsive Layout Tests

### Screen Size Tests
- [ ] Game displays correctly at 1920x1080
- [ ] Game displays correctly at 1366x768
- [ ] Game displays correctly at 1280x720
- [ ] Canvas is centered on screen
- [ ] HUD is properly positioned
- [ ] Controls hint is visible at bottom

### Window Resize
- [ ] Canvas maintains aspect ratio
- [ ] UI elements remain visible
- [ ] No layout breaking when window resized

---

## 6. Browser Compatibility

### Chrome
- [ ] All features work correctly
- [ ] Visuals render properly
- [ ] No console errors

### Firefox
- [ ] All features work correctly
- [ ] Visuals render properly
- [ ] No console errors

### Safari
- [ ] All features work correctly
- [ ] Visuals render properly
- [ ] No console errors

---

## 7. Edge Cases and Bugs

### Gameplay Edge Cases
- [ ] Can pause immediately after starting
- [ ] Can pause while thrusting
- [ ] Can collect multiple orbs quickly
- [ ] Game handles running out of fuel gracefully
- [ ] Game handles very high velocity correctly

### UI Edge Cases
- [ ] Very high scores display correctly
- [ ] Score doesn't overflow UI
- [ ] Fuel bar handles 0% correctly
- [ ] Fuel bar handles intermediate values

### Bug Report
List any bugs found:

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________
4. _______________________________________________
5. _______________________________________________

---

## Summary

**Total Tests:** ~100
**Passed:** _____
**Failed:** _____
**Pass Rate:** _____%

**Overall Assessment:**
- [ ] Ready for release
- [ ] Needs minor fixes
- [ ] Needs major fixes

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________
