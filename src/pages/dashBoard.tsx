import { GRAPHDB_HOST } from '@/config';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GitHubIcon from '@mui/icons-material/GitHub';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import MenuIcon from '@mui/icons-material/Menu';
import SchemaIcon from '@mui/icons-material/Schema';
import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Tooltip,
} from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Repositories from './Repositories';
import SparqlPage from './SparqlPage';
import {
  AppBar,
  Copyright,
  Drawer,
} from './components/DashBoardUtilComponents';
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

const mdTheme = createTheme();

enum TABS_DASHBOARD {
  REPOSITORIES = 'Data Repositories',
  SPARQL_QUERY = 'SPARQL Query',
  SCHEMA = 'Visualised Schema',
  GRAPHS = 'Graph Experiments',
}

function DashboardContent() {
  const repo_graphDB = useSelector(
    (state: DatabaseState) => state.database.repo,
  );
  const db_prefix_URL = useSelector(
    (state: DatabaseState) => state.database.db_prefix_URL,
  );

  const dispatch = useDispatch();

  const [siderOpen, setSiderOpen] = useState(true);
  const [tab, setTab] = useState(TABS_DASHBOARD.SPARQL_QUERY);

  const [repoList, setRepoList] = useState<string[]>([]);
  const [selectRepoReminder, setSelectRepoReminder] = useState<boolean>(false);

  useEffect(() => {
    setSelectRepoReminder(
      repo_graphDB === undefined || repo_graphDB === 'None',
    );
  }, [repo_graphDB]);

  useEffect(() => {
    fetchRepos();
  }, []);

  async function fetchRepos() {
    try {
      const response = await getRepoList();

      if (response.status === 200) {
        const data = response.data;
        const data_bindings = data.results.bindings;

        const repoList = data_bindings.map(
          (data_binding: any, index: number) => {
            return data_binding.id.value;
          },
        );

        setRepoList(['None', ...repoList]);
        // set default repo to the first of the list.
        if (repoList.length > 0 && repo_graphDB === undefined) {
          dispatch({ type: 'database/setRepo', payload: repoList[0] });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  const selectRepo = () => {
    return (
      <Grid
        sx={{
          backgroundColor: '#fff',
          color: '#000',
          borderRadius: 2,
          pl: 2,
          pr: 2,
        }}
      >
        Select a data repository:
        <Select
          size="small"
          value={repo_graphDB ? repoList.indexOf(repo_graphDB) : 0}
          displayEmpty
          inputProps={{ 'aria-label': 'Without label' }}
          style={{
            margin: 5,
            color:
              repo_graphDB && repo_graphDB !== 'None' ? '#22cc22' : '#cc2222',
            fontWeight: 'bold',
            backgroundColor: '#fff',
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
                  color: repo !== 'None' ? '#22cc22' : '#cc2222',
                  fontWeight: 'bold',
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

  function EmptyRepoReminder() {
    return (
      <Dialog
        open={selectRepoReminder}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
        maxWidth="sm"
        sx={{
          padding: 30,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <DialogTitle id="alert-dialog-title">
          {'Data Repository not specified'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            You can create repositories in{' '}
            <Button
              variant="text"
              size="small"
              href={`${GRAPHDB_HOST}/repository`}
              target="_blank"
              rel="noreferrer"
              style={{ textTransform: 'none' }}
            >
              GraphDB Workbench
            </Button>
          </DialogContentText>
          {selectRepo()}
        </DialogContent>
      </Dialog>
    );
  }

  const toggleDrawer = () => {
    setSiderOpen(!siderOpen);
  };

  function tabContents(tab_current: TABS_DASHBOARD) {
    if (tab_current === TABS_DASHBOARD.REPOSITORIES) {
      return <Repositories />;
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

  const sider_tabs = [
    TABS_DASHBOARD.REPOSITORIES,
    TABS_DASHBOARD.SPARQL_QUERY,
    TABS_DASHBOARD.SCHEMA,
    // TABS_DASHBOARD.GRAPHS,
  ];

  const sider_icon_map = {
    [TABS_DASHBOARD.REPOSITORIES]: <DashboardIcon />,
    [TABS_DASHBOARD.SPARQL_QUERY]: <ManageSearchIcon />,
    [TABS_DASHBOARD.SCHEMA]: <SchemaIcon />,
    [TABS_DASHBOARD.GRAPHS]: <AssessmentIcon />,
  };

  return (
    <ThemeProvider theme={mdTheme}>
      {EmptyRepoReminder()}
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
              variant="h4"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              GraphLD
              <IconButton
                sx={{ marginLeft: 2 }}
                href={`https://github.com/Garyoook/GraphLD/`}
                target="_blank"
                rel="noreferrer"
              >
                <GitHubIcon sx={{ color: 'white' }} />
              </IconButton>
            </Typography>
            <Button
              variant="text"
              color="inherit"
              sx={{ marginRight: 3, textTransform: 'none' }}
              href={`https://github.com/Garyoook/`}
              target="_blank"
              rel="noreferrer"
            >
              GaryGao @ Imperial College London
            </Button>
            {selectRepo()}
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
              {sider_tabs.map((t: TABS_DASHBOARD) => {
                return (
                  <Tooltip key={t} title={siderOpen ? '' : t} placement="right">
                    <ListItemButton
                      selected={tab === t}
                      onClick={() => {
                        setTab(t);
                      }}
                    >
                      <ListItemIcon>{sider_icon_map[t]}</ListItemIcon>
                      <ListItemText primary={t} />
                    </ListItemButton>
                  </Tooltip>
                );
              })}
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
