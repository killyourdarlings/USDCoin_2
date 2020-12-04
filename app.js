if(ethereum) {
  ethereum.autoRefreshOnNetworkChange = false;
  ethereum.enable();
} else {
  alert("You need a MetaMask account to experience this site.")
}

const provider = new ethers.providers.Web3Provider(window.ethereum);
let signer = provider.getSigner();
const contractAddress = "0xb571B3ea89bDF2FBCf08E737432730C7e7ceD798";
const contractABI = [
  "function awardItem(address player, uint256 tokenId) public",
  "function balanceOf(address account) public view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
  "function totalSupply() public view returns (uint256)",
  "function tokenByIndex(uint256 index) public view returns (uint256)",
  "function safeTransferFrom(address from, address to, uint256 tokenId) public",
  "function ownerOf(uint256 tokenId) public view returns (address)"
];

const contract = new ethers.Contract(contractAddress, contractABI, provider);
const tokenWithSigner = contract.connect(signer);

// Global Variables
let address;
let totalSupply;
let existingTokens = []; // every single color token that has been minted
let signerTokens = []; // every color token owned by the signer


// Event Listeners
$('#generate-color').click(async function(){
  await mintColor();
})
$('.send-modal__bg').click(closeSendWindow);
$('.send-modal__close').click(closeSendWindow);
$('.send-modal__btn').click(sendToken);

main();

async function main() {
  address = await signer.getAddress();
  console.log("Current MetaMask Wallet: " + address);
  $("#address").text(address);
  await displayOwnedColors(address);

  window.ethereum.on('accountsChanged', async function(){
    signerTokens = [];

    $('.color-token').remove();

    signer = provider.getSigner();
    address = await signer.getAddress();
    console.log("Current MetaMask Wallet: " + address);
    $("#address").text(address);
    await displayOwnedColors(address);
  })
}

async function displayOwnedColors(_address) {
  let balance = await contract.balanceOf(_address);
  balance = +balance;

  // an array of all the ColorToken Ids owned by the current user
  signerTokens = await getColorsByOwner(address, balance);

  // an arry of colors (as JavaScript objects) that are owned by the current user
  let ownedColors = idsToColor(signerTokens);

  // loop through all the colors;
  for(let i = 0; i < ownedColors.length; i++) {
    let t = ownedColors[i];

    let colorId = "token" + i;

    // add the color token to the web page
    let colorDiv =
    `
    <div class="color-token" id="${colorId}">
      <div class="color-token__tile"></div>
      <div class="color-token__text">
        <div class="color-token__num">${i + 1}</div>
        <div class="color-token__hex">#abcdef</div>
      </div>
    </div>
    `

    $('.color-gallery').append(colorDiv);

    $(`#${colorId}`).children('.color-token__tile').css("background", `rgb(${t.r}, ${t.g}, ${t.b})`);
    $(`#${colorId}`).children('.color-token__text').children(".color-token__hex").text(`${rgbToHex(t.r, t.g, t.b)}`);
  }

  $('.color-token').click(function(){
    let clickedToken = $(".color-token").index($(this));
    let clickedId = signerTokens[clickedToken];
    console.log(clickedId);

    $(".send-modal").toggle();
    $("#token-id").val(`${clickedId}`);
  })
}

async function getColorsByOwner(_address, _balance) {
  let ids = [];
  for(let i = 0; i < _balance; i++) {
    let currToken = await contract.tokenOfOwnerByIndex(_address, i);
    currToken = +currToken;
    ids.push(currToken);
  }
  return ids.sort();
}

function idsToColor(_ids) {

  let colors = [];

  for(let i = 0; i < _ids.length; i++) {
    // convert ID to a string
    let id = "" + _ids[i];

    // extract each color from the ID (e.g. 1255000255)
    let r = parseInt(id.substr(1, 3)); // index 1, 2, 3 == 255
    let g = parseInt(id.substr(4, 3)); // index 4, 5, 6 == 000
    let b = parseInt(id.substr(7, 3)); // index 7, 8, 9 == 255
    let color = {r: r, g: g, b: b};

    colors.push(color);
  }
  return colors;
}

// function to convert a decimal number to a hex number
function componentToHex(c) {
  let hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

// function to convert an RGB color to Hex color
function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

async function mintColor() {

  let timeOut;
  let interval = 250;
  let cycle = true;

  $('#loading').show();
  $('#generate-color').hide();

  setInterval(function(){
    if(cycle) {
      let randR = Math.floor(Math.random()*256);
      let randG = Math.floor(Math.random()*256);
      let randB = Math.floor(Math.random()*256);
      $('.minted-color__tile').css("background", `rgb(${randR}, ${randG}, ${randB})`);
      $('.minted-color__hex').text(`${rgbToHex(randR, randG, randB)}`);
    }
  }, interval);

  if(existingTokens.length == 0) {
    existingTokens = await loadExisting();
    timeOut = 2000;
  } else {
    timeOut = 10000;
  }

  setTimeout(function(){
    cycle = false;
    $('#loading').hide();
    $('#generate-color').show();

    let rewardId = checkExisting(existingTokens);
    let id = "" + rewardId;

    let r = parseInt(id.substr(1, 3));
    let g = parseInt(id.substr(4, 3));
    let b = parseInt(id.substr(7, 3));

    $('.minted-color__tile').css("background", `rgb(${r}, ${g}, ${b})`);
    $('.minted-color__hex').text(`${rgbToHex(r, g, b)}`);

    tokenWithSigner.awardItem(address, rewardId);
  }, timeOut)
}

// load all pre-existing tokens into an array (existingTokens)
async function loadExisting() {

  // get the total supply of existing tokens
  totalSupply = await contract.totalSupply();
  totalSupply = +totalSupply;

  // loop through all existing tokens and add them to the existingTokens array
  for(let i = 0; i < totalSupply; i++) {
    let currToken = await contract.tokenByIndex(i);
    existingTokens.push(+currToken);
  }
  return existingTokens;
}

// generates random colors until a unique (unowned) color is generated
function checkExisting(_existingTokens) {

  // generate an initial random color
  let randR = Math.floor(Math.random()*256);
  let randG = Math.floor(Math.random()*256);
  let randB = Math.floor(Math.random()*256);

  // combine random RGB values into a single number
  let myColor = 1000000000 + randR * 1000000 + randG * 1000 + randB;

  while(_existingTokens.indexOf(myColor) > 0) {
    let randR = Math.floor(Math.random()*256);
    let randG = Math.floor(Math.random()*256);
    let randB = Math.floor(Math.random()*256);

    myColor = 1000000000 + randR * 1000000 + randG * 1000 + randB;
  }

  console.log("Minted Color: " + myColor);
  return myColor;
}

function sendToken() {
  let recipAddress = $('#recipient-address').val();
  let token = +$('#token-id').val();

  if(verifyTokenId(token) && verifyAddress(recipAddress)) {
    tokenWithSigner.safeTransferFrom(address, recipAddress, token);
  }
}

function verifyAddress(addr) {
  let addressRegex = /^0x([A-Fa-f0-9]{40})$/;
  if(addressRegex.test(addr)) {
    if(addr == address) {
      $('#recipient-address').css("border", "1px solid #f99");
      $('#invalid-address').text("Can't send to yourself").show();
      return false;
    }
    $('#recipient-address').css("border", "1px solid #9f9");
    $('#invalid-address').hide();
    return true;
  }
  // if the address is not valid
  else {
    $('#recipient-address').css("border", "1px solid #f99");
    $('#invalid-address').text("Invalid address").show();
    return false;
  }
}


function verifyTokenId(tokenId) {
  if(signerTokens.indexOf(tokenId) > -1) {
    $('#token-id').css("border", "1px solid #9f9");
    $('#invalid-token').hide();
    return true;
  } else {
    $('#token-id').css("border", "1px solid #f99");
    $('#invalid-token').show();
    return false;
  }
}

function closeSendWindow() {
  $('.send-modal').hide();
  $('#token-id').css("border", "none");
  $('#token-id').css("border-bottom", "1px solid darkgray");
  $('#recipient-address').css("border", "none");
  $('#recipient-address').css("border-bottom", "1px solid darkgray");
  $('#invalid-address').hide();
  $('#invalid-token').hide();
}




