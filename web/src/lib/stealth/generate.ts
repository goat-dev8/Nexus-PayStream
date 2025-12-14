import { keccak256, toBytes, bytesToHex, hexToBytes } from 'viem';
import type { StealthMetaAddress, StealthAddress, DerivedKeys } from './types';

/**
 * Parse a stealth meta-address from bytes
 * Format: 0x04 || spendingPubKey (64 bytes) || viewingPubKey (64 bytes)
 */
export function parseStealthMetaAddress(metaAddressBytes: `0x${string}`): StealthMetaAddress {
    const bytes = hexToBytes(metaAddressBytes);

    if (bytes.length < 129) {
        throw new Error('Invalid stealth meta-address: too short');
    }

    // Skip the 0x04 prefix (uncompressed point indicator)
    const spendingPubKey = bytesToHex(bytes.slice(1, 65)) as `0x${string}`;
    const viewingPubKey = bytesToHex(bytes.slice(65, 129)) as `0x${string}`;

    return {
        spendingPubKey: `0x04${spendingPubKey.slice(2)}` as `0x${string}`,
        viewingPubKey: `0x04${viewingPubKey.slice(2)}` as `0x${string}`,
    };
}

/**
 * Encode a stealth meta-address to bytes
 */
export function encodeStealthMetaAddress(metaAddress: StealthMetaAddress): `0x${string}` {
    // Remove 0x04 prefix from both keys and concatenate
    const spendingBytes = metaAddress.spendingPubKey.slice(4);
    const viewingBytes = metaAddress.viewingPubKey.slice(4);

    return `0x04${spendingBytes}${viewingBytes}` as `0x${string}`;
}

/**
 * Generate a random ephemeral keypair
 * In production, use a proper crypto library
 */
export function generateEphemeralKeyPair(): {
    privateKey: `0x${string}`;
    publicKey: `0x${string}`;
} {
    // Generate 32 random bytes for private key
    const privateKeyArray = new Uint8Array(32);
    crypto.getRandomValues(privateKeyArray);
    const privateKey = bytesToHex(privateKeyArray) as `0x${string}`;

    // In real implementation, derive public key using secp256k1
    // For now, return a placeholder
    const publicKey = `0x04${'00'.repeat(64)}` as `0x${string}`;

    return { privateKey, publicKey };
}

/**
 * Compute a view tag from shared secret
 * viewTag = first byte of keccak256(sharedSecret)
 */
export function computeViewTag(sharedSecret: `0x${string}`): number {
    const hash = keccak256(sharedSecret);
    return parseInt(hash.slice(2, 4), 16);
}

/**
 * Generate a stealth address from a meta-address
 * 
 * ERC-5564 Algorithm:
 * 1. Generate ephemeral key pair (r, R = r*G)
 * 2. Compute shared secret S = r * viewingPubKey
 * 3. Compute view tag from S
 * 4. Compute stealth public key P = spendingPubKey + keccak256(S) * G
 * 5. Derive stealth address from P
 */
export function generateStealthAddress(
    metaAddress: StealthMetaAddress
): StealthAddress {
    const { privateKey: ephemeralPrivKey, publicKey: ephemeralPubKey } = generateEphemeralKeyPair();

    // In a real implementation:
    // 1. Compute shared secret using ECDH: S = ephemeralPrivKey * viewingPubKey
    // 2. Compute viewTag = keccak256(S)[0]
    // 3. Compute stealth pubkey = spendingPubKey + keccak256(S) * G
    // 4. Derive address from stealth pubkey

    // Placeholder for demo - in production use noble-secp256k1 or similar
    const mockStealthAddress = keccak256(
        `0x${ephemeralPubKey.slice(2)}${metaAddress.spendingPubKey.slice(2)}`
    ).slice(0, 42) as `0x${string}`;

    const viewTag = computeViewTag(ephemeralPubKey);

    return {
        address: mockStealthAddress,
        ephemeralPubKey,
        viewTag,
    };
}

/**
 * Derive stealth keys from a wallet signature
 * Uses domain separation for security
 */
export async function deriveStealthKeysFromSignature(
    signature: `0x${string}`,
    domain: string
): Promise<DerivedKeys> {
    // Domain-separated key derivation
    const spendingEntropy = keccak256(
        toBytes(`${signature}:spending:${domain}`)
    );
    const viewingEntropy = keccak256(
        toBytes(`${signature}:viewing:${domain}`)
    );

    // In production, derive proper EC keypairs from entropy
    // Placeholder implementation
    return {
        spendingPrivKey: spendingEntropy,
        viewingPrivKey: viewingEntropy,
        spendingPubKey: `0x04${'00'.repeat(64)}` as `0x${string}`,
        viewingPubKey: `0x04${'00'.repeat(64)}` as `0x${string}`,
    };
}
