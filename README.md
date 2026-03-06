# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Azuro AA Connector Note

- `@azuro-org/sdk-social-aa-connector` is aliased to `src/azuroSdkSocialAaConnectorShim.ts` in `vite.config.ts`.
- Do not alias it to app-level hooks (`src/azuroSocialAaConnector.ts`) for SDK usage.
- Reason: the Azuro SDK dynamically imports this module inside `ChainProvider`; changing hook shape here can trigger React hook-order runtime errors.

### SDK Update Checklist

1. After changing `@azuro-org/sdk` or related auth packages, run `npm run dev`.
2. Hard reload once and verify there is no `React has detected a change in the order of Hooks called by ChainProvider`.
3. Verify there is no follow-up runtime error like `Cannot read properties of undefined (reading 'length')`.
4. Run `npm run guard:alias` to ensure the SDK AA connector alias still points to the shim.
5. Run `npm run smoke:chain-hooks` to catch ChainProvider hook-order console regressions.

## Runtime Env Security

- Client code no longer reads `VITE_*` secrets.
- Public runtime config is served from `GET /api/public-config`.
- Ably auth token requests are served from `GET|POST /api/ably-token`.

### Required server env vars

```bash
AFFILIATE=0x0000000000000000000000000000000000000000
RPC_URL=https://polygon-rpc.com
WALLETCONNECT_PROJECT_ID=...
PRIVY_APP_ID=...
ABLY_API_KEY=...
ABLY_CHANNEL=chat:ufc:live
```

For Vercel, set these variables in Project Settings -> Environment Variables.
