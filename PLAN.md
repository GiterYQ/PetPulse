# PetPulse — Project Plan

> AI-Powered Pet Emergency Mutual Aid Network
> GOSIM Spotlight Paris 2026 — AI + Creativity Exhibition

---

## 1. Project Identity

**Name:** PetPulse
**Tagline:** "A network where helping others is how you protect your own pet."
**One-liner:** A community-powered AI network that connects pet owners to help lost pets, emergency blood needs, and medical support in real time.

---

## 2. Core Problem

Pet rescue fails not because people don't care, but because:

- Information spreads too slowly (lost pets)
- Blood donors can't be matched fast enough (emergencies)
- Medical info is scattered and unreliable
- People who want to help can't connect

**Insight:** Goodwill exists. Connection is missing.

---

## 3. Solution: Mutual Protection Loop

PetPulse = Mutual Aid Network + AI Dispatch System

```
You help others → You enter the protection network → Network grows → Everyone is safer
```

This is a **self-reinforcing safety system**.

### Three Pillars

| Feature | Description |
|---------|-------------|
| Lost Pet Broadcast | AI-generated alerts, image recognition, community relay |
| Emergency Blood Network | Hospital posts need → AI matches nearest donor → Real-time dispatch |
| Medical Mutual Aid | Experience sharing, emergency requests, trusted user network |

### AI's Role

AI is the **amplifier**, not the protagonist:
- Auto-generate search content
- Recognize pet information
- Match nearby helpers
- Push emergency alerts

### Trust Mechanism

- Veterinary certification (blood type / health)
- User credit system
- Donation & help history
- Identity verification

---

## 4. Demo Strategy

### Design Philosophy

> Optimize for **clarity, engagement, and storytelling** — not backend completeness.

This is an exhibition demo. The audience will spend **30 seconds** looking at it. Every design decision serves one question: **"Can they understand what PetPulse does in 30 seconds?"**

### Key Decision: Single Focus Scenario

**Primary flow: Medical Emergency (Blood Donation Matching)**
- Higher dramatic tension (life-or-death)
- AI matching logic is more visually demonstrable
- Blood type compatibility is intuitive to understand

Lost Pet exists as a secondary button but is not the showcase path.

### Interaction Flow (30-60 seconds)

```
[Click "Medical Emergency"]
    ↓
[Fill quick form: pet name, blood type, urgency]
    ↓
[Watch AI processing animation — 5 staged phases]
    ↓
[See matched donor pets appear on map + cards]
    ↓
[Click "Send Alert" on a match]
    ↓
[See response state update + connection animation]
```

---

## 5. UI Architecture

### Layout: Three-Panel Dashboard + Map

```
┌─────────────┬──────────────────────┬─────────────┐
│  LEFT PANEL │    CENTER PANEL      │ RIGHT PANEL │
│             │                      │             │
│  Emergency  │   AI Processing      │  Matching   │
│  Form       │   Feed               │  Results    │
│             │                      │             │
├─────────────┴──────────────────────┴─────────────┤
│                  MAP VISUALIZATION                │
│          (pulse animation + match lines)          │
└──────────────────────────────────────────────────┘
```

### Left Panel — Create Emergency
- Two mode buttons (Medical Emergency primary, Lost Pet secondary)
- Quick form with minimal fields
- Submit triggers the entire pipeline

### Center Panel — AI Processing Feed (The Star)
Five staged phases with visual progression:

| Phase | Message | Map Effect |
|-------|---------|------------|
| 1. Scan | "Analyzing emergency request..." | Center pulse |
| 2. Search | "Scanning nearby pets within 5km..." | Radar sweep |
| 3. Filter | "Filtering by blood compatibility..." | Dots dim/highlight |
| 4. Rank | "Ranking donors by response probability..." | Dots reorder |
| 5. Generate | "Generating alert message..." | Lines connect |

Each phase: animated typing + progress indicator + synchronized map animation.

### Right Panel — Matching Results
- Cards appear one by one after AI processing completes
- Each card: pet name, distance, blood type match, availability, trust score
- "Send Alert" button → animation → status change to "Responding"

### Map Visualization (Required)
- Canvas/SVG-based abstract city grid
- Center point = emergency location (red pulse)
- Scattered dots = nearby registered pets
- Matching animation: radar sweep → filter → connect
- No real map SDK — custom drawn for futuristic aesthetic

---

## 6. Visual Design

| Aspect | Choice |
|--------|--------|
| Theme | Dark mode, deep navy/charcoal background |
| Accent | Electric blue (#00D4FF) + emergency red (#FF3366) |
| Typography | Monospace for AI feed, clean sans-serif for UI |
| Style | Futuristic dashboard, minimal clutter |
| Animation | Smooth, purposeful — Framer Motion |
| Feel | "Mission control for pet emergencies" |

---

## 7. Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | React 18 + TypeScript | Component model, ecosystem |
| Build | Vite | Fast dev, instant HMR |
| Animation | Framer Motion | Declarative, performant |
| Map | Canvas API (custom) | No SDK dependency, full visual control |
| Styling | CSS Modules or Tailwind | Rapid iteration |
| Deploy | Vercel / GitHub Pages | One-click deploy for exhibition |

No backend. No real AI API calls. All simulation is client-side with timed sequences.

---

## 8. Social Value

- Improve pet emergency survival rates
- **Reduce reliance on black-market blood sources** — community-verified donors provide trusted, traceable blood supply, replacing unregulated and potentially unsafe channels
- Advance animal welfare
- Build mutual aid social structures

---

## 9. Project Essence

> PetPulse is not just a product.
> It is a system that **turns empathy into infrastructure**.
