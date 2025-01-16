"use client";

import useStore from "@/store/useStore";
import { Fragment } from "react";
import OfferItem from "@/components/OfferItem";

function App() {
  const { offers } = useStore();

  return (
    <Fragment>
      <div className="p-6">
        <div
          id="offers-grid"
          className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {offers.map((offer, index) => (
            <OfferItem offer={offer} key={index} />
          ))}
        </div>
      </div>
    </Fragment>
  );
}

export default App;
