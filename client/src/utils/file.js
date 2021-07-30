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

export function humanFileSize(bytes, si=false, dp=1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10**dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


  return bytes.toFixed(dp) + ' ' + units[u];
}
