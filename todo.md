# 📝 StacksArena — Remaining TODO

> [!IMPORTANT]
> Items listed here are **genuinely incomplete**. Everything completed this session (17 unit tests passing, multi-sig `approve-vault`, penalty treasury routing, ABI sync, integration guide, balance display, micro-unit STX input) has been removed.

---

## 🚀 Deployment

- [x] **Mainnet Deployment Plan** — defined and documented the Clarinet deployment sequence for `ConditionEngine`, `CommitVault`, and `VaultFactory` in `smartcontract/deployments/default.mainnet-plan.yaml`. ✅

---

## 🛠 Smart Contract

- [ ] **BTC/SIP-010 Support** — Extend `CommitVault.clar` to support locking and tracking SIP-010 tokens (like sBTC or xBTC) in addition to native STX to align with the PRD.
- [x] **`approve-vault` hook wired to frontend** — implemented the `approveVault` hook in `use-contract.ts`. ✅
- [ ] **Milestone-Based Release** — `ConditionEngine.clar` has `evaluate-milestone` read-only logic but `CommitVault` has no `release-milestone` public function to trigger phased releases.
- [x] **Real target block calculation** — implemented `useBlockHeight` hook and updated `create/page.tsx` to calculate target blocks dynamically. ✅

---

## 🧪 Testing

- [ ] **Devnet Simulation** — run full user flow (Lock → Wait/mine blocks → Withdraw, and Lock → Approve → Withdraw) against a live Clarinet Devnet to catch edge cases not covered by Simnet unit tests.
- [ ] **Edge Case: zero-threshold vault** — verify the contract correctly rejects `threshold = 0`.
- [ ] **Security Audit** — review `withdraw` for double-spend edge cases when `approval-count` and block height are simultaneously at the boundary.

---

## 🎨 Frontend

- [ ] **Vault Dashboard `/vaults` page** — read on-chain vault state and display per-vault: balance, approval count, countdown to unlock, and action buttons (Approve / Withdraw).
- [ ] **`approve-vault` UI** — add a button on the vault detail/dashboard view to call the `approve-vault` function for multi-sig vaults.