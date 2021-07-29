import { SHA256 } from 'crypto-js';
import { fromBuffer, minimumBytes } from 'file-type';

export const readFileAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target.result);
    };

    reader.onerror = (event) => {
      reject(event.target.error);
    };

    reader.onabort = (event) => {
      reject('abort');
    };

    reader.readAsArrayBuffer(file);
  });
};

export const readFileAsBinaryString = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target.result);
    };

    reader.onerror = (event) => {
      reject(event.target.error);
    };

    reader.onabort = (event) => {
      reject('abort');
    };

    reader.readAsBinaryString(file);
  });
};

export const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target.result);
    };

    reader.onerror = (event) => {
      reject(event.target.error);
    };

    reader.onabort = (event) => {
      reject('abort');
    };

    reader.readAsDataURL(file);
  });
};

export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target.result);
    };

    reader.onerror = (event) => {
      reject(event.target.error);
    };

    reader.onabort = (event) => {
      reject('abort');
    };

    reader.readAsText(file);
  });
};

/**
 *
 * @param {Blob|ArrayBuffer} data
 * @returns
 */
export const getFileType = async (data) => {
  let dataSliced = data.slice(0, minimumBytes);

  if (dataSliced instanceof Blob) {
    dataSliced = await readFileAsArrayBuffer(dataSliced);
  }

  return await fromBuffer(dataSliced);
};

export const hashWithSha256 = async (file) => {
  const data = await readFileAsBinaryString(file);

  return SHA256(data).toString();
};
