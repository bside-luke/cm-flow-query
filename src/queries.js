const fcl = require('@onflow/fcl');
const t = require('@onflow/types');

const ChainmonstersAddress = '0x93615d25d14fa337';

fcl
  .config()
  .put("accessNode.api", "https://access-mainnet-beta.onflow.org")
  .put("0xFungibleToken", "0xf233dcee88fe0abe")

const getNFTs = async (address) => ({
  address,
  result: await fcl.decode(await fcl.send([
    fcl.script `import ChainmonstersRewards from ${ChainmonstersAddress}
    pub fun main(account: Address, id: UInt64): [UInt64] {
        let collectionRef = getAccount(account)
            .getCapability(/public/ChainmonstersRewardCollection)!
            .borrow<&{ChainmonstersRewards.ChainmonstersRewardCollectionPublic}>()
            ?? panic("Could not get public reward collection reference")
        return collectionRef.getIDs()}`,
    fcl.args([fcl.arg(address, t.Address), fcl.arg(3558, t.UInt64)]),
  ])),
});

const getCollections = async (address) => ({
  address,
  result: await fcl.decode(await fcl.send([
    fcl.script `import ChainmonstersMarketplace from ${ChainmonstersAddress}
    pub fun main(account: Address): [UInt64] {
        let collectionRef = getAccount(account)
            .getCapability(/public/ChainmonstersMarketplaceCollection)
            ?? panic("Could not get public reward collection reference")
        return collectionRef.getIDs()}`,
    fcl.args([fcl.arg(address, t.Address), fcl.arg(3558, t.UInt64)]),
  ])),
});

const getFUSDBalance = (address) => new Promise((resolve) => {
  address = fcl.withPrefix(address);
  fcl.query({
    args: (arg, t) => [arg(address, t.Address)],
    cadence: `import FungibleToken from 0xFungibleToken
          pub fun main(addr: Address): UFix64 {
            let cap = getAccount(addr)
              .getCapability<&{FungibleToken.Balance}>(/public/fusdBalance)
            if let moneys = cap.borrow() {
              return moneys.balance
            } else {
              return UFix64(0.0)
            }
          }`
  }).catch(() => resolve("0.00000000")).then(resolve);
});

const getFlowBalance = (address) => new Promise((resolve) => {
  address = fcl.withPrefix(address);
  fcl.query({
    args: (arg, t) => [arg(address, t.Address)],
    cadence: `import FungibleToken from 0xFungibleToken
          pub fun main(addr: Address): UFix64 {
            let cap = getAccount(addr)
              .getCapability<&{FungibleToken.Balance}>(/public/flowTokenBalance)
            if let moneys = cap.borrow() {
              return moneys.balance
            } else {
              return UFix64(0.0)
            }
          }`
  }).catch(() => resolve("0.00000000")).then(resolve);
});

const getAccountStorage = (address) => new Promise((resolve) => {
  address = fcl.withPrefix(address);
  fcl.query({
    args: (arg, t) => [arg(address, t.Address)],
    cadence: `pub fun main(addr: Address): {String: UInt64} {
          let acct = getAccount(addr)
          let ret: {String: UInt64} = {}
          ret["capacity"] = acct.storageCapacity
          ret["used"] = acct.storageUsed
          ret["available"] = acct.storageCapacity - acct.storageUsed
          return ret
        }`
  }).catch(() => resolve({
    address,
    capacity: 0,
    used: 0,
    available: 0
  })).then(res => resolve({
    address,
    ...res
  }));
});

const getBalance = async (address) => {
  const flow = await getFlowBalance(address);
  const fusd = await getFUSDBalance(address);

  return {
    address,
    flow,
    fusd
  };
}

module.exports = {
  getNFTs,
  getCollections,
  getFUSDBalance,
  getFlowBalance,
  getBalance,
  getAccountStorage
};
