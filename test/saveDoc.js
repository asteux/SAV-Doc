const SaveDoc = artifacts.require("./SaveDoc.sol");

contract("SaveDoc", accounts => {
  it("Subscribe", async () => {
    const saveDocInstance = await SaveDoc.deployed();

    let name = "Jean-Gabriel";
    let pubkey = "Ao3FXRitBqxiX1nKhXpHAZsMciLq8V6RjsNAQwdsdMFvSlV";
    let password = "zKst8PWv6vC7NNVs";

    await saveDocInstance.subscribe(name, pubkey, password, { from: accounts[0] });

    // Get stored value
    const storedData = await saveDocInstance.viewMyProfil.call();
    const passwordResult = await saveDocInstance.getMyPasswordMaster();

    assert.equal(storedData.name, name, "Le resultat n'est pas le name attendu");
    assert.equal(storedData.publicKey, pubkey, "Le resultat n'est pas la pubkey attendu");
    assert.equal(passwordResult, password, "Le resultat n'est pas le password attendu");
  });
});
