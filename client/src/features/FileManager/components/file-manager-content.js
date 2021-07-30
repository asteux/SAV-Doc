import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";

import FileManagerFile from "./file-manager-file";
import FileManagerFolder from "./file-manager-folder";

const FileManagerContent = () => {
  const fileMap = useSelector(state => state.fileManager.fileMap);
  const history = useSelector((state => state.fileManager.history));
  const historyIndex = useSelector((state => state.fileManager.historyIndex));
  const viewMode = useSelector((state => state.fileManager.viewMode));

  const currentDirectory = useMemo(() => history[historyIndex] ?? [""], [history, historyIndex]);
  const directoryContent = useMemo(() => {
    return fileMap[currentDirectory.join('/')] ?? [];
  }, [fileMap, currentDirectory]);

  const components = useMemo(() => {
    return (directoryContent)
        ? directoryContent.map((item) => {
          let content = (item.isDir)
              ? <FileManagerFolder data={item} />
              : <FileManagerFile data={item} />
            ;

          return <>{content}</>;
        })
        : []
    ;
  }, [directoryContent]);

  let content = <></>;
  switch (viewMode) {
    case 'list':
      content = (
        <TableContainer component={Paper}>
          <Table aria-label="caption table">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Taille</TableCell>
                <TableCell>Date de création</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {components.map((component) => {
                return (
                  <>
                    {component}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      );
      break;

    default: // = grid
      content = (
        <Grid container>
          {components.map((component) => {
            return (
              <Grid item xs={6} sm={4} md={3} lg={2} xl={1}>
                {component}
              </Grid>
            );
          })}
        </Grid>
      )
      break;
  }

  return (
    <>
      <div className="file-manager-content">
        {content}
      </div>
    </>
  );
};

export default FileManagerContent;
