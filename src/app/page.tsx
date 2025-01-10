"use client";

import useStore from "@/store/useStore";
import { Fragment, useEffect } from "react";

function App() {
  const { setOffers } = useStore();

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch('/api/fetchOffers');
        if (!response.ok) {
          throw new Error('Failed to fetch offers');
        }
        const data = await response.json();
        console.log(`data:`, data)
        setOffers(data.offers);
      } catch (e) {
        console.error("fetchOffers ERROR", e);
      }
    };

    fetchOffers();
  }, []);

  

  return (
    <Fragment>
      <button className="btn btn-primary">HELLO</button>
    </Fragment>
  );
}

export default App;
