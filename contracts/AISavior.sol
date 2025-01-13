// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Strings.sol";

contract AISavior{

    mapping(address => uint256) private nonce_sign; 
    mapping(string => address) public holder_tag;
    mapping(address => string[]) public holder_artworks;
    //valorar meter un espejo string obra -> address holder para airdrops o usos de arte individual
    //valorar anadir si es png o jpg como se genero la hash onchain
    struct SignatureRSV {
        bytes32 _hashCodeCert;
        bytes32 _r;
        bytes32 _s;
        uint8 _v;
    }

    event RegisteredConsentForArtwork(address indexed user, string tag, string[] artwork_hashes);
    event NewRegisteredConsentForArtwork(address indexed user, string tag, string artwork_hash);

    //for tests
    constructor(){
        holder_tag["@cacnea"] = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
        holder_artworks[0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266] =
            ["cd04a110e5c4049eace63bce05d33ad2b368a0d68b99b0190b872736d968990e"];

        holder_tag["@noivern"] = 0x976EA74026E726554dB657fA54763abd0C3a0aa9;
        holder_artworks[0x976EA74026E726554dB657fA54763abd0C3a0aa9] =
            ["add8e49a8808d7e79030d351c14d5dd438a671d02bf0bceb85af28ecc54e5284"];

        holder_tag["@tejon"] = 0x6737C4Cb81d7DFb8AEA031e60D6B8c9874D1A5C5;
        holder_artworks[0x6737C4Cb81d7DFb8AEA031e60D6B8c9874D1A5C5] =
            ["1e488b6536b0a9a4feeb09cb56f5fce63465baf663119201dcb3d803cf135485"];
    }

    function getAddressFromTag(string memory _tag) public view returns(address){
        return holder_tag[_tag];
    }

    //Registra cuenta de Instagram o tag
    //Lo ideal seria un registro donde ademas te identifiques en tu cuenta de Instagram
    function registerArtist(string memory _account_tag) public returns (bool){
        //hacer diagrama de 1 - * y esas cosas porque una address puede tener varias cuentas y ergo varios posts de varias cuentas
        holder_tag[_account_tag] = msg.sender;
        return true;
    }


//
    function registerArtwork(string memory _account_tag, string memory _hash_art, 
                            SignatureRSV calldata signed) public returns (string memory){
        address signer = _getSigner(signed);   
        address holder = holder_tag[_account_tag];                     
        require(msg.sender == holder, "Message Sender is not the owner of the art account");
        require(msg.sender == signer, "Message Sender does not have access to this wallet account");
        require(signed._hashCodeCert == keccak256(abi.encodePacked(Strings.toString(nonce_sign[signer]))), "Wrong signature. Access denied - Authentication Failed");

        nonce_sign[signer] = nonce_sign[signer] + 1; //avoid signed message being stolen and used in future

        emit NewRegisteredConsentForArtwork(msg.sender, _account_tag, _hash_art);
        holder_artworks[holder].push(_hash_art);
        
        return _hash_art;
    } 

    // anyone should be able of checking registered hashes of artworks
    function checkRegisteredArtworks(string memory _account_tag) public view returns(string[] memory){
        address holder = holder_tag[_account_tag];
        string[] storage list_registered_artworks = holder_artworks[holder];

        return list_registered_artworks;
    }



///// Signer check /////
    function _getSigner(SignatureRSV memory signed) internal pure returns (address) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHashMessage = keccak256(abi.encodePacked(prefix, signed._hashCodeCert));
        address signer = ecrecover(prefixedHashMessage, signed._v, signed._r, signed._s);        
        
        return signer;
    }

/// get Nonce for signatures //
    function getNonce(address holder) public view returns (uint256){
        return nonce_sign[holder];
    }

}


