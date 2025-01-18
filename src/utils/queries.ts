import { gql } from "graphql-request";

export interface Token {
  id: string;
  symbol: string;
  decimals: number;
}

// GET OFFERS
export const getOffersQuery = gql`
  query GetOffers {
    offers(first: 1000, orderDirection: asc) {
      id
      creator
      startTime
      endTime
      creatorFeeBp
      collateralToken {
        id
        symbol
        decimals
      }
      soldToken {
        id
        symbol
        decimals
      }
      soldTokenAmount
      exchangeRate
      collateralBalance
    }
  }
`;

export interface Offer {
  id: string;
  creator: string;
  startTime: number;
  endTime: number;
  creatorFeeBp: number;
  collateralToken: Token;
  soldToken: Token;
  soldTokenAmount: number;
  exchangeRate: number;
  collateralBalance: number;
}

// GET OFFERS
export const getDepositsQuery = gql`
  query GetDeposits($participant: String!) {
    deposits(
      first: 1000
      orderDirection: asc
      where: { participant: $participant }
    ) {
      id
      netCollateralAmount
      participant
      offerId
    }
  }
`;

export interface Deposit {
  id: string;
  netCollateralAmount: number;
  participant: string;
  offerId: string;
}
