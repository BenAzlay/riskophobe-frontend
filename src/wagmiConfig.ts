import { http, createConfig, createStorage, cookieStorage } from "wagmi";
import { base } from "wagmi/chains";

export const config = createConfig({
  chains: [base],
  connectors: [],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports: {
    [base.id]: http(),
  },
});
