# CombatExpert

CombatExpert is a community-centric prediction platform for combat sports fans, built on the Azuro Protocol. We bridge the gap between decentralized betting and social engagement by combining Azuro’s liquidity layer with native community features, including an expert ranking system, live event chat, and market-specific discussions.

## Overview

CombatExpert is a niche product for combat sports users rather than a generic sportsbook frontend.

- UFC and MMA-focused market discovery
- Community layer around live events and markets
- Retention features through rankings and user identity

## Why It Fits Azuro Affiliate Onboarding

CombatExpert is positioned as an Azuro affiliate product, not just a protocol demo.

- Azuro is used as the core betting and market layer
- The product targets a defined user niche: combat sports fans
- It adds engagement features beyond bet placement
- It is structured for deployment with runtime config and server-side secrets

## Core User Flow

1. Connect wallet
2. Browse UFC and MMA games
3. Select outcomes and build a betslip
4. Place bets through the Azuro-integrated flow
5. Track activity through My Bets, rankings, comments, and chat

## Azuro Integration

- `@azuro-org/sdk` is used for market and betting integration
- Affiliate configuration is served through `GET /api/public-config`
- The current setup is built around Polygon + USDT flows
- CombatExpert fetches preferred UFC and MMA games for a focused experience

Relevant files:

- [src/api/combatGames.ts](./src/api/combatGames.ts)
- [src/config/runtimeConfig.ts](./src/config/runtimeConfig.ts)
- [api/public-config.js](./api/public-config.js)
- [vite.config.ts](./vite.config.ts)

## Current Status

Implemented or in active progress:

- UFC/MMA game and market browsing
- Betslip and betting flow integration
- My Bets experience
- Live chat with Ably
- Market comments
- User profiles
- Rankings backed by Supabase

## Stack

React, TypeScript, Vite, Tailwind, Azuro SDK, Privy, wagmi, Ably, Supabase, and serverless API routes.

## Local Run

```bash
npm install
cp .env.example .env
npm run dev
```

Required configuration is listed in [`.env.example`](./.env.example).

## Live Experience

- Official Website: [combatexpert.xyz](https://combatexpert.xyz)

## Product Interface

<p align="center">
  <img src="https://github.com/user-attachments/assets/ef336813-b56f-4e3b-9058-9dd4386e0b50" width="32%" alt="Main Market Dashboard" />
  <img src="https://github.com/user-attachments/assets/482be3bc-2539-4ffd-92a2-5c46cc99e390" width="32%" alt="Expert Ranking System" />
  <img src="https://github.com/user-attachments/assets/9b3d8ba0-ce77-458a-888a-908e8f72c184" width="32%" alt="Community Chat & Social" />
</p>

## Contact

- Owner: `<Seongam>`
- Telegram: `<@LegendaryChoi>`
- Email: `<chitjddka11@gmail.com>`

## Developer Note

`@azuro-org/sdk-social-aa-connector` is intentionally aliased to a stable shim in [`vite.config.ts`](./vite.config.ts) to avoid SDK hook-order regressions. After SDK-related updates, verify with:

```bash
npm run guard:alias
npm run smoke:chain-hooks
```
