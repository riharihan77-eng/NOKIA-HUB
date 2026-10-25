# Realistic Retro Nokia Battery Status Indicator

Integrate an authentic retro Nokia-style segmented battery meter into the top-right corner of the LCD screen that slowly depletes throughout the match, delivering heightened tension through visual flashing and authentic Nokia low-battery warning beeps without abruptly terminating gameplay.

> [!IMPORTANT]
> **User Review & Confirmed Specifications:**
> - **Depletion Outcome**: Confirmed: Visual and audio urgency warning only (does not abruptly terminate the game). Players experience authentic tension with warning beeps and visual cues while continuing to fight for high scores.
> - **Visual & Audio Style**: Recommended default (question skipped): Authentic 4-bar Nokia battery gauge in the top-right corner of the LCD status bar, complete with animated bar drain, flashing empty battery alert on critical power (< 20%), and classic two-tone Nokia low-battery warning audio pulses (`beep... boop`).
> - **Recharge Dynamics**: Eating bonus food items (insects / turbo pickups) gives a small partial battery refresh (+1 bar), rewarding skilled play while regular survival slowly drains power over ~100–120 seconds of continuous gameplay.

---

### 1. Overview & Core Concept

- **What It Does**: Renders a dedicated, faithful Nokia battery icon in the top-right corner of the LCD display (featuring the distinctive battery tip and 4 discrete level blocks). The battery begins at 100% (4 full bars) and gradually depletes over 90–120 seconds of active snake movement.
- **Urgency Dynamics**: When the battery drops to 1 bar (critical level), the battery icon begins flashing in the retro LCD dot-matrix color palette, and triggers the classic Nokia descending double-beep warning (`beep... beep...`) at timed intervals.
- **Skilled Recharging**: Snatching high-value bonus insects replenishes +25% battery charge, giving players a tactile reward and dynamic gameplay incentive.

---

### 2. User Experience & Visual Design

#### Status Bar Visual Hierarchy
- **Top-Right Placement**:
  - Right-aligned in the LCD status bar: [Battery Gauge] [Sound Status Icon].
  - Geometry: Authentic Nokia 3310 proportions (outer frame with 1px border, positive terminal nipple on the right edge, and 4 clean internal pixel segments).
  - High Contrast: Rendered directly in the active LCD theme palette (`theme.pixel`), maintaining full visibility across all 4 color schemes (Green, Amber, Monochrome, Cyan).
- **Levels & States**:
  - **4 Bars (76–100%)**: Full power, solid bars.
  - **3 Bars (51–75%)**: High power, 3 bars filled.
  - **2 Bars (26–50%)**: Medium power, 2 bars filled.
  - **1 Bar (1–25%)**: Low battery; begins subtle pulse.
  - **0 Bars (Empty / Critical)**: Battery frame blinks at 2Hz; authentic Nokia low-battery acoustic tone sounds every 15 seconds.
- **Audio & Haptic Feedback**:
  - Synthesized Nokia double-tone: 659Hz (E5) followed by 523Hz (C5) short pulses.
  - Light haptic flutter on mobile devices when battery transitions to empty.

---

### 3. Key Product Decisions & Trade-Offs

- **Non-Lethal Urgency vs Sudden Game Over**:
  - *Chosen Approach*: Battery serves as an atmospheric urgency mechanic with flashing LCD warning and sound effects rather than instantly cutting power and ending the run.
  - *Why*: Direct player choice from clarification. Sudden game over on a clock frustrates arcade snake players striving for length records, whereas persistent low-battery panic enhances the nostalgic mood.
- **Bonus Bug Recharging**:
  - *Chosen Approach*: Catching rare bonus insects or turbo pickups re-energizes +1 battery bar.
  - *Why*: Connects the battery mechanic directly to game decisions—players will take higher risks to hunt scurrying bugs to stave off the low-battery alarm.
- **State Synchronization**:
  - *Chosen Approach*: Track `batteryLevel` (0 to 100) inside game state, decaying only during `'PLAYING'` ticks and resetting on new games.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                   Game Engine Loop                     │
│  - Decrements batteryLevel by ~0.08 per tick (~90-120s)│
│  - On Insect/Boost Eat: +20 to +25 batteryLevel        │
│  - Resets to 100 on Game Start / Restart               │
└───────────────────────────┬────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐
│       Retro Audio Engine      │ │      Nokia LCD Screen HUD     │
│  - Low Battery Beep (E5 -> C5)│ │  - 4-Segmented Battery Gauge  │
│  - Cooldown timer to prevent  │ │  - Flashing Alert on Critical │
│    sound fatigue              │ │  - Theme-matched Dot Pixels   │
└───────────────────────────────┘ └───────────────────────────────┘
```

#### Files to Update:
1. `src/types.ts`: Add `batteryLevel: number` to state contracts.
2. `src/utils/audio.ts`: Add `playLowBatteryAlert()` synthesizing authentic Nokia double-beeps.
3. `src/components/NokiaScreen.tsx`: Update HUD with the realistic 4-segment Nokia battery widget and critical flashing states.
4. `src/App.tsx`: Track battery decay in the game tick, provide bonus recharge upon eating insects, and trigger low-battery audio on critical thresholds.
