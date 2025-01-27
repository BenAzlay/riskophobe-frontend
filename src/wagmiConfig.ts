import { http, createConfig, createStorage, cookieStorage } from "wagmi";
import { base } from "wagmi/chains";
import { walletConnect } from "wagmi/connectors";

export const config = createConfig({
  chains: [base],
  connectors: [
    walletConnect({
      showQrModal: true,
      projectId: "04d04d61ec633ddec6850161afd3c58e",
      metadata: {
        name: "Riskophobe",
        description: "Invest Risk-Free. Get Money Back.",
        url: "https://riskophobe.com",
        icons: ['/icons/icon-512x512.png'],
      },
    })
  ],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports: {
    [base.id]: http(),
  },
});
