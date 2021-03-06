import React, { Fragment, useMemo } from "react";
import { useSelector } from "react-redux";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";

import FileManagerFile from "./file-manager-file";
import FileManagerFolder from "./file-manager-folder";
import { getComparator, stableSort } from "../../../utils/array";

const FileManagerContent = () => {
  const fileMap = useSelector(state => state.fileManager.fileMap);
  const history = useSelector((state => state.fileManager.history));
  const historyIndex = useSelector((state => state.fileManager.historyIndex));
  const querySearch = useSelector((state => state.fileManager.querySearch));
  const viewMode = useSelector((state => state.fileManager.viewMode));
  const sortBy = useSelector((state => state.fileManager.sortBy));
  const sortReversedOrder = useSelector((state => state.fileManager.sortReversedOrder));

  const currentDirectory = useMemo(() => history[historyIndex] ?? [""], [history, historyIndex]);
  const directoryContent = useMemo(() => {
    const data = fileMap[currentDirectory.join('/')] ?? [];
    const sortedData = stableSort(data, getComparator((sortReversedOrder) ? 'desc' : 'asc', sortBy));
    return [
      ...sortedData.filter((data) => data.isDir),
      ...sortedData.filter((data) => !data.isDir),
    ]
  }, [fileMap, currentDirectory, sortBy, sortReversedOrder]);

  const components = useMemo(() => {
    return (directoryContent)
        ? directoryContent.reduce((components, item) => {
          if (!querySearch || item.name.includes(querySearch)) {
            const content = (item.isDir)
              ? <FileManagerFolder data={item} />
              : <FileManagerFile data={item} />
            ;

            components.push(content);
          }

          return components;
        }, [])
        : []
    ;
  }, [directoryContent, querySearch]);

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
                <TableCell>Date de cr??ation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {components.map((component, index) => {
                return (
                  <Fragment key={`file-manager-item-${index}`}>
                    {component}
                  </Fragment>
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
          {components.map((component, index) => {
            return (
              <Grid key={`file-manager-item-${index}`} item xs={6} sm={4} md={3} lg={2} xl={1}>
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
