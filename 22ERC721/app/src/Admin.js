import React, { useState, useEffect } from 'react';
import { drizzleReactHooks } from '@drizzle/react-plugin';
import { newContextComponents } from '@drizzle/react-components';

const { useDrizzle, useDrizzleState } = drizzleReactHooks;;
const { ContractForm } = newContextComponents;

function Admin() {
  const { drizzle } = useDrizzle();
  const state = useDrizzleState(state => state);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const init = async () => {
      const admin = await drizzle.contracts.ERC721Token.methods.admin().call();
      setIsAdmin(admin.toLowerCase() === state.accounts[0].toLowerCase());
    }
    init();
  });

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="App">
      <div>
        <h2>Mint</h2>
        <ContractForm
          drizzle={drizzle}
          drizzleState={state}
          contract='ERC721Token'
          method='mint' />
      </div>
    </div>
  );

}

export default Admin;