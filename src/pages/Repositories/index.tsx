import { GRAPHDB_HOST } from '@/config';
import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Select,
  TextField,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DatabaseState } from '../reducer/databaseReducer';
import { getRepoList } from '../service';

function Repositories() {
  const repo_graphDB = useSelector(
    (state: DatabaseState) => state.database.repo,
  );
  const db_prefix_URL = useSelector(
    (state: DatabaseState) => state.database.db_prefix_URL,
  );

  const dispatch = useDispatch();

  const [selectRepoReminder, setSelectRepoReminder] = useState<boolean>(false);
  const [columnsRepoTable, setColumnsRepoTable] = useState<any>([]);
  const [dataRepoTable, setDataRepoTable] = useState<any>([]);
  const [repoList, setRepoList] = useState<string[]>([]);

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
        // set default repo to the first of the list.
        if (repoList.length > 0 && repo_graphDB === undefined) {
          dispatch({ type: 'database/setRepo', payload: repoList[0] });
        }
        setColumnsRepoTable(columns);
        setDataRepoTable(dataSource);
      }
    } catch (error) {
      console.log(error);
    }
  }

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
            color:
              repo_graphDB && repo_graphDB !== 'None' ? '#22cc22' : '#cc2222',
            fontWeight: 'bold',
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
              title && dispatch({ type: 'database/setRepo', payload: title });
            }}
          />
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Repositories;
