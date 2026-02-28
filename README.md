# Secured TODO – React Native (Expo)

A minimal **secured TODO list** app built with **Expo** and **expo-local-authentication**. The app requires device authentication (biometrics or passcode) before the user can add, update, or delete items.

## What this demonstrates

- **Code quality / architecture**: React Context + useReducer for state, clear separation of types, context, hooks, and components.
- **UI/UX**: Simple dark theme, auth gate screen, and straightforward list + add flow.
- **Expo**: Uses Expo SDK and the `expo-local-authentication` module for biometric/passcode auth.
- **Third-party / native**: Integration with native auth via Expo’s local-authentication API.
- **Problem approach**: Auth required before any mutation; state updates in one place (reducer); comments in code for review.

## Requirements

- Node.js 18+
- npm, yarn, or pnpm
- iOS Simulator / Android Emulator or a physical device (biometrics work best on device or supported simulators)

## Setup

```bash
cd secured-todo-app
npm install
```

## Run

```bash
npm start
```

Then press `i` for iOS or `a` for Android.  
**Note:** Biometric auth (e.g. Face ID) may require a **development build** on iOS; Expo Go has limitations. For full biometric testing, use a dev build: `npx expo prebuild` then run the native app.

## Tests

```bash
npm test
```

Tests cover:

- **Todo reducer**: ADD, TOGGLE, UPDATE, DELETE, SET_ITEMS, and unknown action.
- **useLocalAuth hook**: Success path, no hardware, and user cancel (with mocked `expo-local-authentication`).

## Project structure

```
secured-todo-app/
├── App.tsx                 # Entry: TodoProvider + AuthGate
├── src/
│   ├── types/
│   │   └── todo.ts         # TodoItem type
│   ├── context/
│   │   └── TodoContext.tsx # State (useReducer) + add/toggle/update/delete
│   ├── hooks/
│   │   └── useLocalAuth.ts # expo-local-authentication wrapper
│   └── components/
│       ├── AuthGate.tsx    # Unlock screen; shows TodoList after auth
│       ├── TodoList.tsx    # Add input + list; gates mutations with auth
│       └── TodoItem.tsx    # Single row: toggle, edit, delete (all auth-gated)
├── __tests__/
│   ├── todoReducer.test.ts
│   └── useLocalAuth.test.ts
├── app.json
├── package.json
├── tsconfig.json
├── babel.config.js
└── jest.config.js
```

## Flow

1. **Launch** → `AuthGate` is shown. User taps “Unlock” → system biometric/passcode prompt.
2. **After success** → `TodoList` is shown. User can add tasks (each add triggers auth).
3. **Toggle / Edit / Delete** → Each action runs through the same auth flow before performing the mutation.

State is held in React Context and updated only via the reducer; no direct mutations.

## Optional: add app icon and splash

Add under `assets/`:

- `icon.png` (e.g. 1024×1024)
- `splash-icon.png`
- `adaptive-icon.png` (Android)

Then in `app.json` you can point `icon`, `splash.image`, and `android.adaptiveIcon.foregroundImage` to these files.
