# 📝 Stacks Arena Development TODO

> [!IMPORTANT]
> This document tracks the pending tasks and technical requirements for the **Stacks Arena** project as it transitions to a Bitcoin-native vault protocol.

## 🚀 Phase 1: Core Protocol Development
- [x] **Unit Tests**: Created 17 tests in `smartcontract/tests/CommitVault.test.ts` — all passing.
- [ ] **Mainnet Deployment Plan**: Define the deployment sequence for the new Clarity contracts.

## 🖥️ Frontend Integration
(Phase Complete)

## 🛠 Maintenance & Documentation
- [x] **Sync ABIs**: Contract function names and signatures exported to `frontend/lib/constants/contracts.ts`.
- [x] **User Guide**: Finalized `stacks-frontend-integration-guide.md` with vault-specific examples.
- [ ] **Security Audit**: Perform a deep dive into the Clarity logic to ensure funds cannot be unlocked prematurely.

## 🧪 Testing & Validation
- [x] **Unit Tests**: 17/17 passing — time-lock, penalty, multi-sig, unauthorized access.
- [ ] **Devnet Simulation**: Run full user flows (Lock -> Wait/Penalty -> Withdraw) on a local Devnet.
- [ ] **Edge Case Testing**: Verify behavior for multi-sig approvals and milestone releases.

## ✅ Phase B Completed
- [x] Multi-Sig `approve-vault` function implemented in `CommitVault.clar`
- [x] Penalty routed to `protocol-treasury` (not contract self)
- [x] Input validation (amount > 0, valid penalty rate 0-100, threshold >= 1)