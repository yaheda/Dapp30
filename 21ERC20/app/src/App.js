import React from "react";
import { Drizzle } from '@drizzle/store';
import drizzleOptions from './drizzleOptions.js';
import { drizzleReactHooks } from '@drizzle/react-plugin';
import LoadingComponent from "./LoadingComponent.js";
import TokenMetadata from "./TokenMetadata.js";
import TokenWallet from "./TokenWallet.js";

const drizzle = new Drizzle(drizzleOptions);
const { DrizzleProvider } = drizzleReactHooks;

function App() {
  return (
    <div className="container">
      <h1>ERC20 Token</h1>
      <DrizzleProvider drizzle={drizzle}>
        <LoadingComponent>
          <TokenMetadata />
          <TokenWallet />
          <p>Loaded!!</p>
        </LoadingComponent>
      </DrizzleProvider>
    </div>
  );
}

export default App;
