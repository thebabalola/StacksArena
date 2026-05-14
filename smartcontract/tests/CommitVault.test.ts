import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

// Helper: create a standard vault from wallet1
function createVault(amount: bigint, blocksFromNow: number, penaltyRate: bigint, threshold: bigint) {
    const targetBlock = simnet.blockHeight + blocksFromNow;
    return simnet.callPublicFn(
        "CommitVault",
        "create-vault",
        [Cl.uint(amount), Cl.uint(targetBlock), Cl.uint(penaltyRate), Cl.uint(threshold)],
        wallet1
    );
}

// =====================================================
// Suite 1: Vault Creation
// =====================================================
describe("Vault Creation", () => {
    it("creates a vault and returns vault-id 0", () => {
        const result = createVault(1_000_000n, 10, 10n, 1n);
        expect(result.result).toBeOk(Cl.uint(0));
    });

    it("supports micro-unit amounts (e.g. 1 microSTX)", () => {
        const result = createVault(1n, 10, 0n, 1n);
        expect(result.result).toBeOk(Cl.uint(0));
    });

    it("increments vault-id on each creation", () => {
        createVault(1_000_000n, 10, 10n, 1n);
        const second = createVault(2_000_000n, 20, 5n, 1n);
        expect(second.result).toBeOk(Cl.uint(1));
    });

    it("rejects zero-amount vaults", () => {
        const result = simnet.callPublicFn(
            "CommitVault", "create-vault",
            [Cl.uint(0), Cl.uint(simnet.blockHeight + 10), Cl.uint(10n), Cl.uint(1n)],
            wallet1
        );
        expect(result.result).toBeErr(Cl.uint(400));
    });

    it("rejects target-block in the past", () => {
        const result = simnet.callPublicFn(
            "CommitVault", "create-vault",
            [Cl.uint(1_000_000n), Cl.uint(0), Cl.uint(10n), Cl.uint(1n)],
            wallet1
        );
        expect(result.result).toBeErr(Cl.uint(400));
    });

    it("rejects penalty-rate over 100", () => {
        const result = simnet.callPublicFn(
            "CommitVault", "create-vault",
            [Cl.uint(1_000_000n), Cl.uint(simnet.blockHeight + 10), Cl.uint(101n), Cl.uint(1n)],
            wallet1
        );
        expect(result.result).toBeErr(Cl.uint(400));
    });
});

// =====================================================
// Suite 2: Time-Lock Security
// =====================================================
describe("Time-Lock Security", () => {
    it("blocks withdrawal with ERR_VAULT_LOCKED before target block (penalty-rate=0)", () => {
        createVault(1_000_000n, 10, 0n, 1n); // no penalty = hard lock
        const result = simnet.callPublicFn(
            "CommitVault", "withdraw",
            [Cl.uint(0)],
            wallet1
        );
        expect(result.result).toBeErr(Cl.uint(403)); // ERR_VAULT_LOCKED
    });

    it("allows full withdrawal after target block is mined", () => {
        createVault(1_000_000n, 5, 10n, 1n);
        simnet.mineEmptyBlocks(5); // fast-forward to unlock

        const result = simnet.callPublicFn(
            "CommitVault", "withdraw",
            [Cl.uint(0)],
            wallet1
        );
        expect(result.result).toBeOk(Cl.bool(true));
    });

    it("vault shows balance 0 and is-active false after full withdrawal", () => {
        const vaultId = simnet.callPublicFn(
            "CommitVault", "create-vault",
            [Cl.uint(1_000_000n), Cl.uint(simnet.blockHeight + 5), Cl.uint(10n), Cl.uint(1n)],
            wallet1
        ).result;
        const vid = (vaultId as any).value.value;
        simnet.mineEmptyBlocks(5);
        simnet.callPublicFn("CommitVault", "withdraw", [Cl.uint(vid)], wallet1);

        const vault = simnet.callReadOnlyFn(
            "CommitVault", "get-vault-details",
            [Cl.uint(vid)], wallet1
        );
        const data = (vault.result as any).value.value;
        // Clarity SDK encodes bools as {type:'true'} or {type:'false'}
        expect(data["is-active"].type).toBe("false");
        expect(data["balance"].value).toBe(0n); // uint returned as BigInt after mutation
    });
});

// =====================================================
// Suite 3: Penalty Mechanics
// =====================================================
describe("Penalty Mechanics", () => {
    it("allows early withdrawal when penalty-rate > 0", () => {
        createVault(1_000_000n, 20, 10n, 1n); // 10% penalty
        const result = simnet.callPublicFn(
            "CommitVault", "withdraw",
            [Cl.uint(0)],
            wallet1
        );
        expect(result.result).toBeOk(Cl.bool(true));
    });

    it("deactivates vault after early withdrawal", () => {
        const vaultId = simnet.callPublicFn(
            "CommitVault", "create-vault",
            [Cl.uint(1_000_000n), Cl.uint(simnet.blockHeight + 20), Cl.uint(10n), Cl.uint(1n)],
            wallet1
        ).result;
        const vid = (vaultId as any).value.value;
        simnet.callPublicFn("CommitVault", "withdraw", [Cl.uint(vid)], wallet1);
        const vault = simnet.callReadOnlyFn(
            "CommitVault", "get-vault-details",
            [Cl.uint(vid)], wallet1
        );
        const data = (vault.result as any).value.value;
        // Clarity SDK encodes bools as {type:'true'} or {type:'false'}
        expect(data["is-active"].type).toBe("false");
    });
});

// =====================================================
// Suite 4: Unauthorized Access Prevention
// =====================================================
describe("Unauthorized Access Prevention", () => {
    it("prevents wallet2 from withdrawing wallet1's vault", () => {
        createVault(1_000_000n, 5, 10n, 1n);
        simnet.mineEmptyBlocks(5);

        const result = simnet.callPublicFn(
            "CommitVault", "withdraw",
            [Cl.uint(0)],
            wallet2 // not the owner
        );
        expect(result.result).toBeErr(Cl.uint(401)); // ERR_UNAUTHORIZED
    });

    it("returns ERR_NOT_FOUND for a non-existent vault", () => {
        const result = simnet.callPublicFn(
            "CommitVault", "withdraw",
            [Cl.uint(999)], // doesn't exist
            wallet1
        );
        expect(result.result).toBeErr(Cl.uint(404)); // ERR_NOT_FOUND
    });
});

// =====================================================
// Suite 5: Multi-Signature Approvals
// =====================================================
describe("Multi-Signature Approvals", () => {
    it("allows collecting approvals and unlocks after threshold met", () => {
        // Create a 1-of-1 multi-sig vault so wallet2 is the single approver
        const targetBlock = simnet.blockHeight + 20;
        simnet.callPublicFn(
            "CommitVault", "create-vault",
            [Cl.uint(1_000_000n), Cl.uint(targetBlock), Cl.uint(0n), Cl.uint(1n)],
            wallet1
        );

        // wallet2 approves (threshold 1 met)
        simnet.callPublicFn("CommitVault", "approve-vault", [Cl.uint(0)], wallet2);

        // Mine to unlock time-lock
        simnet.mineEmptyBlocks(20);

        // Owner withdraws - both conditions met (time + 1 approval >= threshold 1)
        const result = simnet.callPublicFn(
            "CommitVault", "withdraw",
            [Cl.uint(0)],
            wallet1
        );
        expect(result.result).toBeOk(Cl.bool(true));
    });

    it("prevents double-approval from the same address", () => {
        simnet.callPublicFn(
            "CommitVault", "create-vault",
            [Cl.uint(1_000_000n), Cl.uint(simnet.blockHeight + 10), Cl.uint(0n), Cl.uint(2n)],
            wallet1
        );
        simnet.callPublicFn("CommitVault", "approve-vault", [Cl.uint(0)], wallet2);

        const result = simnet.callPublicFn(
            "CommitVault", "approve-vault",
            [Cl.uint(0)],
            wallet2 // tries to approve again
        );
        expect(result.result).toBeErr(Cl.uint(409)); // ERR_ALREADY_APPROVED
    });

    it("blocks withdrawal when multi-sig threshold not met even after time-lock expires", () => {
        const targetBlock = simnet.blockHeight + 5;
        simnet.callPublicFn(
            "CommitVault", "create-vault",
            [Cl.uint(1_000_000n), Cl.uint(targetBlock), Cl.uint(0n), Cl.uint(2n)],
            wallet1
        );
        // Only 0 approvals, threshold is 2
        simnet.mineEmptyBlocks(5);

        const result = simnet.callPublicFn(
            "CommitVault", "withdraw",
            [Cl.uint(0)],
            wallet1
        );
        // Hard-locked (penalty=0), multi-sig not met
        expect(result.result).toBeErr(Cl.uint(403)); // ERR_VAULT_LOCKED
    });

    it("tracks approval status correctly", () => {
        simnet.callPublicFn(
            "CommitVault", "create-vault",
            [Cl.uint(1_000_000n), Cl.uint(simnet.blockHeight + 10), Cl.uint(0n), Cl.uint(2n)],
            wallet1
        );
        simnet.callPublicFn("CommitVault", "approve-vault", [Cl.uint(0)], wallet2);

        const approved = simnet.callReadOnlyFn(
            "CommitVault", "get-approval-status",
            [Cl.uint(0), Cl.principal(wallet2)],
            wallet1
        );
        expect(approved.result).toBeBool(true);

        // deployer has not approved
        const notApproved = simnet.callReadOnlyFn(
            "CommitVault", "get-approval-status",
            [Cl.uint(0), Cl.principal(deployer)],
            wallet1
        );
        expect(notApproved.result).toBeBool(false);
    });
});
