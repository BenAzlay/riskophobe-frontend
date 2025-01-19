import ERC20Token from "./ERC20Token";

export default interface CreatorFee {
    id: string;
    creator: string;
    token: ERC20Token;
    amount: number;
  }