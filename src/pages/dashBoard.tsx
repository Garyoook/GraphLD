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
  Paper,
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
import { createTheme, styled, ThemeProvider } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import GraphsPage from './graphs';
import SchemaPage from './schemaPage';
import { getRepoList } from './service';
import SparqlPage from './SparqlPage';

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
  const [open, setOpen] = useState(true);
  const [columns, setColumns] = useState<any>([]);
  const [data, setData] = useState<any>([]);
  const [tab, setTab] = useState(TABS_DASHBOARD.REPOSITORY);

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

        console.log(dataSource);

        setColumns(columns);
        setData(dataSource);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchRepos();
  }, []);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  function tabContents(tab_current: TABS_DASHBOARD) {
    if (tab_current === TABS_DASHBOARD.REPOSITORY) {
      return (
        <Grid container spacing={3}>
          {/* Chart */}
          <Grid item xs={12}>
            <Paper
              sx={{
                height: '100vh',
              }}
            >
              <DataGrid
                rows={data}
                columns={columns}
                // onRowClick={(params) => {
                //     fetchStatementsFromRepo(
                //         (params.row as IRepository)
                //             .title
                //     );
                // }}
              />
            </Paper>
          </Grid>
        </Grid>
      );
    }
    if (tab_current === TABS_DASHBOARD.SPARQL_QUERY) {
      return <SparqlPage />;
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
        <AppBar position="absolute" open={open}>
          <Toolbar
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
                ...(open && { display: 'none' }),
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
        <Drawer variant="permanent" open={open}>
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
