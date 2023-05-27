import AssessmentIcon from '@mui/icons-material/Assessment';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import MenuIcon from '@mui/icons-material/Menu';
import SchemaIcon from '@mui/icons-material/Schema';
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  TextField,
} from '@mui/material';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import MuiDrawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SparqlPage from './SparqlPage';
import GraphsPage from './graphs';
import { DatabaseState } from './reducer/databaseReducer';
import SchemaPage from './schemaPage';
import { getRepoList } from './service';

interface IRepository {
  id: number;
  title: string;
  uri: string;
  writable: string;
  readable: string;
}

function Copyright(props: any) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {'Copyright © '}
      <Link color="inherit" href="https://www.doc.ic.ac.uk/~yg9418/">
        Gary Gao
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const drawerWidth: number = 240;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  '& .MuiDrawer-paper': {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: 'border-box',
    ...(!open && {
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

const mdTheme = createTheme();

enum TABS_DASHBOARD {
  REPOSITORY,
  SPARQL_QUERY,
  SCHEMA,
  GRAPHS,
}

function DashboardContent() {
  const repo_graphDB = useSelector(
    (state: DatabaseState) => state.database.repo,
  );
  const db_prefix_URL = useSelector(
    (state: DatabaseState) => state.database.db_prefix_URL,
  );

  const dispatch = useDispatch();

  const [selectRepoReminder, setSelectRepoReminder] = useState<boolean>(false);
  const [siderOpen, setSiderOpen] = useState(true);
  const [columnsRepoTable, setColumnsRepoTable] = useState<any>([]);
  const [dataRepoTable, setDataRepoTable] = useState<any>([]);
  const [tab, setTab] = useState(TABS_DASHBOARD.REPOSITORY);

  const [repoList, setRepoList] = useState<string[]>([]);

  const data_keys = ['id', 'title', 'uri', 'writable', 'readable'];

  async function fetchRepos() {
    try {
      const response = await getRepoList();

      if (response.status === 200) {
        const data = response.data;
        const data_bindings = data.results.bindings;

        const columns = [
          {
            field: 'title',
            headerName: 'Title',
            width: 200,
          },
          {
            field: 'uri',
            headerName: 'URI',
            width: 500,
          },
          {
            field: 'writable',
            headerName: 'Writable',
            width: 200,
          },
          {
            field: 'readable',
            headerName: 'Readable',
            width: 200,
          },
        ];

        const dataSource = data_bindings.map(
          (data_binding: any, index: number) => {
            return {
              id: index,
              title: data_binding.id.value,
              uri: data_binding.uri.value,
              writable: data_binding.writable.value,
              readable: data_binding.readable.value,
            };
          },
        );

        const repoList = data_bindings.map(
          (data_binding: any, index: number) => {
            return data_binding.id.value;
          },
        );

        setRepoList(['None', ...repoList]);
        setColumnsRepoTable(columns);
        setDataRepoTable(dataSource);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchRepos();
  }, []);

  useEffect(() => {
    setSelectRepoReminder(
      repo_graphDB === undefined || repo_graphDB === 'None',
    );
  }, [repo_graphDB]);

  const toggleDrawer = () => {
    setSiderOpen(!siderOpen);
  };

  const selectRepo = () => {
    return (
      <Grid>
        Select a data repository:
        <Select
          size="small"
          value={repo_graphDB ? repoList.indexOf(repo_graphDB) : 0}
          displayEmpty
          inputProps={{ 'aria-label': 'Without label' }}
          style={{
            margin: 5,
            backgroundColor:
              repo_graphDB && repo_graphDB !== 'None' ? '#ccffcc' : '#ffcccc',
          }}
        >
          {repoList.map((repo: any) => {
            return (
              <MenuItem
                key={repoList.indexOf(repo)}
                value={repoList.indexOf(repo)}
                onClick={() => {
                  dispatch({ type: 'database/setRepo', payload: repo });
                }}
                style={{
                  backgroundColor: repo !== 'None' ? '#ccffcc' : '#ffcccc',
                  borderRadius: 5,
                  border: '1px solid #aaa',
                  margin: 3,
                }}
              >
                {repo}
              </MenuItem>
            );
          })}
        </Select>
      </Grid>
    );
  };

  function tabContents(tab_current: TABS_DASHBOARD) {
    if (tab_current === TABS_DASHBOARD.REPOSITORY) {
      return (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ padding: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  {selectRepo()}
                  <Dialog
                    open={selectRepoReminder}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    fullWidth
                    maxWidth="sm"
                    style={{ padding: 30 }}
                  >
                    <DialogTitle id="alert-dialog-title">
                      {'Data Repository not specified'}
                    </DialogTitle>
                    <DialogContent>
                      <DialogContentText id="alert-dialog-description">
                        You have not selected a data repository!
                      </DialogContentText>
                      {selectRepo()}
                    </DialogContent>
                  </Dialog>
                </Grid>

                <Grid item xs={12}>
                  Edit the URI prefix of featured database:{' '}
                  <TextField
                    id="outlined-basic"
                    value={db_prefix_URL}
                    size="small"
                    variant="outlined"
                    onChange={(event) => {
                      dispatch({
                        type: 'database/setPrefixURL',
                        payload: event.target.value,
                      });
                    }}
                    style={{
                      margin: 3,
                      backgroundColor: 'white',
                      width: '100%',
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Chart */}
          <Grid item xs={12}>
            <Paper
              sx={{
                height: '100vh',
              }}
            >
              <DataGrid
                rows={dataRepoTable}
                columns={columnsRepoTable}
                onRowClick={(params) => {
                  const title = params.row.title;
                  title &&
                    dispatch({ type: 'database/setRepo', payload: title });
                }}
              />
            </Paper>
          </Grid>
        </Grid>
      );
    }
    if (tab_current === TABS_DASHBOARD.SPARQL_QUERY) {
      return (
        <SparqlPage repo_graphDB={repo_graphDB} db_prefix_URL={db_prefix_URL} />
      );
    }

    if (tab_current === TABS_DASHBOARD.SCHEMA) {
      return <SchemaPage />;
    }

    if (tab_current === TABS_DASHBOARD.GRAPHS) {
      return <GraphsPage />;
    }
    return 'ERROR';
  }

  return (
    <ThemeProvider theme={mdTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="absolute" open={siderOpen}>
          <Toolbar
            id="DashBoardToolbar"
            sx={{
              pr: '24px', // keep right padding when drawer closed
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: '36px',
                ...(siderOpen && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              Semantic Web Visualiser
            </Typography>
            {/* <IconButton color='inherit'>
                            <Badge badgeContent={4} color='secondary'>
                                <NotificationsIcon />
                            </Badge>
                        </IconButton> */}
          </Toolbar>
        </AppBar>
        <Drawer id={'DashBoardDrawer'} variant="permanent" open={siderOpen}>
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: [1],
            }}
          >
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List component="nav">
            <React.Fragment>
              <ListItemButton
                selected={tab === TABS_DASHBOARD.REPOSITORY}
                onClick={() => {
                  setTab(TABS_DASHBOARD.REPOSITORY);
                }}
              >
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>

              <ListItemButton
                selected={tab === TABS_DASHBOARD.SPARQL_QUERY}
                onClick={() => {
                  setTab(TABS_DASHBOARD.SPARQL_QUERY);
                }}
              >
                <ListItemIcon>
                  <ManageSearchIcon />
                </ListItemIcon>
                <ListItemText primary="SPARQL Query" />
              </ListItemButton>

              <ListItemButton
                selected={tab === TABS_DASHBOARD.SCHEMA}
                onClick={() => {
                  setTab(TABS_DASHBOARD.SCHEMA);
                }}
              >
                <ListItemIcon>
                  <SchemaIcon />
                </ListItemIcon>
                <ListItemText primary="View Schema" />
              </ListItemButton>

              <ListItemButton
                selected={tab === TABS_DASHBOARD.GRAPHS}
                onClick={() => {
                  setTab(TABS_DASHBOARD.GRAPHS);
                }}
              >
                <ListItemIcon>
                  <AssessmentIcon />
                </ListItemIcon>
                <ListItemText primary="Graph Experiments" />
              </ListItemButton>
            </React.Fragment>
            <Divider sx={{ my: 1 }} />
            {/* {secondaryListItems} */}
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {tabContents(tab)}
            <Copyright sx={{ pt: 4 }} />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
