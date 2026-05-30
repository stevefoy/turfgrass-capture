# Contributing

## Development Workflow

1. Create a branch from `main`.
2. Keep changes focused on one feature or fix.
3. Run `npm run check`.
4. Open a pull request and describe any effect on captured data or permissions.

## Engineering Rules

- Treat exact GPS coordinates as private data.
- Avoid background location tracking unless a reviewed use case requires it.
- Add a schema migration when changing persisted capture records.
- Test camera and sensor changes on a physical iPhone or Android device.
- Keep public export logic separate from raw data storage.
