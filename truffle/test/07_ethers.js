const { providers } = require("ethers");
const { isAccountLocked, convertPhtToWeiBN, waitFor, extractEnvAccountAndPwd } = require('./utils');
const HelloBlockchainWorld = artifacts.require("HelloBlockchainWorld");

describe('Ethers', () => {
  let ROOT_ACCOUNT = extractEnvAccountAndPwd(process.env.NETWORK).from;
  let helloWorldInstance;

  it("should emit an event in a SC", async () => {
    helloWorldInstance = await HelloBlockchainWorld.deployed();

    const estimatedGas = await helloWorldInstance.incrementHelloCount.estimateGas();
    const tx = await helloWorldInstance.incrementHelloCount({
      from: ROOT_ACCOUNT,
      gasLimit: estimatedGas,
    });

    const emitedEvent = tx.receipt.logs[0];

    assert.equal(tx.receipt.status, "0x1", "successful TX status expected");
    assert.equal(emitedEvent.event, "HelloCountIncremented");
    assert.equal(emitedEvent.blockHash, tx.receipt.blockHash);
  });

  it("should be able to query emitted event logs", async () => {
    const host = web3.currentProvider.host;

    console.log(`Configuring Ethers.js host: ${host}`);

    const jsonRpcProvider = new providers.JsonRpcProvider(host);

    const events = await jsonRpcProvider.getLogs({
      fromBlock: 0,
      address: helloWorldInstance.address
    });

    assert.equal(events[0].address, helloWorldInstance.address);
    assert.equal(events[0].topics.length, 1);
  });
});
