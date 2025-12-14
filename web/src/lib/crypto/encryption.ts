/**
 * AES-GCM Encryption utilities for invoice data
 * All encryption happens client-side, no plaintext on-chain
 */

/**
 * Generate a random encryption key
 */
export async function generateEncryptionKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true, // extractable
        ['encrypt', 'decrypt']
    );
}

/**
 * Export a CryptoKey to hex string for storage
 */
export async function exportKey(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('raw', key);
    return Array.from(new Uint8Array(exported))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Import a hex string back to CryptoKey
 */
export async function importKey(hexKey: string): Promise<CryptoKey> {
    const keyBytes = new Uint8Array(
        hexKey.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );
    return crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypt invoice data using AES-GCM
 */
export async function encryptInvoice(
    data: object,
    key: CryptoKey
): Promise<{ ciphertext: string; iv: string }> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(JSON.stringify(data));

    const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encodedData
    );

    return {
        ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
        iv: btoa(String.fromCharCode(...iv)),
    };
}

/**
 * Decrypt invoice data using AES-GCM
 */
export async function decryptInvoice<T = object>(
    ciphertext: string,
    iv: string,
    key: CryptoKey
): Promise<T> {
    const ciphertextBytes = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
    const ivBytes = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));

    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBytes },
        key,
        ciphertextBytes
    );

    const decoded = new TextDecoder().decode(decrypted);
    return JSON.parse(decoded) as T;
}

/**
 * Derive an encryption key from a wallet signature
 * Uses HKDF for key derivation
 */
export async function deriveKeyFromSignature(
    signature: `0x${string}`,
    salt: string = 'nexus-paystream-invoice'
): Promise<CryptoKey> {
    const signatureBytes = new Uint8Array(
        signature.slice(2).match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );

    // Import signature as key material
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        signatureBytes,
        'HKDF',
        false,
        ['deriveKey']
    );

    // Derive AES-GCM key using HKDF
    return crypto.subtle.deriveKey(
        {
            name: 'HKDF',
            hash: 'SHA-256',
            salt: new TextEncoder().encode(salt),
            info: new TextEncoder().encode('aes-gcm-key'),
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

export interface EncryptedInvoiceData {
    ciphertext: string;
    iv: string;
    keyHint?: string; // Optional hint about which key to use
}

export interface InvoiceDetails {
    description: string;
    items?: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    notes?: string;
    customerEmail?: string;
    dueDate?: string;
}
