import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import { load, setEnabledFileActions } from "../file-manager-slice";
import FileManagerHeader from "./file-manager-header";
import FileManagerContent from "./file-manager-content";

const FileManager = ({ root, fileMap, enabledFileActions }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (fileMap) {
      dispatch(load([""], fileMap));
    }
  }, [dispatch, root, fileMap]);

  useEffect(() => {
    if (enabledFileActions) {
      dispatch(setEnabledFileActions(enabledFileActions));
    } else {
      dispatch(setEnabledFileActions(['share', 'delete']));
    }
  }, [dispatch, enabledFileActions]);

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
