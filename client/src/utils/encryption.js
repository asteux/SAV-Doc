import AES from 'crypto-js/aes';
import { bufferToHex } from 'ethereumjs-util';
import { encrypt } from 'eth-sig-util';

export const encryptWithPassword = (data, password) => {
  return AES.encrypt(data, password).toString();
};

export const decryptWithPassword = (encryptedData, password) => {
  return AES.decrypt(encryptedData, password);
};

export const encryptWithPublicKey = async (data, account) => {
  const encryptionPublicKey = await window.ethereum
    .request({
      method: 'eth_getEncryptionPublicKey',
      params: [account],
    })
  ;

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
