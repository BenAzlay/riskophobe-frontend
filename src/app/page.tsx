"use client";

import useStore from "@/store/useStore";
import { Fragment, ReactNode } from "react";
import Offer from "./types/Offer";

function App() {
  const { offers } = useStore();

  const offerItem = (offer: Offer, key: number): ReactNode => {
    return <div key={key}>{offer.id}</div>;
  };

  return (
    <Fragment>
      <div className="p-6">
        <div id="offers-grid" className="grid grid-cols-3 gap-4">
          {offers.map((offer, index) => offerItem(offer, index))}
        </div>
      </div>
    </Fragment>
  );
}

export default App;
