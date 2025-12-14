export const MerchantRegistryABI = [
    {
        type: 'function',
        name: 'registerMerchant',
        inputs: [
            { name: 'username', type: 'string' },
            { name: 'payoutAddress', type: 'address' },
            { name: 'stealthMetaAddress', type: 'bytes' }
        ],
        outputs: [{ name: 'merchantId', type: 'uint256' }],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'updateMerchant',
        inputs: [
            { name: 'newPayoutAddress', type: 'address' },
            { name: 'newStealthMetaAddress', type: 'bytes' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'resolve',
        inputs: [{ name: 'username', type: 'string' }],
        outputs: [
            { name: 'merchantId', type: 'uint256' },
            { name: 'payoutAddress', type: 'address' },
            { name: 'stealthMetaAddress', type: 'bytes' }
        ],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'getMerchant',
        inputs: [{ name: 'merchantId', type: 'uint256' }],
        outputs: [
            {
                type: 'tuple',
                components: [
                    { name: 'id', type: 'uint256' },
                    { name: 'username', type: 'string' },
                    { name: 'payoutAddress', type: 'address' },
                    { name: 'stealthMetaAddress', type: 'bytes' },
                    { name: 'active', type: 'bool' },
                    { name: 'registeredAt', type: 'uint256' }
                ]
            }
        ],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'getMerchantIdByAddress',
        inputs: [{ name: 'addr', type: 'address' }],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'isUsernameAvailable',
        inputs: [{ name: 'username', type: 'string' }],
        outputs: [{ type: 'bool' }],
        stateMutability: 'view'
    },
    {
        type: 'event',
        name: 'MerchantRegistered',
        inputs: [
            { name: 'merchantId', type: 'uint256', indexed: true },
            { name: 'username', type: 'string', indexed: false },
            { name: 'payoutAddress', type: 'address', indexed: true },
            { name: 'stealthMetaAddress', type: 'bytes', indexed: false }
        ]
    },
    {
        type: 'event',
        name: 'MerchantUpdated',
        inputs: [
            { name: 'merchantId', type: 'uint256', indexed: true },
            { name: 'username', type: 'string', indexed: false },
            { name: 'payoutAddress', type: 'address', indexed: true },
            { name: 'stealthMetaAddress', type: 'bytes', indexed: false }
        ]
    }
] as const;

export const InvoiceRegistryABI = [
    {
        type: 'function',
        name: 'createInvoice',
        inputs: [
            { name: 'merchantId', type: 'uint256' },
            { name: 'token', type: 'address' },
            { name: 'amount', type: 'uint256' },
            { name: 'expiry', type: 'uint256' },
            { name: 'encryptedDetailsPointer', type: 'string' }
        ],
        outputs: [{ name: 'invoiceId', type: 'uint256' }],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'markPaid',
        inputs: [
            { name: 'invoiceId', type: 'uint256' },
            { name: 'paymentTxHash', type: 'bytes32' },
            { name: 'payer', type: 'address' },
            { name: 'paidAmount', type: 'uint256' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'getInvoice',
        inputs: [{ name: 'invoiceId', type: 'uint256' }],
        outputs: [
            {
                type: 'tuple',
                components: [
                    { name: 'id', type: 'uint256' },
                    { name: 'merchantId', type: 'uint256' },
                    { name: 'token', type: 'address' },
                    { name: 'amount', type: 'uint256' },
                    { name: 'expiry', type: 'uint256' },
                    { name: 'status', type: 'uint8' },
                    { name: 'encryptedDetailsPointer', type: 'string' },
                    { name: 'createdAt', type: 'uint256' },
                    { name: 'payer', type: 'address' },
                    { name: 'paidAmount', type: 'uint256' },
                    { name: 'paymentTxHash', type: 'bytes32' }
                ]
            }
        ],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'getMerchantInvoices',
        inputs: [{ name: 'merchantId', type: 'uint256' }],
        outputs: [{ type: 'uint256[]' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'getInvoiceCount',
        inputs: [],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        type: 'event',
        name: 'InvoiceCreated',
        inputs: [
            { name: 'invoiceId', type: 'uint256', indexed: true },
            { name: 'merchantId', type: 'uint256', indexed: true },
            { name: 'token', type: 'address', indexed: false },
            { name: 'amount', type: 'uint256', indexed: false },
            { name: 'expiry', type: 'uint256', indexed: false },
            { name: 'encryptedDetailsPointer', type: 'string', indexed: false }
        ]
    },
    {
        type: 'event',
        name: 'InvoicePaid',
        inputs: [
            { name: 'invoiceId', type: 'uint256', indexed: true },
            { name: 'merchantId', type: 'uint256', indexed: true },
            { name: 'payer', type: 'address', indexed: true },
            { name: 'paidAmount', type: 'uint256', indexed: false },
            { name: 'paymentTxHash', type: 'bytes32', indexed: false }
        ]
    }
] as const;

export const TreasuryVaultABI = [
    {
        type: 'function',
        name: 'deposit',
        inputs: [
            { name: 'assets', type: 'uint256' },
            { name: 'receiver', type: 'address' }
        ],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'withdraw',
        inputs: [
            { name: 'assets', type: 'uint256' },
            { name: 'receiver', type: 'address' },
            { name: 'owner', type: 'address' }
        ],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'totalAssets',
        inputs: [],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'balanceOf',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'convertToAssets',
        inputs: [{ name: 'shares', type: 'uint256' }],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'convertToShares',
        inputs: [{ name: 'assets', type: 'uint256' }],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'supplyToAave',
        inputs: [],
        outputs: [],
        stateMutability: 'nonpayable'
    }
] as const;

export const ERC20ABI = [
    {
        type: 'function',
        name: 'balanceOf',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'transfer',
        inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ type: 'bool' }],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'approve',
        inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ type: 'bool' }],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'allowance',
        inputs: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' }
        ],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'decimals',
        inputs: [],
        outputs: [{ type: 'uint8' }],
        stateMutability: 'view'
    }
] as const;

export const ERC5564AnnouncerABI = [
    {
        type: 'function',
        name: 'announce',
        inputs: [
            { name: 'schemeId', type: 'uint256' },
            { name: 'stealthAddress', type: 'address' },
            { name: 'ephemeralPubKey', type: 'bytes' },
            { name: 'metadata', type: 'bytes' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'event',
        name: 'Announcement',
        inputs: [
            { name: 'schemeId', type: 'uint256', indexed: true },
            { name: 'stealthAddress', type: 'address', indexed: true },
            { name: 'caller', type: 'address', indexed: true },
            { name: 'ephemeralPubKey', type: 'bytes', indexed: false },
            { name: 'metadata', type: 'bytes', indexed: false }
        ]
    }
] as const;
