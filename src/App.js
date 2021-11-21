import React, { useEffect, useState } from "react";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import myEpicNft from './utils/MyEpicNFT.json';
import { ethers, ethereum} from "ethers";

const TWITTER_HANDLE = 'kuulatte1';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/donutnft-rmddkrayzo';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0xB141B4D214Fb702c95AD17Dcf672682B2BD71d68";

const Loading = () => (<div className="lds-ring">
  <div></div>
  <div></div>
  <div></div>
  <div></div>
</div>)
const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [nftMintedCount, setNftMintedCount] = useState(0);

  const getInitialCount = async () => {
    const { ethereum } = window;

    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

    let mintedCount = await connectedContract.getMintedCount();
    setNftMintedCount(mintedCount.toNumber());
  }
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const isOnChain = isOnRinkedby();

    if(!isOnChain){
      return;
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account)

      setupEventListener();
    } else {
      console.log("No authorized account found")
    }
  }

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          setNftMintedCount(tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }


  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;
      const isOnChain = await isOnRinkedby();

      if(!isOnChain) {
        return;
      }

      setIsMinting(true);
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining...please wait.")
        await nftTxn.wait();

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);



      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }

    setIsMinting(false);
  }

  const isOnRinkedby = async () => {
    try {
      const { ethereum } = window;

      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);

// String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
        return false;
      }

    }catch (e){
      console.log(e)
    }
    return true;

  }


  /*
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const isOnChain = await isOnRinkedby();
      if(!isOnChain) return;

      /*
      * Fancy method to request access to account.
      */
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      /*
      * Boom! This should print out public address once we authorize Metamask.
      */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      setupEventListener();
    } catch (error) {
      console.log(error)
    }
  }

  // Render Methods
  const renderNotConnectedContainer = () => (
      <button onClick={connectWallet} className="cta-button connect-wallet-button">
        Connect to Wallet
      </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
    getInitialCount();
  }, [])

  /*
  * Added a conditional render! We don't want to show Connect to Wallet if we're already conencted :).
  */
  return (
      <div className="App">
        <div className="container">
          <div className="header-container">
            <p className="header gradient-text">My NFT Collection</p>
            <p className="sub-text">
              Each unique. Each beautiful. Discover your NFT today.
            </p>
            {currentAccount === "" ? (
                renderNotConnectedContainer()
            ) : (isMinting?
                (<div>
                  <Loading />
                </div>)
                :(<button onClick={askContractToMintNft} className={`cta-button connect-wallet-button ${isMinting && 'loading'}`}>
                    Mint NFT
                  </button>)
            )}
            <a
                className="footer-text width-100"
                href={OPENSEA_LINK}
                target="_blank"
                rel="noreferrer"
            >
              <button  className="cta-button connect-wallet-button" >
                🌊 View Collection on OpenSea
              </button>
            </a>

          </div>
          <p className="sub-text">
            ${nftMintedCount}/50 nft minted
          </p>
          <div className="footer-container">
            <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
            <a
                className="footer-text"
                href={TWITTER_LINK}
                target="_blank"
                rel="noreferrer"
            >{`built on @${TWITTER_HANDLE}`}</a>
          </div>
        </div>
      </div>
  );
};

export default App;