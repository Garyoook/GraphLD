import AssessmentIcon from '@mui/icons-material/Assessment';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import MenuIcon from '@mui/icons-material/Menu';
import SchemaIcon from '@mui/icons-material/Schema';
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
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
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
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

  const [siderOpen, setSiderOpen] = useState(true);
  const [tab, setTab] = useState(TABS_DASHBOARD.REPOSITORIES);

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
              Graph LD (App name TBD)
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
