# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

房产大师 (Fangdai Master) — a React Native (Expo SDK 52) mobile app for overseas Chinese to manage real-estate and taxes. The backend is entirely serverless on Tencent CloudBase; local development only requires the frontend.

### Running the app

Standard commands are in `README.md` (install: `npm install`, dev: `npx expo start`). For Cloud Agent environments without mobile emulators, use **web mode**:

```
npx expo start --web --port 8081
```

The app opens at `http://localhost:8081`.

### Mock mode

The service layer (`src/services/property.ts`) has `USE_MOCK = true`. All data is served from in-memory mocks so no backend / database / API keys are required for local development.

### Linting and type-checking

```bash
npx eslint . --ext .ts,.tsx      # lint (TS files only; JS cloud functions have pre-existing warnings)
npx tsc --noEmit                  # type-check
```

### Known pre-existing issues

- `src/services/cloudbase.ts` imports from `@cloudbase/adaptor` (non-existent package). This never runs locally because mock mode is active.
- `src/services/tax.ts` is referenced by `PropertyDetailScreen` and `TaxCenterScreen` but does not exist yet. Those screens are not wired into the navigator, so the app still starts.
- TypeScript reports errors for the above missing modules. These are pre-existing and do not block development.
