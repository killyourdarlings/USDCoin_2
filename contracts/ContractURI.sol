// https://docs.openzeppelin.com/contracts/3.x/
// https://docs.openzeppelin.com/contracts/3.x/erc721
// https://docs.openzeppelin.com/contracts/3.x/access-control
// max value of uint256: 115792089237316195423570985008687907853269984665640564039457584007913129639935

// Goal: Implement a basic NFT that allows ownership of a color


pragma solidity ^0.6.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Counters.sol";


contract ContractURI is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    constructor() public ERC721("ContractURI", "CURI") {}
    
    
    function awardItem(address player, string memory tokenURI)
        public
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(player, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }
}



