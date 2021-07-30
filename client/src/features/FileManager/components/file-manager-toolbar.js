import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { alpha, Checkbox, FormControlLabel, IconButton, InputBase, makeStyles, Menu, MenuList, MenuItem, Typography } from "@material-ui/core";
import AppsIcon from '@material-ui/icons/Apps';
import ListIcon from '@material-ui/icons/List';
import SearchIcon from '@material-ui/icons/Search';
import SortIcon from '@material-ui/icons/Sort';
import { debounce } from "lodash";

import { setViewMode, setSortBy, toggleSortReversedOrder, setSearchQuery } from "../file-manager-slice";

const useStyles = makeStyles((theme) => ({
  line: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    width: '100%',
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const FileManagerToolbar = () => {
  const classes = useStyles();

  const dispatch = useDispatch();

  const [anchorEl, setAnchorEl] = React.useState(null);

  const viewMode = useSelector((state => state.fileManager.viewMode));
  const sortBy = useSelector((state => state.fileManager.sortBy));
  const sortReversedOrder = useSelector((state => state.fileManager.sortReversedOrder));

  const handleSeachQuery = useCallback(debounce((query) => {
    dispatch(setSearchQuery(query));
  }, 500), []);

  const handleClickGridView = () => {
    dispatch(setViewMode('grid'));
  };

  const handleClickListView = () => {
    dispatch(setViewMode('list'));
  };

  const handleClickShowSortMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = (event) => {
    setAnchorEl(null);
  };

  const handleSortBy = (event, sortBy) => {
    dispatch(setSortBy(sortBy));
    handleCloseMenu(event);
  };

  const handleReverseSort = (event) => {
    dispatch(toggleSortReversedOrder());
    handleCloseMenu(event);
  };

  return (
    <div className={ classes.line }>
      <div className={classes.search}>
        <div className={classes.searchIcon}>
          <SearchIcon />
        </div>
        <InputBase
          placeholder="Search…"
          classes={{
            root: classes.inputRoot,
            input: classes.inputInput,
          }}
          inputProps={{ 'aria-label': 'search' }}
          onChange={(event) => handleSeachQuery(event.target.value)}
        />
      </div>

      <div className={ classes.line }>
        <IconButton onClick={handleClickGridView} color={('grid' === viewMode) ? 'primary' : 'default'}>
          <AppsIcon />
        </IconButton>

        <IconButton onClick={handleClickListView} color={('list' === viewMode) ? 'primary' : 'default'}>
          <ListIcon />
        </IconButton>

        <IconButton aria-controls="menu-actions-sorting" aria-haspopup="true" onClick={handleClickShowSortMenu}>
          <SortIcon />
        </IconButton>

        <Menu
          id="menu-actions-sorting"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          getContentAnchorEl={null}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuList>
            <Typography variant="caption" style={{ margin: '0px 16px' }}>Trier</Typography>
            <MenuItem selected={'name' === sortBy} onClick={(event) => { handleSortBy(event, 'name'); }}>Par nom</MenuItem>
            <MenuItem selected={'size' === sortBy} onClick={(event) => { handleSortBy(event, 'size'); }}>Par taille</MenuItem>
            <MenuItem selected={'createdAt' === sortBy} onClick={(event) => { handleSortBy(event, 'createdAt'); }}>Par la date d'ajout</MenuItem>
          </MenuList>

          <MenuList>
            <MenuItem onClick={handleReverseSort}>
              <FormControlLabel
                control={<Checkbox checked={sortReversedOrder} onChange={handleReverseSort} name="reverseOrder" />}
                label="Ordre inversé"
              />
            </MenuItem>
          </MenuList>
        </Menu>
      </div>
    </div>
  );
};

export default FileManagerToolbar;
