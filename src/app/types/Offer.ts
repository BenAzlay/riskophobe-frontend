import ERC20Token from "./ERC20Token";

export default interface Offer {
    id: string;
    creator: string;
    startTime: number;
    endTime: number;
    creatorFeeBp: number;
    collateralToken: ERC20Token;
    soldToken: ERC20Token;
    soldTokenAmount: number;
    exchangeRate: number;
    collateralBalance: number;
  }