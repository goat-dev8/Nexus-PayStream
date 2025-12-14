import { createPublicClient, http, parseAbiItem } from 'viem';
import { polygon } from 'viem/chains';
import type { Announcement, DerivedKeys, ScanResult } from './types';
import { EXTERNAL_CONTRACTS, DEPLOYMENT } from '@/config/constants';
import { ERC5564AnnouncerABI } from '@/config/abis';

const publicClient = createPublicClient({
    chain: polygon,
    transport: http(import.meta.env.VITE_POLYGON_RPC_URL || 'https://polygon-rpc.com'),
});

/**
 * Scan for Announcement events from the ERC-5564 Announcer contract
 */
export async function scanAnnouncements(
    fromBlock: bigint = BigInt(DEPLOYMENT.startBlock),
    toBlock: bigint | 'latest' = 'latest'
): Promise<Announcement[]> {
    const logs = await publicClient.getLogs({
        address: EXTERNAL_CONTRACTS.ERC5564Announcer as `0x${string}`,
        event: parseAbiItem(
            'event Announcement(uint256 indexed schemeId, address indexed stealthAddress, address indexed caller, bytes ephemeralPubKey, bytes metadata)'
        ),
        fromBlock,
        toBlock,
    });

    return logs.map((log) => ({
        schemeId: log.args.schemeId!,
        stealthAddress: log.args.stealthAddress!,
        caller: log.args.caller!,
        ephemeralPubKey: log.args.ephemeralPubKey! as `0x${string}`,
        metadata: log.args.metadata! as `0x${string}`,
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
    }));
}

/**
 * Check if an announcement belongs to us using view tag optimization
 * Returns the stealth private key if it matches, null otherwise
 */
export function checkAnnouncement(
    announcement: Announcement,
    viewingPrivKey: `0x${string}`,
    spendingPrivKey: `0x${string}`
): `0x${string}` | null {
    // ERC-5564 check algorithm:
    // 1. Extract view tag from metadata
    // 2. Compute shared secret S = viewingPrivKey * ephemeralPubKey
    // 3. Compare view tag with keccak256(S)[0]
    // 4. If match, compute stealth privkey = spendingPrivKey + keccak256(S)
    // 5. Verify derived address matches announcement stealthAddress

    // Placeholder - in production implement full check
    // For now return null (no match)
    return null;
}

/**
 * Scan announcements and return matches for the merchant
 */
export async function scanForMerchant(
    keys: DerivedKeys,
    fromBlock?: bigint
): Promise<ScanResult[]> {
    const announcements = await scanAnnouncements(fromBlock);
    const results: ScanResult[] = [];

    for (const announcement of announcements) {
        const stealthPrivKey = checkAnnouncement(
            announcement,
            keys.viewingPrivKey,
            keys.spendingPrivKey
        );

        if (stealthPrivKey) {
            // Fetch USDC balance of stealth address
            // In production, batch these calls
            const balance = 0n; // Placeholder

            results.push({
                announcement,
                stealthPrivKey,
                balance,
            });
        }
    }

    return results;
}

/**
 * Get USDC balance of an address
 */
export async function getUSDCBalance(address: `0x${string}`): Promise<bigint> {
    const balance = await publicClient.readContract({
        address: EXTERNAL_CONTRACTS.USDC as `0x${string}`,
        abi: [
            {
                type: 'function',
                name: 'balanceOf',
                inputs: [{ name: 'account', type: 'address' }],
                outputs: [{ type: 'uint256' }],
                stateMutability: 'view',
            },
        ],
        functionName: 'balanceOf',
        args: [address],
    });

    return balance;
}
