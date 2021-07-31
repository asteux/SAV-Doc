const AccountManager = artifacts.require("./AccountManager.sol");
const DocManager = artifacts.require("./DocManager.sol");
const SavDoc = artifacts.require("./SaveDoc.sol");
const SavDocToken = artifacts.require("./SaveDocToken");

module.exports = async (deployer) => {
  const deployAccountManager = await deployer.deploy(AccountManager);
  const deploySavDocToken = await deployer.deploy(SavDocToken);
  const deployDocManager = await deployer.deploy(DocManager, SavDocToken.address, AccountManager.address);
  //const deploySavDoc = await deployer.deploy(SavDoc, DocManager.address, SavDocToken.address);
  const deploySavDoc = await deployer.deploy(SavDoc, DocManager.address, SavDocToken.address, AccountManager.address);

  return [
    deployAccountManager,
    deploySavDocToken,
    deployDocManager,
    deploySavDoc,
  ];
};
