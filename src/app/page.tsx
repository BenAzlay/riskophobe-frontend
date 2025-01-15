"use client";

import useStore from "@/store/useStore";
import { Fragment, ReactNode } from "react";
import Offer from "./types/Offer";
import Decimal from "decimal.js";
import { abbreviateAmount, getFormattedDateFromSecondsTimestamp } from "@/utils/utilFunc";

function App() {
  const { offers } = useStore();

  const offerItem = (offer: Offer, key: number): ReactNode => {
    const { soldToken, collateralToken, exchangeRate, creatorFeeBp, startTime, endTime } = offer;
    const collateralPerSoldToken = new Decimal(10 ** soldToken.decimals)
      .mul(10 ** 18)
      .div(exchangeRate)
      .div(10 ** collateralToken.decimals)
      .toString();
    const feePercent = new Decimal(creatorFeeBp).div(100).toFixed(2);
    const startDate = getFormattedDateFromSecondsTimestamp(startTime, true)
    const endDate = getFormattedDateFromSecondsTimestamp(endTime, true);
    return (
      <div
        key={key}
        className="transition rounded-md p-4 border-2 border-primary hover:border-secondary"
      >
        <h6 className="text-primary text-lg font-bold text-center">
          Buy {soldToken.symbol} for {collateralToken.symbol}
        </h6>
        <p className="inline-flex items-center gap-2">
          1{" "}
          <span className="inline-flex items-center gap-1">
            <img
              src={soldToken.logo}
              alt="logo"
              height={18}
              width={18}
              className="rounded-full"
            />
            <span>{soldToken.symbol}</span>
          </span>{" "}
          = {abbreviateAmount(collateralPerSoldToken, '', 2)}{" "}
          <span className="inline-flex items-center gap-1">
            <img
              src={collateralToken.logo}
              alt="logo"
              height={18}
              width={18}
              className="rounded-full"
            />
            <span>{offer.collateralToken.symbol}</span>
          </span>
        </p>
        <p>Fee: {feePercent}%</p>
        <p>Start: {startDate}</p>
        <p>End: {endDate}</p>
      </div>
    );
  };

  return (
    <Fragment>
      <div className="p-6">
        <div
          id="offers-grid"
          className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {offers.map((offer, index) => offerItem(offer, index))}
        </div>
      </div>
    </Fragment>
  );
}

export default App;
