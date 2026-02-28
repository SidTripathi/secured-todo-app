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

## Supported SDK

This project targets Expo SDK 52 only. The code, native modules, and build configuration are aligned with SDK 52; using a different Expo SDK may cause runtime or build incompatibilities.

If you need to upgrade the Expo SDK, follow Expo's official upgrade guide and test the app thoroughly.

## System specifications & minimum requirements

These are the minimum recommended specs for local development and running simulators/emulators. Real devices are recommended for biometric testing.

- macOS (for iOS development): macOS Monterey (12) or later. Xcode 14+ required for simulator and development builds.
- Windows / Linux (for Android development): Windows 10+ or a recent Ubuntu (20.04+) distribution.
- CPU: 64-bit, 4 cores (quad-core) or better.
- RAM: 8 GB minimum; 16 GB recommended for smooth emulators and toolchain.
- Disk: 5 GB free space for project and node modules; more required for emulators and native toolchains.
- Java: JDK 11+ for Android builds.
- Android: Android Studio with Android SDK (API level 31+) and emulator images.

Notes:
- Biometric authentication is best tested on physical devices; some simulators/emulators have limited or simulated biometric support.
- For iOS face/biometric testing you may need a development build (Expo dev client) rather than Expo Go.

## Install Node & npm (macOS)

Recommended: use `nvm` to manage Node versions (keeps global packages isolated and makes upgrades simple).

```bash
# Install nvm (if you don't have it)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
# Restart your shell, then install the latest LTS Node
nvm install --lts
nvm use --lts
# Verify
node -v
npm -v
```

Alternative via Homebrew:

```bash
brew install node
node -v
npm -v
```

Note: `npm` is bundled with Node—no separate install is required.

## Install Expo tooling

You can use `npx`/`npm`/`yarn` without installing the CLI globally, or install the Expo CLI globally for convenience.

Using `npx` (no global install required):

```bash
npx expo start
```

Global install (optional):

```bash
npm install --global expo-cli
# or with yarn
yarn global add expo-cli
# Verify
expo --version
```

For development builds (recommended for full biometric support on iOS) you may also install `eas-cli`:

```bash
npm install -g eas-cli
```

## Setup

```bash
cd secured-todo-app
npm install
```

### Alternative: Install with Yarn

```bash
cd secured-todo-app
yarn install
```

### Install Expo CLI (optional)

If you prefer the global Expo CLI (not required):

```bash
npm install --global expo-cli
# or
yarn global add expo-cli
```

## Run

```bash
npm start
```

Then press `i` for iOS or `a` for Android.  
**Note:** Biometric auth (e.g. Face ID) may require a **development build** on iOS; Expo Go has limitations. For full biometric testing, use a dev build: `npx expo prebuild` then run the native app.

### Run with Expo (recommended)

Start the Metro bundler using the npm script, then open the app with Expo Go or a development build:

```bash
npm start
# then in the Expo CLI choose to run on a simulator or scan the QR code with Expo Go
```

To run on a device or simulator directly:

```bash
# iOS simulator
npm run ios

# Android emulator
npm run android
```

If you used Yarn:

```bash
yarn start
yarn ios
yarn android
```

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
