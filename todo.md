# 📝 Stacks Arena Development TODO

> [!IMPORTANT]
> This document tracks the pending tasks and technical requirements for the **Stacks Arena** project as it transitions to a Bitcoin-native vault protocol.

## 🚀 Phase 1: Core Protocol Development
- [x] **Contract Refactor**: Rewrite `smartcontract/contracts/` to implement the vault logic described in the PRD.
    - [x] `VaultFactory.clar`: Creation logic for new vault instances.
    - [x] `CommitVault.clar`: Core locking, penalty, and withdrawal logic.
    - [x] `ConditionEngine.clar`: Rule evaluation logic.
- [ ] **Unit Tests**: Create new tests in `smartcontract/tests/` to validate vault security and lock conditions.
- [ ] **Mainnet Deployment Plan**: Define the deployment sequence for the new Clarity contracts.

## 🖥️ Frontend Integration
- [ ] **Vault Management Dashboard**: Replace the gaming arena UI with a clean interface for creating and monitoring vaults.
- [ ] **Clarity Integration**: Update `frontend/lib/hooks/` to interact with the new vault contracts.
- [ ] **Visual Progress Indicators**: Implement countdowns and lock-status visualizations.

## 🛠 Maintenance & Documentation
- [ ] **Sync ABIs**: Export and sync the new contract ABIs once refactored.
- [ ] **User Guide**: Finalize the `stacks-frontend-integration-guide.md` with vault-specific examples.
- [ ] **Security Audit**: Perform a deep dive into the Clarity logic to ensure funds cannot be unlocked prematurely.

## 🧪 Testing & Validation
- [ ] **Devnet Simulation**: Run full user flows (Lock -> Wait/Penalty -> Withdraw) on a local Devnet.
- [ ] **Edge Case Testing**: Verify behavior for multi-sig approvals and milestone releases.