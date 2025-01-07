"use client";

import { Fragment } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

function App() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <Fragment>
      <button className="btn btn-primary">HELLO</button>
    </Fragment>
  );
}

export default App;
