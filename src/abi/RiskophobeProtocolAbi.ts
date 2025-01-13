export const abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      }
    ],
    name: "SafeERC20FailedOperation",
    type: "error"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "creator",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "FeesClaimed",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "offerId",
        type: "uint256"
      },
      {
        indexed: true,
        internalType: "address",
        name: "creator",
        type: "address"
      },
      {
        indexed: false,
        internalType: "address",
        name: "collateralToken",
        type: "address"
      },
      {
        indexed: false,
        internalType: "address",
        name: "soldToken",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "soldTokenAmount",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "exchangeRate",
        type: "uint256"
      }
    ],
    name: "OfferCreated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "offerId",
        type: "uint256"
      }
    ],
    name: "OfferRemoved",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "offerId",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "SoldTokensAdded",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "offerId",
        type: "uint256"
      },
      {
        indexed: true,
        internalType: "address",
        name: "participant",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "soldTokenAmount",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "netCollateralAmount",
        type: "uint256"
      }
    ],
    name: "TokensBought",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "offerId",
        type: "uint256"
      },
      {
        indexed: true,
        internalType: "address",
        name: "participant",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "collateralAmount",
        type: "uint256"
      }
    ],
    name: "TokensReturned",
    type: "event"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_offerId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_soldTokenAmount",
        type: "uint256"
      }
    ],
    name: "addSoldTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_offerId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_collateralAmountIn",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_minSoldTokenAmountOut",
        type: "uint256"
      }
    ],
    name: "buyTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_tokenAddress",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_claimAmount",
        type: "uint256"
      }
    ],
    name: "claimFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "offerId",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "collateralDeposits",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_collateralToken",
        type: "address"
      },
      {
        internalType: "address",
        name: "_soldToken",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_soldTokenAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_exchangeRate",
        type: "uint256"
      },
      {
        internalType: "uint16",
        name: "_creatorFeeBp",
        type: "uint16"
      },
      {
        internalType: "uint32",
        name: "_startTime",
        type: "uint32"
      },
      {
        internalType: "uint32",
        name: "_endTime",
        type: "uint32"
      }
    ],
    name: "createOffer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "creator",
        type: "address"
      },
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "creatorFees",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    name: "offers",
    outputs: [
      {
        internalType: "address",
        name: "creator",
        type: "address"
      },
      {
        internalType: "uint16",
        name: "creatorFeeBp",
        type: "uint16"
      },
      {
        internalType: "uint32",
        name: "startTime",
        type: "uint32"
      },
      {
        internalType: "uint32",
        name: "endTime",
        type: "uint32"
      },
      {
        internalType: "contract IERC20Metadata",
        name: "collateralToken",
        type: "address"
      },
      {
        internalType: "contract IERC20Metadata",
        name: "soldToken",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "soldTokenAmount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "exchangeRate",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "collateralBalance",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_offerId",
        type: "uint256"
      }
    ],
    name: "removeOffer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_offerId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_collateralAmount",
        type: "uint256"
      }
    ],
    name: "returnTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;
