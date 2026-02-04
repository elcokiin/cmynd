# @elcokiin/config

Shared TypeScript configuration for the monorepo.

## Overview

This package contains the base TypeScript configuration that all other packages extend. It ensures consistent compiler options and type-checking behavior across the monorepo.

## Structure

```
packages/config/
├── tsconfig.base.json   # Base TypeScript configuration
└── package.json
```

## Usage

Extend the base configuration in your package's `tsconfig.json`:

```json
{
  "extends": "@elcokiin/config/tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

## Base Configuration

The base configuration includes:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ESNext"],
    "verbatimModuleSyntax": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["node"]
  }
}
```

## Key Settings

| Setting | Value | Purpose |
|---------|-------|---------|
| `strict` | `true` | Enable all strict type checks |
| `noUncheckedIndexedAccess` | `true` | Add `undefined` to index signatures |
| `noUnusedLocals` | `true` | Error on unused local variables |
| `noUnusedParameters` | `true` | Error on unused parameters |
| `verbatimModuleSyntax` | `true` | Enforce explicit type imports |
| `moduleResolution` | `bundler` | Modern bundler resolution |
