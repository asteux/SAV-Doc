import { NFTStorage } from 'nft.storage';

const apiKey = process.env.REACT_APP_NFT_STORAGE_API_KEY;
export const client = new NFTStorage({ token: apiKey });

export const storeBlob = async (content) => {
  return await client.storeBlob(new Blob([content]))
};

export const download = async (cid) => {
  const ipfsLink = `https://${cid}.ipfs.dweb.link​`;
  return await fetch(ipfsLink)
    .then((response) => {
      return response.text();
    })
  ;
};
