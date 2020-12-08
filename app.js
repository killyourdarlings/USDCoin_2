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
//const contractAddress721 = "0xd58b13151f735F5085693b5fE6fc8f4Ab2Eb6929";
const contractAddress721 = "0xE9c5A879C6925cb526eA387A849D50D1bC63Ab32"
const contractAddress20 = "0x2f5b36683868c7d003Cce61efC8852f3380864ee"
const contractABI721 = [
  "function awardItem(address recipient, uint256 tokenId, string memory tokenURI) public",
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

const contractUSDNFT = new ethers.Contract(contractAddress721, contractABI721, provider);
const contractUSDC = new ethers.Contract(contractAddress20, contractABI20, provider);
const tokenWithSignerUSDNFT = contractUSDNFT.connect(signer);
const tokenWithSignerUSDC = contractUSDC.connect(signer);

let address; // address of the current metamask account
let totalSupplyUSDNFT; // total supply of USDNFT that exist
let balanceUSDNFT; // balance of USDNFT owned by user
let totalSupplyUSDC; // total supply of USDC that exist
let balanceUSDC; // balance of USDC owned by user
let serial; // the serial number of the dollar bill
let scan = false; // when this is true, teachable machine turns on
let timeRequirement = 180;

main();

async function main() {
  address = await signer.getAddress();

  

  // get information about USDNFT
  totalSupplyUSDNFT = await contractUSDNFT.totalSupply();
  balanceUSDNFT = await contractUSDNFT.balanceOf(address);

  // get information about USDC
  totalSupplyUSDC = await contractUSDC.totalSupply();
  balanceUSDC = await contractUSDC.balanceOf(address);
  
  $('.display-info').click(async function(){
    console.log("Current Signer Address:", address)
    console.log("USDNFT Balance:", +balanceUSDNFT)
    console.log("USDC Balance:", +balanceUSDC)

    // store the tokenID of the first USDNFT minted by the signer
    let firstUSDNFTtokenId = await contractUSDNFT.tokenOfOwnerByIndex(address, 0);
    console.log("Token ID of the first token owned by the signer:", +firstUSDNFTtokenId);

    // get the tokenURI of that token using the tokenID
    let tokenURI = await contractUSDNFT.tokenURI(firstUSDNFTtokenId);
    console.log("Token URI as a string:", tokenURI);
    console.log("Token URI as JSON:", JSON.parse(tokenURI));
  })
}

$('.mint-USDNFT-btn').click(function(){

  let inputSerial = $('.bill-serial').val()

  serial = serialToNumber(inputSerial);
  scan = true;
  classifyVideo();
  console.log("start scanning")
  $(".scanning").show();
  $(".earned").text("");
  
  
  
  
  // let dollarValue = 5; // This number will be determined by what teachable machine detects
  // let serial = $('.bill-serial').val();
  // let tokenURI = `{
  //                   "value": "${dollarValue}",
  //                   "serial": "${serial}"
  //                 }`;

  // tokenWithSignerUSDNFT.awardItem(address, tokenURI);
  // tokenWithSignerUSDC.reward(dollarValue);
})

function serialToNumber(_serial) {
  let letters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
  
  let convertedSerial = "";
  
  for(let i = 0; i < _serial.length; i++){
    let currDigit = _serial[i].toLowerCase();
    
    if(letters.indexOf(currDigit) > -1 ) {
      convertedSerial += letters.indexOf(currDigit) + 1
    } else {
      convertedSerial += currDigit;
    }
  }
  return convertedSerial;
}


///////////////////p5 code//////////////////////

 let video;
 let flippedVideo;
  //To store the classification
 let label = "";
 let confidence = 0;
 let imageModelURL = 'models/tm-my-image-model/'

  //Load the model first
 function preload() {
   classifier = ml5.imageClassifier(imageModelURL + 'model.json');
 }
 let counter = 0;

 function setup() {
   let cnv = createCanvas(320, 260);
   cnv.parent("#sketch-parent");
   // Create the video
   video = createCapture(VIDEO);
   video.size(320, 240);
   video.hide();

   flippedVideo = ml5.flipImage(video);
   // Start classifying
   //classifyVideo();
 }

 function draw() {
   background(0);
  // Draw the video
  image(flippedVideo, 0, 0);

  // Draw the label
  fill(255);
  textSize(16);
  textAlign(CENTER);
  fill(0, 255, 0);
  let rectWidth = map(counter, 0, timeRequirement, 0, width)
  rect(0, 0, rectWidth, 10);
  text(label + ", " + confidence, width / 2, height - 4);


}

// Get a prediction for the current video frame
function classifyVideo() {
  flippedVideo = ml5.flipImage(video)
  
  classifier.classify(flippedVideo, gotResult);
  
  
  flippedVideo.remove();
}


let mostConfidentLabel = "";

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


  // HOW TO DETECT IF TEACHABLE MACHINE HAS IDENTIFIED THE DOLLAR BILL CONSISTENTLY FOR AT LEAST 3 SECONDS
  
  // upon detection, store the most confident label and make sure it is the most confident label for at least 3 seconds.
  // if the most confident label changes, reset counter to 0 and pick new most confident label
  
  
  
  // at the first detection, mostConfidentLabel is just "", so the the "else" statement will execute the very first time
  // results[0].label is set every single frame there is a new detection.
  if(mostConfidentLabel == results[0].label) {
    
    // for each frame that the most confident label stays the same, increment the counter (i.e., for each frame in a row that I detect a $5 bill, increase the counter.
    counter++;
  } 
  // if, all of a sudden, the detector detects a dollar bill that is different from the one it has been detecting, set the mostConfidentLable to the current most confident label (results[0].label), and reset the counter to 0. (i.e., The detector sees a $5 bill for 20 frames in a row, but all of a sudden the detector thinks it sees a $100 bill. So the most confident label then becomes "100-bill", and the counter starts over)
  else {
    mostConfidentLabel = results[0].label;
    counter = 0;
  }

  // if the detector detects the same bill for X consistent detections, then we "mint" the NFT for that dollar amount. (in this code, instead of minting, we're just console.logging the label that was detected for X detections in a row.)
  if(counter > timeRequirement) {
    //console.log(mostConfidentLabel);
    let dollarValue = mostConfidentLabel;
  
    if(dollarValue == "USD1") {
      dollarValue = 1;
    }

    if(dollarValue == "USD2") {
      dollarValue = 2;
    }

    if(dollarValue == "USD5") {
      dollarValue = 5;
    }

    if(dollarValue == "USD10") {
      dollarValue = 10;
    }

    if(dollarValue == "USD20") {
      dollarValue = 20;
    }

    if(dollarValue == "USD50") {
      dollarValue = 50;
    }

    if(dollarValue == "USD100") {
      dollarValue = 100;
    }

    let tokenURI = `{
      "value": "${dollarValue}"
    }`;

    $(".earned").text(`You earned ${dollarValue} USDC`);
    console.log("tokenURI:", tokenURI);
    console.log("tokenID:", serial);

    tokenWithSignerUSDNFT.awardItem(address, serial, tokenURI)
    tokenWithSignerUSDC.reward(dollarValue)
    
    scan = false;
    $(".scanning").hide();
    
  }

  // Classifiy again!
  if(scan) {
    classifyVideo();
  }
}



