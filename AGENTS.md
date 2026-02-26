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

All service files in `src/services/` have `USE_MOCK = true`. Data is served from in-memory mocks so no backend / database / API keys are required for local development. The `cloudbase.ts` file is a mock stub; the original `@cloudbase/adaptor` import was replaced to avoid build errors.

### Linting and type-checking

```bash
npx eslint . --ext .ts,.tsx      # lint (TS files only; JS cloud functions have pre-existing warnings)
npx tsc --noEmit                  # type-check (pre-existing errors in services/*.ts due to cloudbase mock returning void)
```

### Project structure

- `src/screens/` — 15 screens (Home, PropertyList/Detail/Add/Edit, TaxCenter/Detail/Consultation, DocumentList/Detail/Add, PolicyList/Detail, Chat, Profile)
- `src/services/` — 7 service files (cloudbase, property, tax, document, policy, chat, user, rental) all with mock data
- `src/types/index.ts` — All TypeScript type definitions
- `cloudbase/functions/` — 6 serverless cloud functions (Node.js, not used in local dev)
