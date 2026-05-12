# Implementation Plan: Financial Dashboard Pro (V2)

This document outlines the strategy for the V2 upgrade, transforming the dashboard into a full-scale financial intelligence system.

## 🎯 Vision
Moving beyond simple visualization to **UX of Decision**. The core value proposition is answering "Can I assume this expense?" through predictive modeling and real-time impact analysis.

## 🎨 Design System: "Carbon Pro"
- **Geometry:** Strict 0px - 2px rounding for a surgical, technical feel.
- **Palette:** 
  - **Base:** Carbon Deep (#0A0A0A).
  - **Primary:** Cyber Lime (#DFFF00).
  - **Feedback:** Signal Red (Danger), Electric Blue (Info), Emergence Green (Success).
- **Glassmorphism:** backdrop-blur-2xl on headers and floating panels.
- **Typography:** Outfit (Display) for impact; Inter (UI) for density and data.

## 🏗️ Technical Architecture
- **State Management:** Zustand with computed selectors for real-time recalculations.
- **Business Logic Layer:** 
  - `src/lib/calculations.ts`: Core math for health scoring and summaries.
  - `src/lib/recommendations.ts`: Decision engine for simulations.
- **Forms:** React Hook Form + Zod for robust data entry.
- **Charts:** Advanced Recharts with forecasting overlays.

## 🛤️ Execution Roadmap (V2 Upgrade)

### Phase 1: Engine Room (Completed)
- [x] Create logic layer for simulations and forecasts.
- [x] Expand state management to handle complex financial flows.
- [x] Define strict TypeScript interfaces for all financial entities.

### Phase 2: Decision Tools (Completed)
- [x] Build "Can I afford this?" Simulator.
- [x] Implement IA Insights panel with health scoring.
- [x] Create Predictability charts for balance forecasting.

### Phase 3: Financial Organization (Completed)
- [x] Implement Monthly Timeline/Timeline.
- [x] Create Cash Manager with real-time editing.
- [x] Build Investment & Reserve tracking system.

### Phase 4: Final Polish (Completed)
- [x] Advanced Transaction Table with multi-filters.
- [x] Responsive layout optimization.
- [x] Production build verification.

## 🛠️ Tech Stack
- Next.js 16 (App Router)
- Framer Motion
- Recharts
- Zustand
- React Hook Form + Zod
- date-fns
