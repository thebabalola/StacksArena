# 📝 Stacks Arena Development TODO

> [!IMPORTANT]
> This document tracks the pending tasks and technical requirements for the **Stacks Arena** project as it transitions to a Bitcoin-native vault protocol.

## 🚀 Phase 1: Core Protocol Development
- [ ] **Contract Refactor**: Rewrite `smartcontract/contracts/` to implement the vault logic described in the PRD.
    - [ ] `VaultFactory.clar`: Creation logic for new vault instances.
    - [ ] `CommitVault.clar`: Core locking, penalty, and withdrawal logic.
    - [ ] `ConditionEngine.clar`: Rule evaluation logic.
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



=============

3. Roadmap & TODO
[NEW] StacksArena/todo.md: Created a comprehensive task list for the transition, including:
Refactoring Clarity contracts to implement vault logic.
Updating frontend hooks for lock-condition evaluation.
Implementing visual progress indicators for the dashboard.