import { AES, enc } from 'crypto-js';
import { bufferToHex } from 'ethereumjs-util';
import { encrypt } from 'eth-sig-util';

export const encryptWithPassword = (data, password) => {
  return AES.encrypt(data, password).toString();
};

export const decryptWithPassword = (encryptedData, password) => {
  return AES.decrypt(encryptedData, password).toString(enc.Utf8);
};

export const getEncryptionPublicKey = async (account) => {
  return await window.ethereum
    .request({
      method: 'eth_getEncryptionPublicKey',
      params: [account],
    })
  ;
};

export const encryptWithPublicKey = (data, encryptionPublicKey) => {
  return bufferToHex(
    Buffer.from(
      JSON.stringify(
        encrypt(
          encryptionPublicKey,
          { data },
          'x25519-xsalsa20-poly1305'
        )
      ),
      'utf8'
    )
  );
};

export const decryptWithPrivateKey = (encryptedData, account) => {
  return window.ethereum
    .request({
      method: 'eth_decrypt',
      params: [encryptedData, account],
    })
  ;
};
