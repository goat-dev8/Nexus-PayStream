// ERC-5564 Stealth Address Types

export interface StealthMetaAddress {
    spendingPubKey: `0x${string}`;
    viewingPubKey: `0x${string}`;
}

export interface StealthAddress {
    address: `0x${string}`;
    ephemeralPubKey: `0x${string}`;
    viewTag: number;
}

export interface Announcement {
    schemeId: bigint;
    stealthAddress: `0x${string}`;
    caller: `0x${string}`;
    ephemeralPubKey: `0x${string}`;
    metadata: `0x${string}`;
    blockNumber: bigint;
    transactionHash: `0x${string}`;
}

export interface DerivedKeys {
    spendingPrivKey: `0x${string}`;
    viewingPrivKey: `0x${string}`;
    spendingPubKey: `0x${string}`;
    viewingPubKey: `0x${string}`;
}

export interface ScanResult {
    announcement: Announcement;
    stealthPrivKey: `0x${string}`;
    balance: bigint;
}

// ERC-5564 scheme ID for secp256k1
export const SCHEME_ID = 1n;
