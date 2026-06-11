# Cinema App (quasar-project)

Frontend Vue + Quasar com JSON Server como backend.

## Como rodar

Terminal 1 — API:

```bash
cd json-server
npm install
npm start
```

Terminal 2 — Frontend:

```bash
cd quasar-project
npm install
npm run dev
```

A API roda em `http://localhost:3000`. O frontend usa a variavel `VITE_API_URL` do arquivo `.env`.

## Install the dependencies

```bash
pnpm install
# or: yarn/npm/bun install
```

### Start the app in development mode (HMR, error reporting, etc.)

```bash
quasar dev
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
