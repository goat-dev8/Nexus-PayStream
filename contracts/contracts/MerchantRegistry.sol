// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MerchantRegistry
 * @notice Stores merchant profiles with stealth meta-addresses for ERC-5564 payments
 */
contract MerchantRegistry is Ownable {
    struct Merchant {
        uint256 id;
        string username;
        address payoutAddress;
        bytes stealthMetaAddress;
        bool active;
        uint256 registeredAt;
    }

    uint256 private _nextMerchantId;
    
    // username => merchantId
    mapping(string => uint256) private _usernameToId;
    // merchantId => Merchant
    mapping(uint256 => Merchant) private _merchants;
    // address => merchantId (for reverse lookup)
    mapping(address => uint256) private _addressToId;

    event MerchantRegistered(
        uint256 indexed merchantId,
        string username,
        address indexed payoutAddress,
        bytes stealthMetaAddress
    );

    event MerchantUpdated(
        uint256 indexed merchantId,
        string username,
        address indexed payoutAddress,
        bytes stealthMetaAddress
    );

    constructor() Ownable(msg.sender) {
        _nextMerchantId = 1;
    }

    /**
     * @notice Register a new merchant
     * @param username Unique @username for the merchant
     * @param payoutAddress Address to receive swept funds
     * @param stealthMetaAddress ERC-5564 stealth meta-address bytes
     */
    function registerMerchant(
        string calldata username,
        address payoutAddress,
        bytes calldata stealthMetaAddress
    ) external returns (uint256 merchantId) {
        require(bytes(username).length > 0, "Username required");
        require(bytes(username).length <= 32, "Username too long");
        require(payoutAddress != address(0), "Invalid payout address");
        require(stealthMetaAddress.length > 0, "Stealth meta-address required");
        require(_usernameToId[username] == 0, "Username taken");
        require(_addressToId[msg.sender] == 0, "Already registered");

        merchantId = _nextMerchantId++;
        
        _merchants[merchantId] = Merchant({
            id: merchantId,
            username: username,
            payoutAddress: payoutAddress,
            stealthMetaAddress: stealthMetaAddress,
            active: true,
            registeredAt: block.timestamp
        });

        _usernameToId[username] = merchantId;
        _addressToId[msg.sender] = merchantId;

        emit MerchantRegistered(merchantId, username, payoutAddress, stealthMetaAddress);
    }

    /**
     * @notice Update merchant details
     * @param newPayoutAddress New payout address (or address(0) to keep current)
     * @param newStealthMetaAddress New stealth meta-address (or empty to keep current)
     */
    function updateMerchant(
        address newPayoutAddress,
        bytes calldata newStealthMetaAddress
    ) external {
        uint256 merchantId = _addressToId[msg.sender];
        require(merchantId != 0, "Not registered");

        Merchant storage merchant = _merchants[merchantId];
        
        if (newPayoutAddress != address(0)) {
            merchant.payoutAddress = newPayoutAddress;
        }
        
        if (newStealthMetaAddress.length > 0) {
            merchant.stealthMetaAddress = newStealthMetaAddress;
        }

        emit MerchantUpdated(
            merchantId,
            merchant.username,
            merchant.payoutAddress,
            merchant.stealthMetaAddress
        );
    }

    /**
     * @notice Resolve a merchant by username
     * @param username The @username to look up
     * @return merchantId The merchant ID
     * @return payoutAddress The merchant's payout address
     * @return stealthMetaAddress The merchant's stealth meta-address
     */
    function resolve(string calldata username) 
        external 
        view 
        returns (
            uint256 merchantId,
            address payoutAddress,
            bytes memory stealthMetaAddress
        ) 
    {
        merchantId = _usernameToId[username];
        require(merchantId != 0, "Merchant not found");
        
        Merchant storage merchant = _merchants[merchantId];
        require(merchant.active, "Merchant inactive");
        
        return (merchantId, merchant.payoutAddress, merchant.stealthMetaAddress);
    }

    /**
     * @notice Get merchant by ID
     * @param merchantId The merchant ID
     */
    function getMerchant(uint256 merchantId)
        external
        view
        returns (Merchant memory)
    {
        require(_merchants[merchantId].id != 0, "Merchant not found");
        return _merchants[merchantId];
    }

    /**
     * @notice Get merchant ID by address
     * @param addr The address to look up
     */
    function getMerchantIdByAddress(address addr) external view returns (uint256) {
        return _addressToId[addr];
    }

    /**
     * @notice Check if username is available
     * @param username The username to check
     */
    function isUsernameAvailable(string calldata username) external view returns (bool) {
        return _usernameToId[username] == 0;
    }
}
