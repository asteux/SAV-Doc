import { createSlice } from '@reduxjs/toolkit';

import { acceptCertificationRequest, rejectCertificationRequest } from '../contracts/savDocContractSlice';
import { hashWithSha256 } from '../../utils/file';

const manageCertificationRequestSlice = createSlice({
  name: 'manageCertificationRequest',
  initialState: {
    activeStep: 0,
    doc: null,
    certificationRequest: null,
    originalFile: null,
  },
  reducers: {
    previousStep: (state) => {
      state.activeStep--;
    },
    nextStep: (state) => {
      state.activeStep++;
    },
    docChanged: (state, action) => {
      state.activeStep = 0;
      state.doc = null;
      state.certificationRequest = null;
      state.originalFile = null;

      state.doc = action.payload;
    },
    certificationRequestChanged: (state, action) => {
      state.certificationRequest = action.payload;
    },
    setOriginalFile: (state, action) => {
      state.originalFile = action.payload;
    },
    reset: (state) => {
      state.activeStep = 0;
      // state.doc = null;
      state.certificationRequest = null;
      state.originalFile = null;
    }
  }
});

const manageCertificationRequestActions = {
  previousStep: () => {
    return (dispatch) => {
      return dispatch(manageCertificationRequestSlice.actions.previousStep());
    };
  },
  nextStep: () => {
    return (dispatch) => {
      return dispatch(manageCertificationRequestSlice.actions.nextStep());
    };
  },
  setDoc: (doc) => {
    return (dispatch) => {
      dispatch(manageCertificationRequestSlice.actions.docChanged(doc));
    };
  },
  setCertificationRequest: (certificationRequest) => {
    return (dispatch) => {
      dispatch(manageCertificationRequestSlice.actions.certificationRequestChanged(certificationRequest));
    };
  },
  setOriginalFile: (file) => {
    return (dispatch) => {
      return dispatch(manageCertificationRequestSlice.actions.setOriginalFile(file));
    };
  },
  sendAcceptCertificationRequest: (keepDoc) => {
    return async (dispatch, getState) => {
      const { manageCertificationRequest } = getState();

      const tokenID = manageCertificationRequest.doc.tokenID;
      const originalFile = manageCertificationRequest.originalFile;

      const hashNFT = await hashWithSha256(originalFile);

      dispatch(acceptCertificationRequest(tokenID, hashNFT, keepDoc));

    };
  },
  sendRejectCertificationRequest: () => {
    return async (dispatch, getState) => {
      const { manageCertificationRequest } = getState();

      const tokenID = manageCertificationRequest.doc.tokenID;

      dispatch(rejectCertificationRequest(tokenID));
    };
  },
  reset: () => {
    return async (dispatch) => {
      dispatch(manageCertificationRequestSlice.actions.reset());
    };
  },
};

export const {
  previousStep,
  nextStep,
  setDoc,
  setCertificationRequest,
  setOriginalFile,
  sendAcceptCertificationRequest,
  sendRejectCertificationRequest,
  reset,
} = manageCertificationRequestActions;

export default manageCertificationRequestSlice.reducer;
