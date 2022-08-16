import React, { useEffect, useState } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import refreshIcon from './assets/refresh-icon.svg';
import TicketNFTGenerator from './utils/TicketNFTGenerator.json';
import { ethers } from 'ethers';
import axios from 'axios';


const TWITTER_HANDLE = 'danilodughetti';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_SUPPLY = 100;
const CONTRACT_ADDRESS = '0xefc3060AF6c2147C044E169Bdcd7dACdF25418a0';
const API_KEY = "TTH82UMFMKUSWYII2XESH728527BNFAG83";
const BASE_URL = `https://api-goerli.etherscan.io/api?module=account&action=tokennfttx&contractaddress=${CONTRACT_ADDRESS}&page=1&offset=100&startblock=0&sort=asc&apikey=${API_KEY}`

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [statusEvent, setStatusEvent] = useState('');
  const [buttonStatus, setButtonStatus] = useState(false);
  const [tokenList, setTokenList] = useState([]);
  const [isTokensLoading, setIsTokensLoading] = useState(true);
  const [tokensSupplyStatus, setTokensSupplyStatus] = useState({});

  const isAddressEqual = (address, addressToCompare) => {
    return (address !== null && address !== undefined) &&
      (addressToCompare !== null && addressToCompare !== undefined) &&
      address.toUpperCase() === addressToCompare.toUpperCase();
  }

  const getTokensSupplyStatus = async () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const connectedContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      TicketNFTGenerator.abi,
      signer
    );
    let contractCalls = [];
    contractCalls.push(connectedContract.getTokenCounter());
    contractCalls.push(connectedContract.getMaxSupply());

    Promise.all(contractCalls).then(response => {
      setTokensSupplyStatus({
        currentToken: response[0].toNumber(),
        maxSupply: response[1].toNumber()
      });
    }).catch(error => {
      console.log(error);
      setTokensSupplyStatus({ currentToken: 0, maxSupply: 0 });
    })
  }

  const setTokenListFromEtherScan = async (address) => {
    console.log("setTokenListFromEtherScan");
    let baseUrl = BASE_URL + '&address=' + address;
    let tokenIds = [];
    console.log(baseUrl);
    axios.get(baseUrl)
      .then(response => {
        if (response !== null && response !== undefined) {

          for (let i = 0; i < response.data.result.length; i++) {
            if (isAddressEqual(response.data.result[i].contractAddress, CONTRACT_ADDRESS)) {
              tokenIds.push(response.data.result[i].tokenID);
            }
          }
        }
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
            let tokenUrls = [];
            console.log("tokenIds");
            console.log(tokenIds);
            if (tokenIds !== null && tokenIds !== undefined && tokenIds.length > 0) {

              setIsTokensLoading(true);
              for (let i = 0; i < tokenIds.length; i++) {
                tokenUrls.push(connectedContract.tokenURI(tokenIds[i]));
                Promise.all(tokenUrls).then(token => {
                  let axiosGets = [];
                  for (let i = 0; i < token.length; i++) {
                    let url = token[i].replace("ipfs://", "https://ipfs.io/ipfs/");
                    console.log(url);
                    axiosGets.push(axios.get(url));

                    Promise.all(axiosGets).then(response => {
                      let _tokenList = [];
                      for (let i = 0; i < response.length; i++) {
                        let _token = response[i].data;
                        _token.tokenId = tokenIds[i];
                        _tokenList.push(_token);
                      }
                      setTokenList(_tokenList);
                      setIsTokensLoading(false);
                    }).catch(error => console.log(error));
                  }
                }).catch(error => console.log(error));
              }
            }
          }
        } catch (error) {
          console.log(error);
        }
      }).catch(error => console.log(error));
  }

  const refreshTokenList = async () => {
    const { ethereum } = window;
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    const account = accounts[0];
    setTokenListFromEtherScan(account);
  }

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

    const goerliChainId = '0x5';
    if (chainId !== goerliChainId) {
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
      refreshTokenList();
      getTokensSupplyStatus();

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
          refreshTokenList();
          getTokensSupplyStatus();
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
          `Mined, see transaction: https://goerli.etherscan.io/tx/${
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
        <div className="tokenItem" key={i}>
          <div className="tokenTitle">
            {tokenList[i].name}
          </div>
          <div className="tokenDescription">
            {tokenList[i].description}
          </div>
          <div className="tokenImage">
            <img src={tokenList[i].image}></img>
          </div>
        </div>
      );
    }
    return _tokenList;
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    refreshTokenList();
    getTokensSupplyStatus();
  }, []);

  const getCurrentAccountCropped = (account) => {

    return account.substring(0, 3) + "..." + account.substring(account.length - 3, account.length);
  }

  return (
    <div className="App">
      <div className="navbar">
        <p className="header gradient-text">Ticket NFT generator</p>
        {currentAccount === '' ? (
          renderNotConnectedContainer()
        ) : (
            <div>
              <button
                disabled="true"
                className="cta-button connect-wallet-button"
              >
                {getCurrentAccountCropped(currentAccount)}
              </button>
            </div>
          )}
      </div>
      <div className="container">
        <div className="header-container">

          <p className="sub-text disclaimer">
            This dApp let you mint a Ticket as NFT. You will receive a ticket
            with a random rarity (Common, rare, super-rare).
          </p>
          {currentAccount === '' ? (
            renderNotConnectedContainer()
          ) : (
              <div>
                <button
                  disabled={buttonStatus}
                  onClick={askContractToMintToken}
                  className="cta-button connect-wallet-button"
                >
                  Mint Ticket {tokensSupplyStatus.currentToken} / {tokensSupplyStatus.maxSupply}
                </button>

                <div className="status-label">{statusEvent}</div>
                <div className="viewTokensTitle"> Your minted tickets
                  <button
                    disabled={isTokensLoading}
                    onClick={refreshTokenList}
                    title="Refresh in case you don't see your token yet"
                    className="refreshButton"
                  >
                    <img className="icon" src={refreshIcon}></img>
                  </button></div>
                <div className="tokenList">
                  {isTokensLoading === false ? renderTokenList() : <div></div>}
                </div>
              </div>
            )}
          <br />
          <br />
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
