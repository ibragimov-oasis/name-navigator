---
title: "CONTRIBUTING.md"
aliases: ["CONTRIBUTING"]
tags:
  - name-navigator
date: 2026-04-27
cssclasses:
  - enriched-document
---

# Contributing to Name Navigator

First off, thank you for considering contributing to Name Navigator! It's people like you that help keep cultural heritage alive in the digital age.

## 🌈 How Can I Contribute?

### 📖 Adding New Names
We are always looking to expand our cultural coverage. If you have a dataset of names from a minority or under-represented culture:
1. Create a new shard in `src/data/names/<culture>/`.
2. Follow the `ChildName` interface.
3. Submit a Pull Request.

### 🧩 Improving the Harmony Engine
If you are a linguist or developer with experience in phonetics:
- Help us refine the `calculateHarmony()` logic in `src/lib/nameHarmony.ts`.
- Add language-specific cases for patronymic generation.

### 🐞 Reporting Bugs
Use GitHub Issues to report technical bugs or etymological inaccuracies.

### 🧪 Data Integrity & Validation
All new name shards must pass the linting and formatting rules. We use a schema-based validation for the `ChildName` objects. Ensure your data follows the standardized cultural naming conventions established in our existing shards.

## 📜 Code of Conduct
We are committed to providing a welcoming and inspiring community for all. Please be respectful and inclusive in all interactions.

## 🛠 Setup for Development
1. Fork the repo.
2. `npm install`
3. `npm run test` (Verify all linguistic logic passes)
4. Create a feature branch.

*Let's build the future of linguistic identity together!*
