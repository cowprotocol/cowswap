# CoW Protocol - Website
This is the website for CoW Protocol 

![cow-protocol-twitter-header-background-4](https://user-images.githubusercontent.com/31534717/184152766-0f59452a-1971-4c3e-9417-e7ed59f9e0cf.png)

## Setup
```bash
# Install dependencies
pnpm install
```

## Dev server
```bash
# Run server
pnpm run dev
```

## Environment selection

`cow-fi` environment selection is configured explicitly via `NEXT_PUBLIC_ENVIRONMENT`.
Supported values are:

- `local`
- `development`
- `pr`
- `production`

Copy [`.env.example`](./.env.example) if you need a local starting point.

## Lint
```bash
# Run eslint
pnpm run lint
```


## Build
```bash
pnpm run build
```

# Run server
```bash
# Run app
pnpm run start
```

# Internationalization
```bash
# Extract internationalization literals from the code
pnpm run i18n:extract

# Generate JS files for the language file
pnpm run i18n:compile
```
