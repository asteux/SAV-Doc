const SaveDoc = artifacts.require("./SaveDoc.sol");
const AccountManager = artifacts.require("./AccountManager.sol");
const SaveDocToken = artifacts.require("./SaveDocToken.sol");

contract("SaveDoc", accounts => {
  it("Subscribe", async () => {
    const saveDocInstance = await SaveDoc.deployed();

    let name = "Jean-Gabriel";
    let pubkey = "Ao3FXRitBqxiX1nKhXpHAZsMciLq8V6RjsNAQwdsdMFvSlV";
    let password = "zKst8PWv6vC7NNVs";

    await saveDocInstance.subscribe(name, pubkey, password, { from: accounts[0] });

    const storedData = await saveDocInstance.viewMyProfil.call();
    const passwordResult = await saveDocInstance.getMyPasswordMaster();

    assert.equal(storedData.name, name, "Le resultat n'est pas le name attendu");
    assert.equal(storedData.publicKey, pubkey, "Le resultat n'est pas la pubkey attendu");
    assert.equal(passwordResult, password, "Le resultat n'est pas le password attendu");
  });

  it("ChangeMyName", async () => {
    const saveDocInstance = await SaveDoc.deployed();
    let name = "Nimrod";

    await saveDocInstance.changeMyName(name, { from: accounts[0] });

    const storedData = await saveDocInstance.viewMyProfil.call();

    assert.equal(storedData.name, name, "Le resultat n'est pas le name attendu");
  });

  it("SecureDocument", async () => {
    const saveDocInstance = await SaveDoc.deployed();
    let fileName = "Pokemon.jpeg";
    let tokenURI = "ipfs://bafyreib4pff766vhpbxbhjbqqnsh5emeznvujayjj4z2iu533cprgbz23m/metadata.json";
    let fileMime = "image/jpeg";
    let fileSize = 2000;
    let filePath = "/home/jg/";
    let passwordEncrypted = "hxiqgmHEpdPf3kTL";
    let hashFile = "99137d305b8211dbddff672c3bb3ff10";
    let typeNft = 0;


    await saveDocInstance.secureDocument(fileName, tokenURI, fileMime, fileSize, filePath, passwordEncrypted, hashFile, {from: accounts[0]});
    let docs = await saveDocInstance.viewMyDocs({from: accounts[0]});

    const doc = { ...docs[0] };

    let expetedTokenURI = await saveDocInstance.getTokenURI(1, {from: accounts[0]});

    assert.equal(expetedTokenURI, tokenURI, "Mauvais URI");
    assert.equal(doc.fileSize, fileSize, "Mauvaise taille");
    assert.equal(doc.fileMimeType, fileMime, "Mauvais Mime");
    assert.equal(doc.filePath, filePath, "Mauvais Path");
    assert.equal(doc.passwordEncrypted, passwordEncrypted, "Mauvais Password");
    assert.equal(doc.typeNft, typeNft, "Mauvais Type");
  });

  it("TransferDoc", async () => {
    const saveDocInstance = await SaveDoc.deployed();
    const saveDocTokenInstance = await SaveDocToken.deployed();

    let name = "Lola";
    let pubkey = "AtBqxiX1nKhXpHAZsMciLq8V6RjsNAQwdsdMFl";
    let password = "st8PWv6vC7N";
    const tokenURITmp = "ipfs://66vhpbxbhjbqqnsh5emeznvujayjj4z2iu533cprfsdf5s2z2j2b/metadata.json"
    const to = accounts[1];
    await saveDocInstance.subscribe(name, pubkey, password, {from: to});

    await saveDocInstance.transferDoc(to, 1, tokenURITmp, {from: accounts[0]});
    const newOwner = await saveDocTokenInstance.ownerOf(1);
    const docs = await saveDocInstance.viewMyDocs({from: accounts[0]});
    const copyPendingTransfer = await saveDocInstance.viewDocPendingTransfer({from: to});
    assert.equal(docs.length, 0, "Le document vous appartient toujours");
    assert.equal(newOwner, to, "Le tokenID vous appartient toujours");
    assert.equal(copyPendingTransfer.length, 1, "Le destinataire du token n'a rien reçu");
    assert.equal(copyPendingTransfer[0].tokenURI, tokenURITmp, "Le tokenURI de la copyPendingTransfer est mauvais");
  });

  it("AcceptNewDoc", async () => {
    const saveDocInstance = await SaveDoc.deployed();
    const newTokenURI = "ipfs://66vhpbxbhjbqqnsh5emeznvujayjj4z2iu533cprgb";
    const newPassword = "dqjklmawx,5";

    const docPendingTranfer = await saveDocInstance.viewDocPendingTransfer({from: accounts[1]});
    await saveDocInstance.acceptNewDoc(1, newTokenURI, newPassword, {from: accounts[1]});
    const docPendingTransferAfter = await saveDocInstance.viewDocPendingTransfer({from: accounts[1]});
    const myDocs = await saveDocInstance.viewMyDocs({from: accounts[1]});

    assert.equal(docPendingTransferAfter, 0, "Le document est toujours en attente");
    assert.equal(myDocs.length, 1, "Aucun document n'a été reçu");
    assert.equal(docPendingTranfer[0].tokenID, myDocs[0].tokenID, "TokenID n'est pas identique au tokenID du docPendingTransfer");
    assert.equal(docPendingTranfer[0].fileSize, myDocs[0].fileSize, "fileSize n'est pas identique au fileSize du docPendingTransfer");
    assert.equal(docPendingTranfer[0].filename, myDocs[0].filename, "filename n'est pas identique au filename du docPendingTransfer");
    assert.equal(docPendingTranfer[0].fileMimeType, myDocs[0].fileMimeType, "fileMimeType n'est pas identique au fileMimeType du docPendingTransfer");
    assert.equal(docPendingTranfer[0].filePath, myDocs[0].filePath, "filePath n'est pas identique au filePath du docPendingTransfer");
    assert.equal(myDocs[0].passwordEncrypted, newPassword, "Le passwordEncrypted n'est pas identique au newPassword");
    assert.equal(docPendingTranfer[0].certifying.length, myDocs[0].certifying.length, "certifying identique au certifying du docPendingTransfer");
  });

  it("ShareDoc", async () => {
    const saveDocInstance = await SaveDoc.deployed();
    const to = accounts[0];
    const tokenURI = "ipfs://jhbqnfqd44fqsd45fq16xcq156gh85u";

    await saveDocInstance.shareDoc(1, to, tokenURI, {from: accounts[1]});
    const docCopy = await saveDocInstance.viewMyCopyDocs({from: to});

    assert.equal(docCopy.length, 1, "La copy du document n'existe pas !");
  });

  it("DeleteDocShared", async () => {
    const saveDocInstance = await SaveDoc.deployed();

    await saveDocInstance.delCopyDocShared(1, {from: accounts[0]});
    const docCopy = await saveDocInstance.viewMyCopyDocs({from: accounts[0]});

    assert.equal(docCopy.length, 0, "La copy du document existe toujours !");
  });

  it("RequestCertification", async () => {
    const saveDocInstance = await SaveDoc.deployed();
    let fileName = "Pokemon2.jpeg";
    let tokenURI = "ipfs://bafyreib4pff766vhpbxbhjbqqnsh5emeznvujayjj4z2iu533cprgbz23m/metadata.json";
    let fileMime = "image/jpeg";
    let fileSize = 2000;
    let filePath = "/home/jg/";
    let passwordEncrypted = "hxiqgmHEpdPf3kTL";
    let hashFile = "99137d305b8211dbddff672c3bb3ff10";
    let tokenURIRequest = "ipfs://vhpbxbhjbqqnsh5emeznvujayjj";


    await saveDocInstance.secureDocument(fileName, tokenURI, fileMime, fileSize, filePath, passwordEncrypted, hashFile, {from: accounts[0]});
    const myDocs = await saveDocInstance.viewMyDocs({from: accounts[0]});
    await saveDocInstance.requestCertification(2, tokenURIRequest, accounts[1], {from: accounts[0]});
    const docCertified = await saveDocInstance.viewDocCertified({from: accounts[1]});

    assert.equal(docCertified.length, 1, "Aucun demande de certificat n'a été reçu");
    assert.equal(docCertified[0].tokenID, myDocs[0].tokenID, "TokenID n'est pas identique au tokenID du docCertified");
    assert.equal(docCertified[0].fileSize, myDocs[0].fileSize, "fileSize n'est pas identique au fileSize du docCertified");
    assert.equal(docCertified[0].filename, myDocs[0].filename, "filename n'est pas identique au filename du docCertified");
    assert.equal(docCertified[0].fileMimeType, myDocs[0].fileMimeType, "fileMimeType n'est pas identique au fileMimeType du docCertified");
    assert.equal(docCertified[0].filePath, myDocs[0].filePath, "filePath n'est pas identique au filePath du docCertified");
    assert.equal(docCertified[0].tokenURI, tokenURIRequest, "tokenURI n'est pas identique au tokenURI du docCertified");
    assert.equal(docCertified[0].passwordEncrypted, "", "Le passwordEncrypted n'est pas vide");
    assert.equal(docCertified[0].certifying.length, myDocs[0].certifying.length, "certifying identique au certifying du docCertified");
  });

  it("AcceptCertificationRequest", async () => {
    const saveDocInstance = await SaveDoc.deployed();

    await saveDocInstance.acceptCertificationRequest(2, "", false, {from: accounts[1]});
    const docCertified = await saveDocInstance.viewDocCertified({from: accounts[1]});
    const docs = await saveDocInstance.viewMyDocs({from: accounts[0]});


    assert.equal(docCertified.length, 0, "La demande de certification existe toujours");
    assert.equal(docs[0].certifying.length, 1, "Le document n'a pas été certifié");
  });

  it("RejectCertificationRequest", async () => {
    const saveDocInstance = await SaveDoc.deployed();

    await saveDocInstance.requestCertification(2, "ipfs://dsjqnisd65gf4d6sr1az6r5v6", accounts[1], {from: accounts[0]});
    await saveDocInstance.rejectCertificationRequest(2, {from: accounts[1]});
    const docCertified = await saveDocInstance.viewDocCertified({from: accounts[1]});

    assert.equal(docCertified.length, 0, "La demande de certification existe toujours");
  });

  it("DeleteDocument", async () => {
    const saveDocInstance = await SaveDoc.deployed();

    await saveDocInstance.delMyDocument(2, false, {from: accounts[0]});
    const docs = await saveDocInstance.viewMyDocs({from: accounts[0]});
    const exist = await saveDocInstance.tokenExist(2, {from: accounts[0]});

    assert.equal(exist, false, "Le TokenID exite toujours");
    assert.equal(docs.length, 0, "Le document exite toujours");
  });

  it("Unsubscribe", async () => {
    const saveDocInstance = await SaveDoc.deployed();
    const accountManagerInstance = await AccountManager.deployed();

    await saveDocInstance.unsubscribe({from:accounts[0]});
    let userExist = await accountManagerInstance.checkIfUserExist(accounts[0]);

    assert.equal(userExist, false, "L'utilisateur n'a pas été correctement supprimé");
  });
});
