# Turfgrass Capture

Turfgrass Capture is an offline-first field data collection app for consistent
turfgrass plot imagery. The mobile app records a photograph together with a UTC
timestamp, foreground GPS position and a short device-motion summary.

The project targets iOS and Android from one Expo and React Native TypeScript
codebase.

## Current Scope

- Capture a top-down turfgrass plot photograph.
- Request camera, foreground location and motion permissions.
- Copy photographs into application storage.
- Store exact GPS and IMU summary metadata in a local SQLite queue.
- Keep exact location private until a protected synchronization service is
  configured.

## Technology

- [Expo](https://docs.expo.dev/) SDK 56
- [React Native](https://reactnative.dev/) with TypeScript
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- SQLite for offline records

## Local Setup

Install Node.js `24.15.0` LTS, then run:

```bash
npm ci
npm run check
npm start
```

Camera, GPS and IMU testing should be performed on a physical iPhone or Android
device. Use an Expo development build for the complete native workflow:

```bash
npx eas-cli build --profile development --platform android
npx eas-cli build --profile development --platform ios
```

## Build Profiles

- `development`: internal development client.
- `preview`: installable internal test build.
- `production`: signed store build with automatic version increments.

## Data Protection

Exact GPS coordinates are sensitive research data. They must not be published
directly from a phone capture. See [docs/PRIVACY.md](docs/PRIVACY.md) before
adding upload or public export features.

## Project Status

This repository is an initial field-test build. The private upload service,
authentication, consent workflow and public dataset export remain separate
milestones.

## Licence

Source code is released under the [MIT Licence](LICENSE).
