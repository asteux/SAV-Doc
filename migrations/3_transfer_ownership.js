const AccountManager = artifacts.require("./AccountManager.sol");
const DocManager = artifacts.require("./DocManager.sol");
const SavDoc = artifacts.require("./SaveMyDoc.sol");
const SavDocToken = artifacts.require("./SaveDocToken");

module.exports = async (deployer) => {
  const deployAccountManager = await AccountManager.deployed();
  const deployDocManager = await DocManager.deployed();
  await SavDoc.deployed();
  const deploySavDocToken = await SavDocToken.deployed();

  await deployAccountManager.transferOwnership(SavDoc.address);
  await deployDocManager.transferOwnership(SavDoc.address);
  await deploySavDocToken.transferOwnership(SavDoc.address);
};
