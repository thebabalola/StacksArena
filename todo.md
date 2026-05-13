# 📝 Stacks Arena Development TODO

> [!IMPORTANT]
> This document tracks the pending tasks and technical requirements for the **Stacks Arena** project as it transitions to a Bitcoin-native vault protocol.

## 🚀 Phase 1: Core Protocol Development
- [ ] **Unit Tests**: Create new tests in `smartcontract/tests/` to validate vault security and lock conditions.
- [ ] **Mainnet Deployment Plan**: Define the deployment sequence for the new Clarity contracts.

## 🖥️ Frontend Integration
(Phase Complete)

## 🛠 Maintenance & Documentation
- [ ] **Sync ABIs**: Export and sync the new contract ABIs once refactored.
- [ ] **User Guide**: Finalize the `stacks-frontend-integration-guide.md` with vault-specific examples.
- [ ] **Security Audit**: Perform a deep dive into the Clarity logic to ensure funds cannot be unlocked prematurely.

## 🧪 Testing & Validation
- [ ] **Devnet Simulation**: Run full user flows (Lock -> Wait/Penalty -> Withdraw) on a local Devnet.
- [ ] **Edge Case Testing**: Verify behavior for multi-sig approvals and milestone releases.