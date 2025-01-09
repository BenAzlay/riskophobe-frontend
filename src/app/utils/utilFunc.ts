import { ethers } from "ethers";

export const getTimestampSecondsFromDate = (date: Date): number => {
  return Math.floor(date.getTime() / 1000);
};

export const getCurrentTimestampSeconds = (): number => {
  return getTimestampSecondsFromDate(new Date());
};

export const addressShorten = (address: string): string => {
  if (!ethers.isAddress(address)) return "";
  return `${address.slice(0, 6)}...${address.slice(address.length - 4, address.length)}`;
};
