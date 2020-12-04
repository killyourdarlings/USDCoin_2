pragma solidity ^0.6.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol";

contract ColorTokenDemo is ERC721 {
    
    constructor() public ERC721("ColorTokenDemo", "CLRTD") {}
    
    function awardItem(address tokenRecipient, uint256 tokenId) public returns (uint256) {
        
        _mint(tokenRecipient, tokenId);
        
        return tokenId;
    }
}