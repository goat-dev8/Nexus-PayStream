import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { CONTRACTS, EXTERNAL_CONTRACTS } from '@/config/constants';
import {
    MerchantRegistryABI,
    InvoiceRegistryABI,
    TreasuryVaultABI,
    ERC20ABI
} from '@/config/abis';

// Hook to get USDC balance
export function useUSDCBalance(address?: `0x${string}`) {
    return useReadContract({
        address: EXTERNAL_CONTRACTS.USDC as `0x${string}`,
        abi: ERC20ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });
}

// Hook to resolve a merchant by username
export function useMerchantResolve(username: string) {
    return useReadContract({
        address: CONTRACTS.MerchantRegistry as `0x${string}`,
        abi: MerchantRegistryABI,
        functionName: 'resolve',
        args: [username],
        query: {
            enabled: username.length > 0,
        },
    });
}

// Hook to check if username is available
export function useUsernameAvailable(username: string) {
    return useReadContract({
        address: CONTRACTS.MerchantRegistry as `0x${string}`,
        abi: MerchantRegistryABI,
        functionName: 'isUsernameAvailable',
        args: [username],
        query: {
            enabled: username.length > 0,
        },
    });
}

// Hook to get merchant by address
export function useMerchantByAddress(address?: `0x${string}`) {
    return useReadContract({
        address: CONTRACTS.MerchantRegistry as `0x${string}`,
        abi: MerchantRegistryABI,
        functionName: 'getMerchantIdByAddress',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });
}

// Hook to get invoice by ID
export function useInvoice(invoiceId: bigint) {
    return useReadContract({
        address: CONTRACTS.InvoiceRegistry as `0x${string}`,
        abi: InvoiceRegistryABI,
        functionName: 'getInvoice',
        args: [invoiceId],
    });
}

// Hook to get vault total assets
export function useVaultTotalAssets() {
    return useReadContract({
        address: CONTRACTS.TreasuryVaultUSDC as `0x${string}`,
        abi: TreasuryVaultABI,
        functionName: 'totalAssets',
    });
}

// Hook to get vault share balance
export function useVaultShareBalance(address?: `0x${string}`) {
    return useReadContract({
        address: CONTRACTS.TreasuryVaultUSDC as `0x${string}`,
        abi: TreasuryVaultABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });
}

// Hook to register as a merchant
export function useRegisterMerchant() {
    const { writeContract, ...rest } = useWriteContract();

    const registerMerchant = (
        username: string,
        payoutAddress: `0x${string}`,
        stealthMetaAddress: `0x${string}`
    ) => {
        writeContract({
            address: CONTRACTS.MerchantRegistry as `0x${string}`,
            abi: MerchantRegistryABI,
            functionName: 'registerMerchant',
            args: [username, payoutAddress, stealthMetaAddress],
        });
    };

    return { registerMerchant, ...rest };
}

// Hook to create an invoice
export function useCreateInvoice() {
    const { writeContract, ...rest } = useWriteContract();

    const createInvoice = (
        merchantId: bigint,
        token: `0x${string}`,
        amount: bigint,
        expiry: bigint,
        encryptedDetailsPointer: string
    ) => {
        writeContract({
            address: CONTRACTS.InvoiceRegistry as `0x${string}`,
            abi: InvoiceRegistryABI,
            functionName: 'createInvoice',
            args: [merchantId, token, amount, expiry, encryptedDetailsPointer],
        });
    };

    return { createInvoice, ...rest };
}

// Hook to deposit to vault
export function useVaultDeposit() {
    const { writeContract, ...rest } = useWriteContract();

    const deposit = (assets: bigint, receiver: `0x${string}`) => {
        writeContract({
            address: CONTRACTS.TreasuryVaultUSDC as `0x${string}`,
            abi: TreasuryVaultABI,
            functionName: 'deposit',
            args: [assets, receiver],
        });
    };

    return { deposit, ...rest };
}

// Hook to approve USDC spending
export function useApproveUSDC() {
    const { writeContract, ...rest } = useWriteContract();

    const approve = (spender: `0x${string}`, amount: bigint) => {
        writeContract({
            address: EXTERNAL_CONTRACTS.USDC as `0x${string}`,
            abi: ERC20ABI,
            functionName: 'approve',
            args: [spender, amount],
        });
    };

    return { approve, ...rest };
}
