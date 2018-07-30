declare var require: any

import { Component ,HostListener} from '@angular/core';
import { FormControl } from '@angular/forms';
// import * as Web3 from 'web3';
// import {UtilModule} from './util/util.module';
import * as contract from 'truffle-contract';
const Web3 = require('web3');
const abi = require('ethereumjs-abi');

declare var window: any;

const MultiSigDocumentRegistryArtifacts = require('./contracts/MultiSigDocumentRegistry.json');
const MultiSigDocumentWithStorageArtifacts = require('./contracts/MultiSigDocumentWithStorage.json');


// import * as MultiSigDocumentRegistry from './MultiSigDocumentRegistry.json';
// const Web3 = require('web3');
// const ETH_NODE = "http://localhost:7545";
// const web3 = new Web3(new Web3.providers.HttpProvider(ETH_NODE));
// console.log(web3);
// const Web3 = require('web3');
// const contract = require('truffle-contract');

//let multiSigDocumentRegistryAbi = MultiSigDocumentRegistry.abi;
//
// console.log(multiSigDocumentRegistryAbi);
// export const genSig = (contractAddr, signer, verifierAddr, dataHex = '') => {
//
//     const message = contractAddr.substr(2) + verifierAddr.substr(2) + dataHex;
//     // ^ substr to remove `0x` because in solidity the address is a set of byes, not a string `0xabcd`
//     const messageHash = web3.utils.sha3(message, {encoding:'hex'});
//
//     return web3.eth.sign(signer, messageHash);
// };



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  registryAddress: FormControl = new FormControl();
  docAddress: FormControl = new FormControl();
  verifierAddress: FormControl = new FormControl();
  signerAddress: FormControl = new FormControl();
  documentProof: string;
  generatedString: FormControl = new FormControl();
  canDisplay: boolean;
  account: any;
  accounts: any;
  web3: any;
  multiSigDocumentRegistryAbi: any;
  documentABI: any;
  doc: any;

  constructor() {

    // window.addEventListener('load', (event) => {
      this.checkAndInstantiateWeb3();
    // });
    // console.log('Constructor: ' + web3Service);
    // console.log(web3);
    this.registryAddress.valueChanges.subscribe(
      val => {
        if (!this.isHexValue(val)) {
          this.registryAddress.setErrors({message: 'Invalid Registry address. Example: 0x12345abcd'});
        }

      }
    );

    this.docAddress.valueChanges.subscribe(
      val => {
        if (!this.isHexValue(val)) {
          this.docAddress.setErrors({message: 'Invalid Dac address. Example: 0x12345abcd'});
        }
        // var contractAbi = this.web3.eth.contract(this.documentABI.abi);
        this.doc = new this.web3.eth.Contract(this.documentABI,this.docAddress.value);
        // this.doc.setProvider(this.web3.currentProvider);
        console.log(this.doc);
        this.doc.methods.verifier().call().then((result) => {
          this.verifierAddress.setValue(result);
          // this.accounts = web3.eth.accounts;
          // this.signerAddress.setValue(this.accounts);
        });

        this.doc.methods.getProofHash().call().then((result) => {
          this.documentProof = result;
        });
      }
    );

    this.verifierAddress.valueChanges.subscribe(
      val => {
        if (!this.isHexValue(val)) {
          this.verifierAddress.setErrors({message: 'Invalid Verifier address. Example: 0x12345abcd'});
        }
      }
    );

    this.signerAddress.valueChanges.subscribe(
      val => {
        if (!this.isHexValue(val)) {
          this.signerAddress.setErrors({message: 'Invalid Signer address. Example: 0x12345abcd'});
        }
        this.doc.methods.signerProperties(this.signerAddress.value).call().then((result) => {
          console.log(result);
        })
      }
    );
    // this.documentProof.valueChanges.subscribe(
    //   val => {
    //     if (!this.isHexValue(val)) {
    //       this.documentProof.setErrors({message: 'Invalid Signer address. Example: 0x12345abcd'});
    //     }
    //   }
    // );
  }
  @HostListener('window:load')
  windowLoaded() {
    // this.checkAndInstantiateWeb3();
    // this.onReady();
    this.initAbi();

}
  checkAndInstantiateWeb3() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if ( typeof window.web3 !== 'undefined' ) {
      console.warn('Using web3 detected from external source. If you find that your accounts don\'t appear or you have ' +
        '0 MetaCoin, ensure you\'ve configured that source properly. If using MetaMask, see the following link. Feel ' +
        'free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask');
      // Use Mist/MetaMask's provider
      this.web3 = new Web3(window.web3.currentProvider);

    } else {
      console.warn('No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when ' +
        'you deploy live, as it\'s inherently insecure. Consider switching to Metamask for development. More info ' +
        'here: http://truffleframework.com/tutorials/truffle-and-metamask');
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    }
  }
  onReady = () => {
    // Bootstrap the MetaCoin abstraction for Use.
    // this.Coin.setProvider(this.web3.currentProvider);
    // Get the initial account balance so it can be displayed.
    // this.web3.eth.getAccounts((err, accs) => {
    //   if (err != null) {
    //     alert('There was an error fetching your accounts.');
    //     return;
    //   }
    //
    //   if (accs.length === 0) {
    //     alert(
    //       'You are not connected to an Ethereum client. You can still browse the data, but you will not be able to perform transactions.'
    //     );
    //     return;
    //   }
    //   this.accounts = accs;
    //   this.account = this.accounts[0];
    //
    //   // This is run from window:load and ZoneJS is not aware of it we
    //   // need to use _ngZone.run() so that the UI updates on promise resolution
    //   this._ngZone.run(() =>{
    //     //Initial loading of UI
    //     //Load balances or whatever
    //   });
    //
    // });

  };

  generateSig() {

  const hash = "0x" + abi.soliditySHA3(
    ["address", "address", "bytes32"],
    [this.docAddress.value, this.verifierAddress.value, this.documentProof]
  ).toString("hex");

  console.log("ABI Sha3: "+hash);

   var signer = this.signerAddress.value.toString().toLowerCase();
   this.web3.eth.personal.sign(hash,signer, (err, val) => {
     // console.log(val.toString());
     console.log(val);
      this.generatedString.setValue(val);
   });

  }
  initAbi() {
    this.multiSigDocumentRegistryAbi = MultiSigDocumentRegistryArtifacts.abi;
    this.documentABI = MultiSigDocumentWithStorageArtifacts.abi;
  }

  sign() {

    var signer = this.signerAddress.value.toLowerCase();
    // var doc = this.documentABI.at(this.docAddress.value);
    console.log(this.generatedString);

    this.doc.methods
      .signDocument(this.generatedString.value)
      .send({ from:signer, gas: 200000})
      .on('transactionHash', function(hash){
          alert("TxId: "+hash);

      })
      .on('receipt', function(receipt){
          console.log(receipt);
      })
      .on('confirmation', function(confirmationNumber, receipt){
          alert("Transaction confirmed!");
      })
      .on('error', console.error);
  }

  isHexValue(value: string): boolean {
    const regExp = new RegExp(/0[xX][0-9a-fA-F]+/);
    return regExp.test(value);
  }
}
