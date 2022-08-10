<a name="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<br />
<div align="center">
  <a href="https://github.com/DaniloDughetti">
    <img src="https://gateway.pinata.cloud/ipfs/QmXhXLFCVjRvjVyZQZ8QAixPALjPQJq2StjiKNjrs1pzNt" alt="Logo" width="120" height="120">
  </a>

  <h3 align="center">Ticket NFT Generator Front End</h3>

  <p align="center">
    React dApp developed on Replit for Ticket NFT Generator smart contract.
    <br />
    <a href="https://github.com/DaniloDughetti/ticket-nfts-fe"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/DaniloDughetti/ticket-nfts-fe/issues">Report Bug</a>
    ·
    <a href="https://github.com/DaniloDughetti/ticket-nfts-fe/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

Ticket NFT Generator want to be a dApp that enables users to mint a ticket NFT.
These tickets have different rarity (commmon, rare, super-rare).

This project is composed in 3 component:
- **TicketNFTGenerator**: Solidity smart contract
- **TicketNFTGenerator-fe** React front end interacting to smart contract
- **IPFS**: NFT Metadata decentalized storage

Features:
- Mint random NFT
- View owned NFTs
- Send NFT to another address
- Governance functions like send balance, pause contract, edit supply, mint price ecc

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

Major frameworks/libraries used to bootstrap project:

- **Solidity** v0.8.1
- **Hardhat** v8.5.0
- **Node** v16.14.2

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

### Prerequisites

You need to install Node, npm and hardhat
* node
  ```sh
  apt-get install node@16.14.2 -g
  ```
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

_Below the commands list needed to run project locally_

1. Clone the repo
   ```sh
   git clone https://github.com/DaniloDughetti/ticket-nfts-fe.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Register a free node endpoint at [QuickNode](https://www.quicknode.com/) and copy/paste API KEY and PRIVATE KEY
4. Edit environment variables in `.env`
   ```js
    QUICKNODE_API_KEY_URL=<RINKEBY QUICKNODE ENDPOINT API KEY>
    RINKEBY_PRIVATE_KEY=<RINKEBY METAMASK PRIVATE KEY>
    PROD_QUICKNODE_KEY=<MAIN NET QUICKNODE ENDPOINT API KEY>
    PRIVATE_KEY=<MAIN NET METAMASK PRIVATE KEY>
    MAX_SUPPLY=100
   ```
5. Deploy smart contract on Rinkeby
   ```sh
   npx hardhat run scripts/deploy.js
   ```
   
<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

Once deployed, you can see your smart contract on Etherscan and interact directly. Otherwise you have to install and deplooy Ticket Nft Generator Front End to interact with smart contract through UI.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Roadmap

- [ ] Add Changelog
- [ ] Add unit tests
- [ ] Add asserts
- [ ] Multi-language Support
    - [ ] Italian
    - [ ] Spanish
    - [ ] German

See the [open issues](https://github.com/DaniloDughetti/ticket-nfts-fe/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

Danilo Dughetti - [@danilodughetti](https://twitter.com/danilodughetti) - danilo.dughetti@gmail.com

Project Link - [https://github.com/DaniloDughetti/ticket-nfts-fe](https://github.com/DaniloDughetti/ticket-nfts-fe)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

[contributors-shield]: https://img.shields.io/github/contributors/DaniloDughetti/ticket-nfts-fe.svg?style=for-the-badge
[contributors-url]: https://github.com/DaniloDughetti/ticket-nfts-fe/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/DaniloDughetti/ticket-nfts-fe.svg?style=for-the-badge
[forks-url]: https://github.com/DaniloDughetti/ticket-nfts-fe/network/members
[stars-shield]: https://img.shields.io/github/stars/DaniloDughetti/ticket-nfts-fe.svg?style=for-the-badge
[stars-url]: https://github.com/DaniloDughetti/ticket-nfts-fe/stargazers
[issues-shield]: https://img.shields.io/github/issues/DaniloDughetti/ticket-nfts-fe.svg?style=for-the-badge
[issues-url]: https://github.com/DaniloDughetti/ticket-nfts-fe/issues
[license-shield]: https://img.shields.io/github/license/DaniloDughetti/ticket-nfts-fe.svg?style=for-the-badge
[license-url]: https://github.com/DaniloDughetti/ticket-nfts-fe/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/danilodughetti