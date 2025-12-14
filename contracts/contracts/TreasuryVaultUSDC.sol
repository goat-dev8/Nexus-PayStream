// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IPoolAddressesProvider
 * @notice Interface for Aave V3 PoolAddressesProvider
 */
interface IPoolAddressesProvider {
    function getPool() external view returns (address);
}

/**
 * @title IPool
 * @notice Minimal interface for Aave V3 Pool
 */
interface IPool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
}

/**
 * @title IAToken
 * @notice Minimal interface for Aave aTokens
 */
interface IAToken {
    function balanceOf(address account) external view returns (uint256);
    function UNDERLYING_ASSET_ADDRESS() external view returns (address);
}

/**
 * @title TreasuryVaultUSDC
 * @notice ERC-4626 vault that deposits USDC into Aave V3 for yield
 */
contract TreasuryVaultUSDC is ERC4626, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IPoolAddressesProvider public immutable poolAddressesProvider;
    IAToken public aToken;
    
    // Polygon USDC address
    address public constant USDC = 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359;
    
    // Aave V3 PoolAddressesProvider on Polygon
    address public constant AAVE_POOL_PROVIDER = 0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb;

    event ATokenSet(address indexed aToken);
    event SuppliedToAave(uint256 amount);
    event WithdrawnFromAave(uint256 amount);

    constructor()
        ERC20("Nexus Treasury USDC", "nxUSDC")
        ERC4626(IERC20(USDC))
        Ownable(msg.sender)
    {
        poolAddressesProvider = IPoolAddressesProvider(AAVE_POOL_PROVIDER);
    }

    /**
     * @notice Set the aToken address for USDC on Aave
     * @param _aToken The aUSDC token address
     */
    function setAToken(address _aToken) external onlyOwner {
        require(_aToken != address(0), "Invalid aToken");
        require(IAToken(_aToken).UNDERLYING_ASSET_ADDRESS() == USDC, "Wrong underlying");
        aToken = IAToken(_aToken);
        emit ATokenSet(_aToken);
    }

    /**
     * @notice Total assets = USDC balance + aUSDC balance (which accrues interest)
     */
    function totalAssets() public view override returns (uint256) {
        uint256 usdcBalance = IERC20(USDC).balanceOf(address(this));
        uint256 aTokenBalance = address(aToken) != address(0) ? aToken.balanceOf(address(this)) : 0;
        return usdcBalance + aTokenBalance;
    }

    /**
     * @notice Supply idle USDC to Aave V3
     */
    function supplyToAave() external nonReentrant {
        require(address(aToken) != address(0), "aToken not set");
        
        uint256 usdcBalance = IERC20(USDC).balanceOf(address(this));
        require(usdcBalance > 0, "No USDC to supply");

        address pool = poolAddressesProvider.getPool();
        
        IERC20(USDC).approve(pool, usdcBalance);
        IPool(pool).supply(USDC, usdcBalance, address(this), 0);

        emit SuppliedToAave(usdcBalance);
    }

    /**
     * @notice Withdraw USDC from Aave V3
     * @param amount Amount to withdraw
     */
    function withdrawFromAave(uint256 amount) external nonReentrant {
        require(address(aToken) != address(0), "aToken not set");
        require(amount > 0, "Amount must be > 0");

        address pool = poolAddressesProvider.getPool();
        uint256 withdrawn = IPool(pool).withdraw(USDC, amount, address(this));

        emit WithdrawnFromAave(withdrawn);
    }

    /**
     * @dev Override to ensure we can cover withdrawal by pulling from Aave if needed
     */
    function _withdraw(
        address caller,
        address receiver,
        address owner,
        uint256 assets,
        uint256 shares
    ) internal override nonReentrant {
        // Check if we have enough USDC, if not withdraw from Aave
        uint256 usdcBalance = IERC20(USDC).balanceOf(address(this));
        if (usdcBalance < assets && address(aToken) != address(0)) {
            uint256 needed = assets - usdcBalance;
            address pool = poolAddressesProvider.getPool();
            IPool(pool).withdraw(USDC, needed, address(this));
        }

        super._withdraw(caller, receiver, owner, assets, shares);
    }

    /**
     * @dev Override to supply to Aave after deposit
     */
    function _deposit(
        address caller,
        address receiver,
        uint256 assets,
        uint256 shares
    ) internal override nonReentrant {
        super._deposit(caller, receiver, assets, shares);
        
        // Auto-supply to Aave if aToken is set
        if (address(aToken) != address(0)) {
            uint256 usdcBalance = IERC20(USDC).balanceOf(address(this));
            if (usdcBalance > 0) {
                address pool = poolAddressesProvider.getPool();
                IERC20(USDC).approve(pool, usdcBalance);
                IPool(pool).supply(USDC, usdcBalance, address(this), 0);
            }
        }
    }
}
