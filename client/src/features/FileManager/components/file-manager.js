import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import { load } from "../file-manager-slice";
import FileManagerHeader from "./file-manager-header";
import FileManagerContent from "./file-manager-content";

const FileManager = ({ root, fileMap }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (fileMap) {
      dispatch(load([""], fileMap));
    }
  }, [dispatch, root, fileMap]);

  return (
    <>
      <section className="file-manager">
        <FileManagerHeader />
        <FileManagerContent />
      </section>
    </>
  );
};

export default FileManager;
