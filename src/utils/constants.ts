const CONSTANTS = {
  // The following addresses are deployed on Base (id: 8453)
  RISKOPHOBE_CONTRACT: "0x0bBEeEab55594F1A03A2b34A6e454fb1d85519e4",
  TOKENS: [
    // WETH
    {
      address: "0x4200000000000000000000000000000000000006",
      priceFeedAddress: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70",
    },
    // USDC
    {
      address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
      priceFeedAddress: "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B",
    },
    // cbBTC
    {
      address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
      priceFeedAddress: "0x64c911996D3c6aC71f9b455B1E8E7266BcbD848F",
    }
  ],
  RISKOPHOBE_SUBGRAPH_ENDPOINT:
    "https://api.studio.thegraph.com/query/27003/riskophobe-base/version/latest",
};

export default CONSTANTS;
