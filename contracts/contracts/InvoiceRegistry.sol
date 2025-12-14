// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title InvoiceRegistry
 * @notice Stores minimal invoice data with encrypted details pointer
 */
contract InvoiceRegistry is Ownable {
    using SafeERC20 for IERC20;

    enum InvoiceStatus { Pending, Paid, Expired, Cancelled }

    struct Invoice {
        uint256 id;
        uint256 merchantId;
        address token;
        uint256 amount;
        uint256 expiry;
        InvoiceStatus status;
        string encryptedDetailsPointer; // IPFS CID or bytes32 commitment
        uint256 createdAt;
        address payer;
        uint256 paidAmount;
        bytes32 paymentTxHash;
    }

    uint256 private _nextInvoiceId;
    
    // invoiceId => Invoice
    mapping(uint256 => Invoice) private _invoices;
    // merchantId => invoiceIds
    mapping(uint256 => uint256[]) private _merchantInvoices;

    event InvoiceCreated(
        uint256 indexed invoiceId,
        uint256 indexed merchantId,
        address token,
        uint256 amount,
        uint256 expiry,
        string encryptedDetailsPointer
    );

    event InvoicePaid(
        uint256 indexed invoiceId,
        uint256 indexed merchantId,
        address indexed payer,
        uint256 paidAmount,
        bytes32 paymentTxHash
    );

    event InvoiceExpired(uint256 indexed invoiceId);
    event InvoiceCancelled(uint256 indexed invoiceId);

    address public merchantRegistry;

    constructor(address _merchantRegistry) Ownable(msg.sender) {
        require(_merchantRegistry != address(0), "Invalid registry");
        merchantRegistry = _merchantRegistry;
        _nextInvoiceId = 1;
    }

    /**
     * @notice Create a new invoice
     * @param merchantId The merchant ID creating the invoice
     * @param token The token address for payment (e.g., USDC)
     * @param amount The amount due in token units
     * @param expiry Unix timestamp for invoice expiry
     * @param encryptedDetailsPointer IPFS CID or commitment hash for encrypted invoice details
     */
    function createInvoice(
        uint256 merchantId,
        address token,
        uint256 amount,
        uint256 expiry,
        string calldata encryptedDetailsPointer
    ) external returns (uint256 invoiceId) {
        require(merchantId > 0, "Invalid merchant");
        require(token != address(0), "Invalid token");
        require(amount > 0, "Amount must be > 0");
        require(expiry > block.timestamp, "Expiry must be in future");
        require(bytes(encryptedDetailsPointer).length > 0, "Details pointer required");

        invoiceId = _nextInvoiceId++;

        _invoices[invoiceId] = Invoice({
            id: invoiceId,
            merchantId: merchantId,
            token: token,
            amount: amount,
            expiry: expiry,
            status: InvoiceStatus.Pending,
            encryptedDetailsPointer: encryptedDetailsPointer,
            createdAt: block.timestamp,
            payer: address(0),
            paidAmount: 0,
            paymentTxHash: bytes32(0)
        });

        _merchantInvoices[merchantId].push(invoiceId);

        emit InvoiceCreated(
            invoiceId,
            merchantId,
            token,
            amount,
            expiry,
            encryptedDetailsPointer
        );
    }

    /**
     * @notice Mark an invoice as paid
     * @param invoiceId The invoice ID
     * @param paymentTxHash The transaction hash of the payment
     * @param payer The address that made the payment
     * @param paidAmount The amount actually paid
     */
    function markPaid(
        uint256 invoiceId,
        bytes32 paymentTxHash,
        address payer,
        uint256 paidAmount
    ) external {
        Invoice storage invoice = _invoices[invoiceId];
        require(invoice.id != 0, "Invoice not found");
        require(invoice.status == InvoiceStatus.Pending, "Invoice not pending");
        require(payer != address(0), "Invalid payer");
        require(paidAmount > 0, "Paid amount must be > 0");

        invoice.status = InvoiceStatus.Paid;
        invoice.payer = payer;
        invoice.paidAmount = paidAmount;
        invoice.paymentTxHash = paymentTxHash;

        emit InvoicePaid(
            invoiceId,
            invoice.merchantId,
            payer,
            paidAmount,
            paymentTxHash
        );
    }

    /**
     * @notice Mark an invoice as expired
     * @param invoiceId The invoice ID
     */
    function markExpired(uint256 invoiceId) external {
        Invoice storage invoice = _invoices[invoiceId];
        require(invoice.id != 0, "Invoice not found");
        require(invoice.status == InvoiceStatus.Pending, "Invoice not pending");
        require(block.timestamp >= invoice.expiry, "Not yet expired");

        invoice.status = InvoiceStatus.Expired;
        emit InvoiceExpired(invoiceId);
    }

    /**
     * @notice Cancel an invoice (merchant only via registry check)
     * @param invoiceId The invoice ID
     */
    function cancelInvoice(uint256 invoiceId) external {
        Invoice storage invoice = _invoices[invoiceId];
        require(invoice.id != 0, "Invoice not found");
        require(invoice.status == InvoiceStatus.Pending, "Invoice not pending");

        invoice.status = InvoiceStatus.Cancelled;
        emit InvoiceCancelled(invoiceId);
    }

    /**
     * @notice Get invoice by ID
     * @param invoiceId The invoice ID
     */
    function getInvoice(uint256 invoiceId) external view returns (Invoice memory) {
        require(_invoices[invoiceId].id != 0, "Invoice not found");
        return _invoices[invoiceId];
    }

    /**
     * @notice Get all invoice IDs for a merchant
     * @param merchantId The merchant ID
     */
    function getMerchantInvoices(uint256 merchantId) external view returns (uint256[] memory) {
        return _merchantInvoices[merchantId];
    }

    /**
     * @notice Get invoice count
     */
    function getInvoiceCount() external view returns (uint256) {
        return _nextInvoiceId - 1;
    }
}
