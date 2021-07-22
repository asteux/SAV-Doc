const SavDoc = artifacts.require("./SecMyDoc.sol");
const SavDocToken = artifacts.require("./SecMyDocToken");

module.exports = async (deployer) => {
  const deploySavDocToken = await deployer.deploy(SavDocToken);
  const deploySavDoc = await deployer.deploy(SavDoc, SavDocToken.address);

  return [deploySavDocToken, deploySavDoc];
};
