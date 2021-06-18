const fcl = require('@onflow/fcl');
const t = require('@onflow/types');

const ChainmonstersAddress = '0x93615d25d14fa337';

fcl.config().put('accessNode.api', 'https://access-mainnet-beta.onflow.org');

const getNFTs = async (address) => ({
  address,
  result: await fcl.decode(await fcl.send([
    fcl.script`import ChainmonstersRewards from ${ChainmonstersAddress}
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
    fcl.script`import ChainmonstersMarketplace from ${ChainmonstersAddress}
    pub fun main(account: Address): [UInt64] {
        let collectionRef = getAccount(account)
            .getCapability(/public/ChainmonstersMarketplaceCollection)
            ?? panic("Could not get public reward collection reference")
        return collectionRef.getIDs()}`,
    fcl.args([fcl.arg(address, t.Address), fcl.arg(3558, t.UInt64)]),
  ])),
});

module.exports = { getNFTs, getCollections };
