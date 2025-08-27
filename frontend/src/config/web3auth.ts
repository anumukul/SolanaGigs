import { WEB3AUTH_NETWORK } from "@web3auth/modal";
import { type Web3AuthContextConfig } from "@web3auth/modal/react";

const clientId = import.meta.env.VITE_WEB3AUTH_CLIENT_ID;

if (!clientId) {
  throw new Error("WEB3AUTH_CLIENT_ID is not set in environment variables");
}

const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    modalConfig: {
      connectors: {
        AUTH: {
          label: "Social Login",
          loginMethods: {
            google: {
              name: "Google Login",
              showOnModal: true,
            },
            facebook: {
              name: "Facebook Login", 
              showOnModal: true,
            },
            twitter: {
              name: "Twitter Login",
              showOnModal: true,
            },
            email_passwordless: {
              name: "Email Login",
              showOnModal: true,
            },
          },
          showOnModal: true,
        },
      },
    },
  },
};

export default web3AuthContextConfig;