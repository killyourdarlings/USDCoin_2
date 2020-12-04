ethereum.autoRefreshOnNetworkChange = false;
ethereum.enable();

const provider = new ethers.providers.Web3Provider(window.ethereum);
let signer = provider.getSigner();
const contractAddress = "0x3EeCD0A7FE63ADf1ddC68dF065b1C01C6D4eB209";
const contractABI = [
  "function awardItem(address player, string memory tokenURI) public",
  "function balanceOf(address account) public view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
  "function totalSupply() public view returns (uint256)",
  "function tokenByIndex(uint256 index) public view returns (uint256)",
  "function safeTransferFrom(address from, address to, uint256 tokenId) public",
  "function tokenURI(uint256 tokenId) public view returns (string memory)"
];

let address; // address of the current metamask account
let totalSupply; // total supply of COLR of current metamask account
let existingTokens = []; // an array of ALL minted color tokens
let signerTokens = []; // an arry of all minted color tokens owned by current metamask account

const contract = new ethers.Contract(contractAddress, contractABI, provider);
const tokenWithSigner = contract.connect(signer);

const kio = "0xeE801da95f2C111941022cDf72A08938Ce703ECf";

main();

async function main() {
  address = await signer.getAddress();

  let sampleObit = `{
    "name": "Whiskyjarjar",
    "birthday": "1900年",
    "deathday": "2020年2月27日",
    "platform": "豆瓣",
    "cause of death": "主动弃用",
    "obituary": "它陪我度过了我青春当中最美好的那段时间，也记录了我观影、音乐、读书的足迹。但是那一天突然意识到，我需要的已经不是一个用来“体现我品味”的地方，而是一个真正的属于我自己的精神角落。\\n \\n 我不会把它注销，但也不会再去使用这个账号。\\n \\n 一个新的开始。"
  }`

  $('#mint-obit').click(function(){
    tokenWithSigner.awardItem(kio, sampleObit);
  })

  $('#display-obits').click(async function(){
    let totalSupply = await contract.totalSupply();
    let kioBalance = await contract.balanceOf(kio);
    totalSupply = +totalSupply;
    kioBalance = +kioBalance;
    console.log("Total supply: " + totalSupply);
    console.log("Kio's Balance: " + kioBalance);

    let kioTokens = [];

    for(let i = 0; i < kioBalance; i++) {
      let t = await contract.tokenOfOwnerByIndex(kio, i);
      t = +t;
      kioTokens.push(t);
    }

    console.log(kioTokens);

    let obitURI = await contract.tokenURI(kioTokens[kioTokens.length-1]);

    // obtURI = JSON.parse(obitURI);
    console.log(obitURI);

    let obitURIJSON = JSON.parse(obitURI);

    console.log(obitURIJSON.name);

    let sampleObitJSON = JSON.parse(sampleObit)
    console.log(sampleObitJSON.obituary);

    $('.obit__name-obituary').text(sampleObitJSON.obituary);
    
  })
}