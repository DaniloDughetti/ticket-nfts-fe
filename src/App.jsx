import React, { useEffect, useState } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import refreshIcon from './assets/refresh-icon.svg';
import sendIcon from './assets/send-icon.svg';
import TicketNFTGenerator from './utils/TicketNFTGenerator.json';
import { ethers } from 'ethers';
import axios from 'axios';

const TWITTER_HANDLE = 'danilodughetti';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const TOTAL_SUPPLY = 100;
const CONTRACT_ADDRESS = '0x736E5ff0ABe12F8920CEF676354d36c8F093E68b';
const OWNER_ADDRESS = "0xb0D8de893253A41f61Bd8D538D988CE246280Ac1";
const API_KEY = 'TTH82UMFMKUSWYII2XESH728527BNFAG83';
const BASE_URL = `https://api-goerli.etherscan.io/api?module=account&action=tokennfttx&contractaddress=${CONTRACT_ADDRESS}&page=1&offset=100&startblock=0&sort=asc&apikey=${API_KEY}`;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [statusEvent, setStatusEvent] = useState('');
  const [buttonRandomStatus, setButtonRandomStatus] = useState('');
  const [buttonMintStatus, setButtonMintStatus] = useState(false);
  const [tokenList, setTokenList] = useState([]);
  const [isTokensLoading, setIsTokensLoading] = useState(true);
  const [tokensSupplyStatus, setTokensSupplyStatus] = useState({});
  const [inputAddress, setInputAddress] = useState([]);
  const [isTokenSendLoading, setIsTokenSendLoading] = useState(false);
  const [isAddressOwner, setIsAddressOwner] = useState(false);
  const [addressSending, setAddressSending] = useState('');

  /*
    Utility methods
  */
  const isOwner = (account) => {
    return isAddressEqual(OWNER_ADDRESS, account);
  }

  const getRandomNumber = (min, max) => {
    let difference = max - min;
    let randomNumber = Math.random();
    randomNumber = Math.floor(randomNumber * difference);
    randomNumber = randomNumber + min;
    return randomNumber;
  }


  const getAddressToSend = (index) => {
    let address = getCurrentAccountCropped(addressSending);
    return <div key={"account" + index}>{address}</div>;
  }

  const isAddressEqual = (address, addressToCompare) => {
    return (
      address !== null &&
      address !== undefined &&
      (addressToCompare !== null && addressToCompare !== undefined) &&
      address.toUpperCase() === addressToCompare.toUpperCase()
    );
  };

  const uniqByKeepFirst = (a, key) => {
    let seen = new Set();
    return a.filter(item => {
      let k = key(item);
      return seen.has(k) ? false : seen.add(k);
    });
  };

  const onChangeAddressHandler = (event, index) => {
    const value = event.target.value;
    let addresses = inputAddress;
    addresses[index] = value;
    setInputAddress(addresses);
  };

  const getCurrentAccountCropped = account => {
    try {
      return (
        account.substring(0, 3) +
        '...' +
        account.substring(account.length - 3, account.length)
      );
    } catch (error) {
      console.log(error);
      return '';
    }
  };

  /*
    Contract request methods
  */
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
    contractCalls.push(connectedContract.getMintPrice());
    contractCalls.push(connectedContract.getUpdatedUpperLimitCommon());
    contractCalls.push(connectedContract.getUpdatedUpperLimitRare());

    Promise.all(contractCalls)
      .then(response => {

        let mintPrice = response[2] !== null && response[2] !== undefined ? ethers.utils.formatUnits(response[2].toNumber(), "ether") : null;
        setTokensSupplyStatus({
          currentToken: response[0].toNumber(),
          maxSupply: response[1].toNumber(),
          mintPrice: mintPrice,
          updatedUpperLimitCommon: response[3].toNumber(),
          updatedUpperLimitRare: response[4].toNumber(),
        });
      })
      .catch(error => {
        console.log(error);
        setTokensSupplyStatus({ currentToken: null, maxSupply: null, mintPrice: null, updatedUpperLimitCommon: null, updatedUpperLimitRare });
      });
  };

  const setTokenListFromEtherScan = async address => {
    let baseUrl = BASE_URL + '&address=' + address;
    let tokenIds = [];
    console.log(baseUrl);
    axios
      .get(baseUrl)
      .then(response => {
        if (response !== null && response !== undefined) {
          for (let i = 0; i < response.data.result.length; i++) {
            if (
              isAddressEqual(
                response.data.result[i].contractAddress,
                CONTRACT_ADDRESS
              )
            ) {
              tokenIds.push(response.data.result[i].tokenID);
            }
          }
        }
        tokenIds = uniqByKeepFirst(tokenIds, it => it);

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
            if (
              tokenIds !== null &&
              tokenIds !== undefined &&
              tokenIds.length > 0
            ) {
              setIsTokensLoading(true);
              for (let i = 0; i < tokenIds.length; i++) {
                tokenUrls.push(connectedContract.tokenURIIfOwned(tokenIds[i]));
              }

              Promise.all(tokenUrls)
                .then(token => {
                  var ownedTokenIds = [];
                  let axiosGets = [];
                  for (let i = 0; i < token.length; i++) {
                    if (token[i] !== '') {
                      ownedTokenIds.push({ tokenId: tokenIds[i] });
                      let url = token[i].replace(
                        'ipfs://',
                        'https://ipfs.io/ipfs/'
                      );
                      axiosGets.push(axios.get(url));
                    }
                  }
                  Promise.all(axiosGets)
                    .then(response => {
                      let _tokenList = [];
                      for (let i = 0; i < response.length; i++) {
                        let _token = response[i].data;
                        _token.tokenId = ownedTokenIds[i].tokenId;
                        _tokenList.push(_token);
                      }
                      setTokenList(_tokenList);
                      setIsTokensLoading(false);
                    })
                    .catch(error => console.log(error));

                })
                .catch(error => console.log(error));
            }
          }
        } catch (error) {
          console.log(error);
        }
      })
      .catch(error => console.log(error));
  };

  const refreshTokenList = async () => {
    const { ethereum } = window;
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    const account = accounts[0];
    setTokenListFromEtherScan(account);
  };

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
      setIsAddressOwner(isOwner(account));
      console.log('Found an authorized account:', account);
      setCurrentAccount(account);

      setupEventListener();
    } else {
      console.log('No authorized account found');
    }
  };

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

  const askContractToGenerateRandomness = async () => {
    setButtonRandomStatus(true);
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
        connectedContract.requestRandomWords({ gasLimit: 1000000 }).then((response) => {
          setStatusEvent(`Requested to mix tickets...  
                        You can see transaction here: https://goerli.etherscan.io/tx/${
            response.hash}`);
        }).catch(error => {
          console.log("Error in retrieving random request");
          console.log(error);
          setStatusEvent("");
          setButtonRandomStatus(false);
        });
        console.log('Getting a random number, please wait...');
      } else {
        console.log("Ethereum object doesn't exist!");
        setStatusEvent("");
        setButtonRandomStatus(false);
      }
    } catch (error) {
      console.log(error);
      setStatusEvent("");
      setButtonRandomStatus(false);
    }
  };

  const askContractToMintToken = async () => {
    setButtonMintStatus(true);
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
        let randomNumber = getRandomNumber(0, 100);
        console.log(randomNumber);
        connectedContract.mintTicket(randomNumber, { value: ethers.utils.parseEther(tokensSupplyStatus.mintPrice), gasLimit: 1000000 }).then((response) => {
          console.log(response);
          setStatusEvent(`I'm minting your NFT... 
                        You can see transaction here: https://goerli.etherscan.io/tx/${
            response.hash}`);
          console.log('Mining...please wait.');
          console.log(
            `Mined, see transaction: https://goerli.etherscan.io/tx/${
            response.hash
            }`
          );
        }).catch(error => {
          console.log("Error in retrieving random request");
          console.log(error);
          setStatusEvent("");
          setButtonMintStatus(false);
        });

      } else {
        console.log("Ethereum object doesn't exist!");
        setStatusEvent("");
        setButtonMintStatus(false);
      }
    } catch (error) {
      setStatusEvent("");
      setButtonMintStatus(false);
    }
  };

  const sendGift = async (event, tokenId, index) => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const connectedContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      TicketNFTGenerator.abi,
      signer
    );
    setIsTokenSendLoading(true);
    setAddressSending(inputAddress[index]);
    connectedContract
      .givesToken(tokenId, inputAddress[index])
      .then(() => {
        refreshTokenList();
      })
      .catch(error => {
        alert(error.message);
        console.log(error);
        setIsTokenSendLoading(false);
      });
  };

  /*
    Event handler methods
  */
  const setupEventListener = async () => {
    console.log('setupEventListener started');
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

        connectedContract.on('TicketRandomnessGenerated', () => {
          getTokensSupplyStatus();
          setButtonRandomStatus(false);
          console.log("TicketRandomnessGenerated reached");
          setStatusEvent(
            `Ticket rarity changed, press mint button to mint your NFT`
          );
        });

        connectedContract.on('TicketMinted', (from, tokenId, counter) => {
          setStatusEvent(
            `NFT edition ${counter}/${TOTAL_SUPPLY} minted! It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
          setButtonMintStatus(false);
          refreshTokenList();
          getTokensSupplyStatus();
        });

        connectedContract.on('TicketSent', (tokenId, from, to) => {
          alert(
            `NFT edition ${tokenId}/${TOTAL_SUPPLY} correctly sent from address ${from} to address ${to}`
          );
          setIsTokenSendLoading(false);
          refreshTokenList();
        });

        console.log('Setup event done');
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /*
    UI Render methods
  */
  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
		</button>
  );

  const renderTokenList = () => {
    let tokenListToRender = [];
    tokenList.map((token, renderIndex) => {
      tokenListToRender.push(
        <div className="tokenItem" key={renderIndex}>
          <div className="tokenTitle">{token.name}</div>
          <div className="tokenDescription bold">
            Edition {token.tokenId}/{
              tokensSupplyStatus.maxSupply
            }
          </div>
          <div className="tokenDescription">
            {token.description}
          </div>
          <div className="tokenImage">
            <img src={token.image} />
          </div>
          {isTokenSendLoading === false ? (
            <div key={"description" + renderIndex} className="tokenDescription">
              Send to a friend:
							<input
                key={renderIndex}
                type="text"
                className="addressInput"
                onChange={(e) => onChangeAddressHandler(e, renderIndex)}
                value={inputAddress[renderIndex]}
              />
              <button
                key={'token_' + token.tokenId}
                onClick={(e) => sendGift(e, token.tokenId, renderIndex)}
                title="Send token"
                className="sendButton"
              >
                <img className="icon" src={sendIcon} />
              </button>
            </div>
          ) : (

              <div key={"description" + renderIndex} className="tokenDescription">
                <div
                  key={"SendingToken" + renderIndex}>
                  Sending token to{' '}
                  {
                    getAddressToSend(renderIndex)
                  }
                </div>
              </div>
            )}
        </div>
      );
    });
    return tokenListToRender;
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    refreshTokenList();
    getTokensSupplyStatus();
  }, []);

  return (
    <div className="App">
      <div className="navbar">
        <div className="header gradient-text">Ticket NFT generator</div>
        {currentAccount === '' ? (
          renderNotConnectedContainer()
        ) : (
            <div className="wallet-button">
              <button
                disabled={true}
                className="cta-button connect-wallet-button"
              >
                {getCurrentAccountCropped(currentAccount)}
              </button>
              <div className="status-text">
                {tokensSupplyStatus.currentToken}/{
                  tokensSupplyStatus.maxSupply} minted <br />{tokensSupplyStatus.mintPrice} ETH to mint <br />
                {tokensSupplyStatus.updatedUpperLimitCommon}%C{' '}
                {tokensSupplyStatus.updatedUpperLimitRare - tokensSupplyStatus.updatedUpperLimitCommon}%R{' '} 
                {100 - tokensSupplyStatus.updatedUpperLimitRare}%S
              </div>
            </div>
          )}
        {statusEvent !== '' ? (<div className="status-navbar">
          <div className="status-label">{statusEvent}</div>
        </div>) : (<div></div>)}
      </div>
      <div className="container">
        <div className="header-container">
          <p className="sub-text disclaimer">
            This dApp let you mint a Ticket as NFT.<br /> You will receive a ticket
						with a random rarity.
					</p>
          {currentAccount === '' ? (
            <div />
          ) : (
              <div>
                <button
                  title="Change rarity parameters"
                  disabled={buttonRandomStatus}
                  onClick={askContractToGenerateRandomness}
                  className={"cta-button connect-wallet-button" + (buttonRandomStatus ? "button-loading " : "") + (!isAddressOwner ? " hidden-button" : "")}
                >
                  Change rarity (only owner)
                 </button>
                )
                <br/><br/>
                <button
                  title="Click this button to mint your ticket NFT"
                  disabled={buttonMintStatus}
                  onClick={askContractToMintToken}
                  className={"cta-button connect-wallet-button" + (buttonMintStatus ? "button-loading " : "")}
                >
                  Mint Ticket
                 </button>
                <div className="viewTokensTitle">
                  {' '}
                  Your minted tickets
								<button
                    disabled={isTokensLoading}
                    onClick={refreshTokenList}
                    title="Refresh in case you don't see your token yet"
                    className="refreshButton"
                  >
                    <img className="icon" src={refreshIcon} />
                  </button>
                </div>
                <div className="tokenList">
                  {isTokensLoading === false ? renderTokenList() : <div />}
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
