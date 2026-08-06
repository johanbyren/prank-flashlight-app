# 🎨 Design Guide - iOS-Inspirerad Prank Ficklampa

## Översikt

Appen har nu en professionell, iOS-inspirerad design som efterliknar Apple's egna ficklampsapp med moderna blur-effekter och eleganta animationer.

## 🌟 Designelement

### Färgschema

**Mörkt tema (Standard):**
- Bakgrund: Svart gradient (#000000 → #1a1a1a)
- Text: Vit (#ffffff) med varierande opacity
- Aktiv knapp: Vit glow-effekt
- Ficklampa tänd: Gul (#FFE066) med glow

**När lampan är tänd:**
- Bakgrunden blir något ljusare (#1a1a1a → #2d2d2d)
- Ficklampikonen lyser gult
- Pulserade glow-animationer

### Huvudkomponenter

#### 1. Ficklampikon
```
┌─────────────────┐
│   Glow Effect   │  ← Pulsande animation när tänd
│  ┌──────────┐   │
│  │   Topp   │   │  ← Lyser gult när tänd
│  │          │   │
│  │   Kropp  │   │  ← Grå/mörkgrå
│  └──────────┘   │
└─────────────────┘
```

**Detaljer:**
- Storlek: 120x140 px
- Topp: 60x30 px med gul glow när tänd
- Kropp: 60x100 px, mörkgrå (#4a4a4a)
- Glow animation: 1.5s loop, scale 1.0-1.2

#### 2. Status Text
- Text: "TÄND" eller "SLÄCKT"
- Font: 18px, bold, 70% opacity
- Letter spacing: 3px
- Färg: Vit

#### 3. Kontrollknappar (ON/OFF)

**Layout:**
```
┌──────────┐    ┌──────────┐
│    ON    │    │   OFF    │
│  Gratis  │    │  200 kr  │
└──────────┘    └──────────┘
```

**Design-specifikation:**
- Form: Cirklar, 150x150 px
- BlurView: iOS-stil frosted glass effekt
- Border: Subtle vit border (opacity 0.1-0.3)
- Gap mellan knappar: 20px

**States:**

*Inaktiv knapp (60% opacity):*
- Border: rgba(255, 255, 255, 0.1)
- Ingen shadow

*Aktiv knapp (100% opacity):*
- Border: rgba(255, 255, 255, 0.3)
- Vit shadow (shadowRadius: 10)
- Elevated appearance

*Disabled:*
- Inte klickbar
- Visuellt samma som inaktiv

**Knappinnehåll:**
```
┌─────────────────┐
│       ON        │  ← 28px, bold, letter-spacing: 2
│     Gratis      │  ← 14px, 80% opacity
└─────────────────┘
```

#### 4. Hint Text
- Visar bara när lampan är tänd
- Bakgrund: rgba(255, 255, 255, 0.1)
- Padding: 12px vertical, 20px horizontal
- Border radius: 20px
- Text: "💡 Lampan lyser starkt"

## 🎭 Animationer

### 1. Glow Animation
**När lampan tänds:**
```javascript
Loop (3 sekunder total):
  Fade in & Scale up (1.5s): opacity 0.3→0.8, scale 1.0→1.2
  Fade out & Scale down (1.5s): opacity 0.8→0.3, scale 1.2→1.0
```

### 2. Button Press
- activeOpacity: 0.7
- Smooth touch feedback

### 3. State Transitions
- Gradient background animeras mellan states
- Icon glow fadear in/out smoothly
- Status text uppdateras instantly

## 📱 Layout & Spacing

```
┌─────────────────────────────────┐
│          Status Bar             │
│                                 │
│       (Flexspace - 1)           │
│                                 │
│     ┌─────────────┐            │
│     │  Flashlight │            │  ← Icon med glow
│     │    Icon     │            │
│     └─────────────┘            │
│                                 │
│         TÄND/SLÄCKT            │  ← Status text
│                                 │
│   ┌─────────┐  ┌─────────┐   │
│   │   ON    │  │   OFF   │   │  ← Control buttons
│   │ Gratis  │  │ 200 kr  │   │
│   └─────────┘  └─────────┘   │
│                                 │
│    💡 Lampan lyser starkt      │  ← Hint (if on)
│                                 │
│       (Flexspace - 1)           │
│                                 │
└─────────────────────────────────┘
```

**Spacing:**
- Padding horizontal: 30px
- Icon → Status: 60px
- Status → Buttons: 50px
- Buttons → Hint: 20px
- Button gap: 20px

## 🎨 Visual Effects

### BlurView (iOS Frosted Glass)
```javascript
<BlurView 
  intensity={80}
  tint="dark"
/>
```
- Ger djup och dimension
- Modern iOS-känsla
- Fungerar över gradients

### LinearGradient
```javascript
// Off state
colors: ['#000000', '#1a1a1a', '#000000']

// On state  
colors: ['#1a1a1a', '#2d2d2d', '#1a1a1a']
```

### Shadow Effects

**Button Shadow (aktiv):**
```javascript
shadowColor: '#ffffff'
shadowOffset: { width: 0, height: 0 }
shadowOpacity: 0.3
shadowRadius: 10
elevation: 8  // Android
```

**Icon Glow (tänd):**
```javascript
shadowColor: '#FFE066'
shadowOffset: { width: 0, height: 0 }
shadowOpacity: 1
shadowRadius: 20
elevation: 10
```

## 🔄 User Flow

### 1. Initial State
```
Background: Dark gradient
Flashlight: Off (grå)
Status: "SLÄCKT"
ON button: 60% opacity
OFF button: 100% opacity (aktiv men disabled)
```

### 2. User trycker ON
```
→ Flashlight tänds
→ Icon blir gul med glow
→ Glow animation startar
→ Status: "TÄND"
→ ON button: 100% opacity (aktiv, disabled)
→ OFF button: 60% opacity (klickbar)
→ Hint visas: "💡 Lampan lyser starkt"
```

### 3. User trycker OFF
```
→ Alert dyker upp: "Släck ficklampa"
   "För att släcka ficklampan behöver du 
    betala en liten avgift på 200 kr 😈"
   
   [Avbryt]  [Betala 200 kr]
```

### 4. User väljer "Betala"
```
→ OFF button visar "Laddar..."
→ Backend anrop för Payment Intent
→ Stripe Payment Sheet öppnas
→ User anger kort (test: 4242...)
→ Betalning processas
```

### 5. Betalning Lyckad
```
→ Alert: "💰 Betalning mottagen!"
   "Tack för dina pengar! Lampan släcks nu. 😂"
   
   [OK]
   
→ Flashlight släcks
→ Tillbaka till Initial State
```

## 🎯 Design Principer

### 1. Minimalism
- Endast nödvändiga element
- Ren, mörk bakgrund
- Fokus på funktionalitet

### 2. iOS-Inspiration
- Frosted glass blur
- Cirkulära knappar
- Subtle shadows och glows
- Smooth animations

### 3. Visual Hierarchy
1. Flashlight icon (huvudfokus)
2. Status text (tydlig state)
3. Control buttons (handlingsbara)
4. Hint text (sekundär info)

### 4. Feedback
- Immediate visual response
- Animations för state changes
- Clear disabled states
- Haptic-ready design (kan läggas till)

## 📐 Responsive Design

Designen anpassar sig till:
- iPhone (alla storlekar)
- iPad (med tablet support)
- Android telefoner
- Android tablets

**Key responsive elements:**
- Flexbox layout anpassar sig automatiskt
- Fixed sizes för viktigaste element (buttons, icon)
- Padding scales med skärmstorlek

## 🔮 Framtida Förbättringar

### Möjliga tillägg:
1. **Haptic Feedback** - Vibration vid button press
2. **Brightness slider** - Justera ficklampans styrka
3. **3D Touch** - Quick actions på icon
4. **Widgets** - iOS/Android widget support
5. **Dark Mode toggle** - Ljust tema (men mörkt är bäst)
6. **Custom icons** - Olika flashlight designs
7. **Sound effects** - Subtila ljud för ON/OFF
8. **Gestures** - Swipe för ON/OFF

## 💡 Design Tips

### För att behålla iOS-känslan:
- Använd aldrig starka, saturerade färger
- Håll allt subtilt och elegant
- Mindre är mer
- Smooth transitions alltid
- Konsistent spacing

### För bästa prank-effekt:
- Designen ska se "legit" ut
- Inga uppenbara prank-hints
- Professionellt utseende bygger förtroende
- OFF-knappen ska se normal ut (200 kr text är liten)

## 🎨 Färgpalett

```css
/* Backgrounds */
--black: #000000
--dark-gray: #1a1a1a
--medium-gray: #2d2d2d

/* Elements */
--flashlight-body: #4a4a4a
--flashlight-top: #5a5a5a
--flashlight-on: #FFE066

/* UI Elements */
--white: #ffffff
--white-10: rgba(255, 255, 255, 0.1)
--white-30: rgba(255, 255, 255, 0.3)
--white-70: rgba(255, 255, 255, 0.7)
--white-80: rgba(255, 255, 255, 0.8)

/* Shadows & Glows */
--glow-yellow: #FFE066
--shadow-white: #ffffff
```

---

**Designat med 🎨 och inspiration från iOS**

**Tekniker:** React Native, Expo, LinearGradient, BlurView, Animated API
**Style:** Minimalistisk, iOS-inspirerad, Modern
**Mål:** Professionell look som bygger förtroende innan pranket! 😈
