# Riskophobe

Riskophobe is a decentralized application (dApp) that introduces options to the cryptocurrency space, enabling users to buy tokens with the flexibility to return them and get their money back. This innovative approach empowers users to better manage their financial exposure and risk within the DeFi ecosystem.

---

## Features

- **Options Functionality**: Buy tokens with the assurance of returning them for collateral.
- **Flexibility**: Empower users to reclaim collateral under specific conditions.
- **Transparency**: Built on Ethereum's Base Layer to ensure trust and security.

### Smart Contract Address

The Riskophobe protocol is deployed on the Base network with the following address:

**`0x0bBEeEab55594F1A03A2b34A6e454fb1d85519e4`**

### Live DApp

Access the live dApp here: [Riskophobe](https://riskophobe.com/)

---

## Installation and Running Locally

Follow the steps below to set up the project locally:

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

### Clone the Repository

```bash
# Clone the repository
$ git clone https://github.com/BenAzlay/riskophobe-frontend.git

# Navigate to the project directory
$ cd riskophobe
```

### Install Dependencies

```bash
# Using npm
$ npm install

# Or using yarn
$ yarn install
```

### Environment Configuration

Create a `.env.local` file in the root directory and populate it with the required environment variables. Use `.env.example` (if available) as a reference.

### Running the Development Server

```bash
# Start the development server
$ npm run dev

# Or using yarn
$ yarn dev
```

Visit `http://localhost:3000` in your browser to see the application in action.

### Build for Production

```bash
# Build the application
$ npm run build

# Or using yarn
$ yarn build

# Start the production server
$ npm run start

# Or using yarn
$ yarn start
```

### Linting and Code Quality

To lint and check for code quality issues, run:

```bash
# Using npm
$ npm run lint

# Or using yarn
$ yarn lint
```

---

## Technology Stack

### Frontend

- **Framework**: Next.js
- **Styling**: TailwindCSS and DaisyUI
- **Web3 Interaction**: Wagmi and ethers.js
- **State Management**: Zustand
- **GraphQL**: graphql-request

### Backend

- **Smart Contract**: Solidity
- **Network**: Base (Ethereum Layer 2)
- **GraphQL Subgraph**: Custom integration

---

## Smart Contract Details

Riskophobe’s smart contract is deployed on the Base network and supports the following operations:

- **Create Offer**: Establish a new option offer.
- **Buy Tokens**: Participate in an offer by purchasing tokens.
- **Return Tokens**: Redeem collateral by returning purchased tokens.
- **Claim Fees**: Collect fees accrued from offers.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Contribution

Contributions are welcome! Please follow the steps below to contribute:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature description'`
4. Push to the branch: `git push origin feature-name`
5. Create a pull request.
