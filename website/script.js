const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('fileInput');

const contractAddress = '0xA710536b170E29F701636AEf82d32F4864140f5C';
//../ en local , ./ en github
const farfe = await fetch('./artifacts/contracts/AISavior.sol/AISavior.json')
const abiJSON = await farfe.json();
var hash;

//For users with no extension just to check list of consent
let web3 = new Web3('https://ethereum-sepolia-rpc.publicnode.com');
let accounts;
let userAccount;
let contract;
let abicontent;
let firmaValidacion;
let result;
var nonce;
var holdervalue;
var tagvalue;
var newhashvalue;
abicontent = abiJSON.abi;
contract = new web3.eth.Contract(abicontent, contractAddress);

/** 
 * AÑADIR REGISTER ARTWORK Y CAJITAS CORRESPONDIENTES
 * AÑADIR CHECK REGISTERED ARTWORKS Y CAJITA DE RESULTADO
 */
async function connectwallet(){
    if (typeof window.ethereum !== 'undefined') {
    console.log('MetaMask is installed!');
    web3 = new Web3(window.ethereum);

    abicontent = abiJSON.abi;
    contract = new web3.eth.Contract(abicontent, contractAddress);

    try {  // Request account access  
        await window.ethereum.enable(); 
        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        userAccount = accounts[0];
        console.log("Connected account:", userAccount);
    } catch(e) {  
        console.log("User denied account connection: ", e);
    }
    }else {
        console.log("Please install MetaMask!");
    }
}

document.getElementById('connectwallet').addEventListener('click', async() => {
   connectwallet();
  }
);
/** change account connected when changed on metamask
 * window.ethereum.on('accountsChanged', (accounts) => {
  userAccount = accounts[0];
  console.log("Account changed to:", userAccount);
});
 */


async function firmaNonce(holdervalue){
    nonce = await contract.methods.getNonce(holdervalue).call({from: userAccount});
  
    const hashCodeCert = web3.utils.keccak256(nonce);
    console.log("buenast tardes,", hashCodeCert, nonce);
  
    try {
    let signature = await web3.eth.personal.sign(hashCodeCert, userAccount, "");
  
    let { r, s, v } = parseSignature(signature);
    firmaValidacion = {
      _hashCodeCert: hashCodeCert,
      _r: r,
      _s: s,
      _v: v
    };
      console.log('FirmaValidacion:', firmaValidacion);
      return firmaValidacion;
    } catch (error) {
      console.error("Signing failed:", error);
    }
  }

  function parseSignature(signature) {
    let r = "0x" + signature.slice(2, 66);
    let s = "0x" + signature.slice(66, 130);
    let v = parseInt(signature.slice(130, 132), 16);
    if (v < 27) v += 27;  // Ensure v is 27 or 28
  
    return { r, s, v };
  }



dropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropArea.classList.add('highlight');
});

dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('highlight');
});

dropArea.addEventListener('drop', async (event) => {
    event.preventDefault();
    dropArea.classList.remove('highlight');
    const file = event.dataTransfer.files[0];
    if (file) {
        processFile(file);
    }
});

dropArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
        processFile(file);
    }
});

async function processFile(file) {
    hash = await calculateHash(file);
    const format = file.type.split('/')[1].toUpperCase();
    document.getElementById('hashOutput').innerText = `Image obtained code: ${hash}`;
   // document.getElementById('formatOutput').innerText = `File Format: ${format}`;
    document.getElementById('fileName').innerText = `File: ${file.name}`;

}

async function calculateHash(file) {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

//// CONTRACT FUNCTIONALITIES
document.getElementById("register_artist").addEventListener('click',
  async() => {
    tagvalue = document.getElementById('user_tag_register').value;

    try{
      result = await contract.methods.registerArtist(tagvalue).send({
          from: userAccount});

      console.log('Registered tag ', tagvalue, "to ETH account ", userAccount);
      document.getElementById('registered').innerHTML = tagvalue;
    
  }catch (error) {
    console.error('Get Artworks failed:', error);
  }
}
)




let resultbr = "";
function addbreak(value, index, array) {
  resultbr += value + "<br>"; 
}
document.getElementById('check_consent').addEventListener('click', async() => {
    tagvalue = document.getElementById('user_tag').value;
    holdervalue = await contract.methods.getAddressFromTag(tagvalue).call({
        });
    
    console.log(tagvalue, holdervalue);
  
    try{
        result = await contract.methods.checkRegisteredArtworks(tagvalue).call({
            });

        console.log('Artwork with consent from', tagvalue, "are the following: ", result);
        resultbr = "";
        result.forEach(addbreak);
        document.getElementById("art4AI_result").innerHTML = resultbr;
      
    }catch (error) {
      console.error('Get Artworks failed:', error);
    }
  });


document.getElementById('add_consent').addEventListener('click', async() => {
    tagvalue = document.getElementById('user_tag_add').value; 
    newhashvalue = hash;
    holdervalue = await contract.methods.getAddressFromTag(tagvalue).call({
        from:userAccount});
    firmaValidacion = await firmaNonce(holdervalue);

    try{
        console.log(tagvalue, newhashvalue, firmaValidacion);
        result = await contract.methods.registerArtwork(tagvalue, newhashvalue, firmaValidacion).send({
          from: userAccount});
        
        const event = result.events.NewRegisteredConsentForArtwork;
        if (event) {
            const newhash = event.returnValues[2];  // Second value (array of IDs)
            console.log("New Registered Hash:", newhash);
            document.getElementById('art4AI_given').innerHTML = newhash;
    
        } else {
            console.log("No NewRegisteredConsentForArtwork event found.");
        }
        
    
      }catch (error) {
        console.error('Add art hash failed:', error);
      }
    });


    //registrar tag a address - next step seria conectarse con instagram directamente con REOWN fka WalletConnect

    //https://reown.com/blog/walletconnect-is-now-reown
