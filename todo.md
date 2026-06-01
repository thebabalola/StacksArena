# 📝 StacksArena — Remaining TODO

> [!IMPORTANT]
> Items listed here are **genuinely incomplete**. All recently completed tasks (BTC/SIP-010 support, Milestone releases, Vault Dashboard, and multi-sig UI) have been removed.

---

## 🚀 Deployment (Completed ✅)

- [x] **Mainnet Deployment** — Contracts are live on Stacks Mainnet.
- [x] **Contract Verification** — All core contracts verified on Stacks Explorer.

---

## 🧪 Testing

- [ ] **Devnet Simulation** — run full user flow (Lock → Wait/mine blocks → Withdraw, and Lock → Approve → Withdraw) against a live Clarinet Devnet to catch edge cases not covered by Simnet unit tests.
- [x] **Security Audit** — review `withdraw` for double-spend edge cases when `approval-count` and block height are simultaneously at the boundary.

---

## 🎨 Frontend

- [ ] **Mobile Optimization** — ensure the Arena Dashboard is fully responsive for Xverse mobile users.
