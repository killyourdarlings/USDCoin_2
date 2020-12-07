

// 1. user shows dollar to webcam
// 2. teachable machine recognizes dollar amount
// 3. user manually types in serial number
// 4. serial number is converted to token ID
// 5. a new token is minted with the token ID and URI that stores the value of the dollar bill
// 6. after minting, the user is awarded USDCoin equivalent to the amount of the minted dollar bill
// 7. display balance on screen

ethereum.autoRefreshOnNetworkChange = false;
ethereum.enable();

const provider = new ethers.providers.Web3Provider(window.ethereum);
let signer = provider.getSigner();
const contractAddress721 = "0xd58b13151f735F5085693b5fE6fc8f4Ab2Eb6929";
const contractAddress20 = "0x2f5b36683868c7d003Cce61efC8852f3380864ee"
const contractABI721 = [
  "function awardItem(address player, string memory tokenURI) public",
  "function balanceOf(address account) public view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
  "function totalSupply() public view returns (uint256)",
  "function tokenByIndex(uint256 index) public view returns (uint256)",
  "function safeTransferFrom(address from, address to, uint256 tokenId) public",
  "function tokenURI(uint256 tokenId) public view returns (string memory)"
];
const contractABI20 = [
  "function name() public view returns (string memory)",
  "function symbol() public view returns (string memory)",
  "function decimals() public view returns (uint8)",
  "function totalSupply() public view returns (uint256)",
  "function balanceOf(address account) public view returns (uint256)",
  "function transfer(address recipient, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function transferFrom(address sender, address recipient, uint256 amount) public returns (bool)",
  "function increaseAllowance(address spender, uint256 addedValue) public returns (bool)",
  "function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool)",
  "function reward(uint256 amt) public payable"
];

let address; // address of the current metamask account
let totalSupply; // total supply of COLR of current metamask account
let existingTokens = []; // an array of ALL minted color tokens
let signerTokens = []; // an arry of all minted color tokens owned by current metamask account

const contractUSDNFT = new ethers.Contract(contractAddress721, contractABI721, provider);
const contractUSDC = new ethers.Contract(contractAddress20, contractABI20, provider);
const tokenWithSignerUSDNFT = contractUSDNFT.connect(signer);
const tokenWithSignerUSDC = contractUSDNFT.connect(signer);

main();

async function main() {
  address = await signer.getAddress();

  
  


  
  
 
}


///////////////////p5 code//////////////////////

let video;
  let flippedVideo;
  // To store the classification
  let label = "";
  let confidence = 0;
  let imageModelURL = 'models/tm-my-image-model/'

  // Load the model first
  function preload() {
    classifier = ml5.imageClassifier(imageModelURL + 'model.json');
  }

  function setup() {
    createCanvas(320, 260);
    // Create the video
    video = createCapture(VIDEO);
    video.size(320, 240);
    video.hide();

    flippedVideo = ml5.flipImage(video);
    // Start classifying
    classifyVideo();
  }

  function draw() {
    background(0);
    // Draw the video
    image(flippedVideo, 0, 0);

    // Draw the label
    fill(255);
    textSize(16);
    textAlign(CENTER);
    text(label + ", " + confidence, width / 2, height - 4);
  }

  // Get a prediction for the current video frame
  function classifyVideo() {
    flippedVideo = ml5.flipImage(video)
    classifier.classify(flippedVideo, gotResult);
    flippedVideo.remove();

  }

  let shouldReward = true;
  // When we get a result
  function gotResult(error, results) {
    // If there is an error
    if (error) {
      console.error(error);
      return;
    }
    // The results are in an array ordered by confidence.
    // console.log(results[0]);
    label = results[0].label;
    confidence = results[0].confidence;

    // if teachable machine is confident that it is looking at a $100 dollar for 3 seconds, THEN mint the NFT

    let counter = 0;

    if(results[0].confidence > 0.95 &&shouldReward) {
      counter++;
      if(counter > 90) {
        tokenWithSigner.reward(1);
        shouldReward=false;
      }
    } else {
      counter = 0;
    }

    

  
    // Classifiy again!
    classifyVideo();
  }



