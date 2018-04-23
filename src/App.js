import React, { Component } from 'react';
import chunk from 'lodash/chunk';
import getWeb3 from './web3';
import './App.css';

const CLAIM_CONTRACT_ABI = [
  {
    constant: false,
    inputs: [
      {
        name: 'data',
        type: 'string'
      }
    ],
    name: 'post',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

const AIRDROP_CONTRACT_ABI = [
  {
    constant: false,
    inputs: [
      {
        name: 'data',
        type: 'string'
      },
      {
        name: 'recipients',
        type: 'address[]'
      }
    ],
    name: 'post',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function'
  }
];

class App extends Component {
  state = {
    addresses: [],
    messageSentTxId: false
  };

  getAddresses = async () => {
    const response = await fetch(
      'https://api-staging.userfeeds.io/ranking/experimental_all_receivers;asset=ethereum:0x06012c8cf97bead5deae237070f9587f8e7a266d'
    );
    const { items: addresses } = await response.json();
    const onlyAdresses = addresses.map(({ address }) => address);
    this.setState({ addresses: onlyAdresses });
  };

  sendMessage = async () => {
    const { value } = this.messageInput;
    const web3 = await getWeb3();
    const [from] = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(CLAIM_CONTRACT_ABI, '0x139d658eD55b78e783DbE9bD4eb8F2b977b24153');
    contract.setProvider(web3.currentProvider);
    const { transactionHash } = await contract.methods
      .post(`{"claim":{"target":"${value}"},"context":"ethereum:0x06012c8cf97bead5deae237070f9587f8e7a266d:134330"}`)
      .send({ from });
    this.setState({ messageSentTxId: transactionHash });
  };

  sendBatch = async () => {
    const web3 = await getWeb3();
    const [from] = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(AIRDROP_CONTRACT_ABI, '0x5301F5b1Af6f00A61E3a78A9609d1D143B22BB8d');
    const { addresses, messageSentTxId } = this.state;
    const { value } = this.valueInput;
    const valueInWei = new web3.utils.BN(web3.utils.toWei(value, 'ether'));
    for (let i = 0; i < addresses.length; i += 4000) {
      const txBatches = chunk(addresses.slice(i, i + 4000), 200);
      await Promise.all(
        txBatches.map(txBatch =>
          contract.methods
            .post(`{"claim":{"target":"claim:${messageSentTxId}:0"}}`, txBatch)
            .send({ from, value: valueInWei.mul(new web3.utils.BN(txBatch.length)).toString(), gasPrice: web3.utils.toWei('1', 'gwei') })
        )
      );
    }
  };

  render() {
    const { addresses } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Airdrop</h1>
        </header>
        <button onClick={this.getAddresses}>Get addresses</button>
        {addresses.length > 0 && (
          <React.Fragment>
            <p>Unsubmited adresses count: {addresses.length}</p>
            <p>Next batch:</p>
            <div className="AddressesList-container">
              <ul className="AddressesList">
                {addresses.slice(0, 200).map(address => <li key={address}>{address}</li>)}
              </ul>
            </div>
            <div className="Message-container">
              <input ref={input => (this.messageInput = input)} />
              <button onClick={this.sendMessage}>Send message</button>
            </div>
            <div className="NextBatch-container">
              <p>Amount of ETH sent to each address</p>
              <input ref={input => (this.valueInput = input)} />
              <button disabled={!this.state.messageSentTxId} onClick={this.sendBatch}>
                Next batch
              </button>
            </div>
          </React.Fragment>
        )}
      </div>
    );
  }
}

export default App;
