import React, { useEffect, useState } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import TicketNFTGenerator from './utils/TicketNFTGenerator.json';
import { ethers } from 'ethers';

const TWITTER_HANDLE = 'danilodughetti';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_SUPPLY = 100;
const CONTRACT_ADDRESS = '0x39A51473674988897bEC93b7d8D449032a748884';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [statusEvent, setStatusEvent] = useState('');
  const [buttonStatus, setButtonStatus] = useState(false);
  const [tokenList, setTokenList] = useState([]);
  const [tokenListLength, setTokenListLength] = useState(0);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log('Make sure you have metamask!');
      return;
    } else {
      console.log('We have the ethereum object', ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log('Connected to chain ' + chainId);

    const rinkebyChainId = '0x5';
    if (chainId !== rinkebyChainId) {
      alert('You are not connected to the Goerli Test Network!');
    }

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log('Found an authorized account:', account);
      setCurrentAccount(account);

      setupEventListener();
    } else {
      console.log('No authorized account found');
    }
  };

	/*
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const setupEventListener = async () => {
    console.log('setupEventListener');
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          TicketNFTGenerator.abi,
          signer
        );

        connectedContract.on('TicketMinted', (from, tokenId, counter) => {
          setStatusEvent(
            `NFT edition ${counter}/${TOTAL_SUPPLY} minted! It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });

        connectedContract.on('TicketToShow', (tokenId, tokenUrl) => {
          let _tokenList = tokenList;
          _tokenList.push({ tokenId: tokenId, tokenUrl: tokenUrl });
          //_tokenList.push(tokenUrl);
          setTokenList(_tokenList);
          setTokenListLength(tokenList.length);
          console.log('**********************************');
          console.log(tokenList.length);
          console.log(tokenList);
          console.log('**********************************');
        });

        setButtonStatus(false);
        console.log('Setup event listener!');
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getTokenList = async () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const connectedContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      TicketNFTGenerator.abi,
      signer
    );

    connectedContract.getTokenList();
    console.log('getTokenList done');
  };

  const askContractToMintToken = async () => {
    setButtonStatus(true);
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          TicketNFTGenerator.abi,
          signer
        );

        console.log('Going to pop wallet now to pay gas...');
        let nftTxn = await connectedContract.mintTicket({ gasLimit: 1000000 });
        setStatusEvent("I'm minting your NFT...");

        console.log('Mining...please wait.');
        await nftTxn.wait();

        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${
          nftTxn.hash
          }`
        );
      } else {
        console.log("Ethereum object doesn't exist!");
        setButtonStatus(false);
      }
    } catch (error) {
      console.log(error);
      setButtonStatus(false);
    }
  };

  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
		</button>
  );

  const renderTokenList = () => {
    let _tokenList = [];
    for (var i = 0; i < tokenList.length; i++) {
      _tokenList.push(
        <span className="tokenList" key={i}>
          {' '}
          {tokenList[i].tokenId} {tokenList[i].tokenUrl}{' '}
        </span>
      );
    }
    return { _tokenList };
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Ticket NFT generator</p>
          <p className="sub-text">
            This dApp let you mint a Ticket as NFT. You will receive a ticket
						with a random rarity (Common, rare, super-rare).
					</p>
          {currentAccount === '' ? (
            renderNotConnectedContainer()
          ) : (
              <button
                disabled={buttonStatus}
                onClick={askContractToMintToken}
                className="cta-button connect-wallet-button"
              >
                Mint Ticket
						</button>
            )}
          <br />
          <br />
          <button
            onClick={getTokenList}
            className="cta-button connect-wallet-button"
          >
            Get NFT List
					</button>

          {tokenListLength > 0 ? (
            <div className="status-label">
              rendered tokens:
							{tokenList.map(
                (token, index) =>
                  +(
                    <div key={index}>
                      {' '}
                      {token.tokenId._hex} - {token.tokenUrl}
                    </div>
                  )
              )}
            </div>
          ) : (
              <p>No tokens to show</p>
            )}
          <div className="status-label">{statusEvent}</div>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
