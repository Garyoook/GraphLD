import { StreamLanguage } from '@codemirror/language';
import { sparql } from '@codemirror/legacy-modes/mode/sparql';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import {
  Alert,
  AppBar,
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Paper,
  Toolbar,
  Typography,
} from '@mui/material';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { DataGridPro } from '@mui/x-data-grid-pro';
import CodeMirror from '@uiw/react-codemirror';
import { forwardRef, useCallback, useState } from 'react';
import { prefix_mapping } from '../../utils';
import { sendSPARQLquery } from '../services/api';
import VisOptions from './VisOptions';

export interface VisDataProps {
  headers: string[];
  data: (number | string)[][];
}

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function SparqlPage() {
  const [query, setQuery] = useState<string>(
    `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix mon: <http://www.semwebtech.org/mondial/10/meta#>
		
SELECT ?country ?population
WHERE {
	?country rdf:type mon:Country .
	?country mon:population ?population .
} ORDER BY DESC(?population) LIMIT 50`,
  );
  const [columns, setColumns] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openVis, setOpenVisOption] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertText, setAlertText] = useState('');

  const handleVisOpen = () => {
    setOpenVisOption(true);

    // TODO: generate recommendation here
    generateVisRecommendation(query);
  };

  const handleVisClose = () => {
    setOpenVisOption(false);
  };

  async function generateVisRecommendation(user_query: string) {
    const user_query_normalised = user_query;
    let user_query_split;
    if (user_query_normalised.split('where').length === 2) {
      user_query_split = user_query_normalised.split('where');
    } else {
      user_query_split = user_query_normalised.split('WHERE');
    }

    if (user_query_split.length === 2) {
      const user_query_head = user_query_split[0];
      const user_query_body = user_query_split[1];

      const regex = /(?<!rdf)(?:\?|:)[a-zA-Z_][a-zA-Z0-9_]*/gm;

      const matches_head: string[] = [];
      let m_head;
      while ((m_head = regex.exec(user_query_head)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m_head.index === regex.lastIndex) {
          regex.lastIndex++;
        }
        // The result can be accessed through the `m`-variable.
        m_head.forEach((match, groupIndex) => {
          matches_head.push(match);
        });
      }

      const matches_body: string[] = [];
      let m_body;
      while ((m_body = regex.exec(user_query_body)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m_body.index === regex.lastIndex) {
          regex.lastIndex++;
        }
        // The result can be accessed through the `m`-variable.
        m_body.forEach((match, groupIndex) => {
          matches_body.push(match);
        });
      }

      console.log('matches head', matches_head);
      console.log('matches body', matches_body);

      // console.log('DP-T Map: ', DP_Range_mapping);

      // console.log('Classes: ', classesList);

      // console.log('Functional Props: ', FunctionalPropsList);

      // console.log('Object Props: ', ObjectPropsList);

      // console.log('DP-Domain Map: ', DP_domain_mapping);
    }
  }

  const handleQuery = async () => {
    const repositoryID = 'SemanticWebVis';

    try {
      setLoading(true);
      const queryRes = await sendSPARQLquery(repositoryID, query);

      console.log('original queryRes', queryRes);

      const head = queryRes.head.vars;
      const results_bindings = queryRes.results.bindings;

      const columns = head.map((h: any) => ({
        field: h,
        headerName: h,
        minWidth: 300,
        maxWidth: 600,
      }));
      setColumns(columns);

      const colKeys = columns.map((col: any) => col.field);

      const data = results_bindings.map((data_binding: any, index: number) => {
        const obj: any = {};
        for (const key of colKeys) {
          const value = data_binding[key].value;
          const value_split = value.split('#');
          if (value_split.length > 1) {
            obj[key] = `${prefix_mapping[value_split[0]]}:${value_split[1]}`;
          } else {
            obj[key] = value;
          }
        }
        return {
          id: index,
          ...obj,
        };
      });

      console.log('remapped data', data);
      setDataSource(data);
      setShowAlert(false);
    } catch (e: any) {
      console.error('Error', e.response.data);
      setShowAlert(true);
      setAlertText(
        e.response.data || 'Error: please check your query and try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const onChange = useCallback((value: string, viewUpdate: any) => {
    setQuery(value);
  }, []);

  function preprocessDataForGoogleCharts(dataSource: any[]): VisDataProps {
    const headers: string[] = [];
    if (dataSource.length > 0) {
      const firstRow = dataSource[0];
      const keys = Object.keys(firstRow);
      for (const key of keys) {
        headers.push(key);
      }
    }

    if (headers.includes('id')) {
      const spliceIndex = headers.indexOf('id');
      headers.splice(spliceIndex, 1);
    }

    const data = dataSource.map((row) => {
      const dataRow = [];
      for (const key of headers) {
        const value = row[key];
        if (
          typeof value == 'string' &&
          value.match(/http:\/\/www\.semwebtech\.org\/mondial\/10\/(.*)/)
        ) {
          const newValue = value.split('/').reverse()[1];
          dataRow.push(newValue);
        } else if (!isNaN(value)) {
          dataRow.push(Number(value));
        } else {
          dataRow.push(row[key]);
        }
      }
      return dataRow;
    });
    console.log('preprocessed data for Google Charts: ', { headers, data });
    return { headers, data };
  }

  return (
    <Grid>
      <CodeMirror
        value={query}
        height="300px"
        extensions={[StreamLanguage.define(sparql)]}
        onChange={onChange}
      />
      <Grid container spacing={2}>
        <Grid item xs={12}></Grid>
        <Grid item xs={4}>
          <Button
            variant="contained"
            disabled={loading}
            onClick={handleQuery}
            endIcon={<SendIcon />}
          >
            Execute query
          </Button>
          {loading && (
            <Backdrop
              sx={{
                color: '#fff',
                zIndex: (theme) => theme.zIndex.drawer + 1,
              }}
              open={loading}
            >
              <CircularProgress color="inherit" />

              <div style={{ marginLeft: 20 }}> Processing query ... </div>
            </Backdrop>
          )}
        </Grid>

        <Grid item xs={12}></Grid>

        <Grid item xs>
          <Button
            variant="outlined"
            disabled={loading || dataSource.length == 0}
            onClick={handleVisOpen}
            endIcon={<AutoGraphIcon />}
          >
            Visualisation Options
          </Button>
          <Dialog
            open={openVis}
            onClose={handleVisClose}
            fullScreen
            TransitionComponent={Transition}
          >
            <AppBar sx={{ position: 'relative' }}>
              <Toolbar>
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={handleVisClose}
                  aria-label="close"
                >
                  <CloseIcon />
                </IconButton>
                <Typography
                  sx={{ ml: 2, flex: 1 }}
                  variant="h6"
                  component="div"
                >
                  Choose your visualisation
                </Typography>
                <Button autoFocus color="inherit" onClick={handleVisClose}>
                  close
                </Button>
              </Toolbar>
            </AppBar>
            <DialogContent>
              <VisOptions
                data={preprocessDataForGoogleCharts(dataSource)}
                originalData={dataSource}
              />
            </DialogContent>
          </Dialog>
        </Grid>
      </Grid>

      {dataSource.length > 0 && columns.length > 0 && (
        <Grid container spacing={3} style={{ paddingTop: 20 }}>
          {/* Chart */}
          <Grid item xs={12}>
            <Paper
              sx={{
                height: '100vh',
              }}
            >
              {showAlert ? (
                <Alert severity="error" style={{ height: '100%' }}>
                  {alertText}
                </Alert>
              ) : (
                <DataGridPro
                  rows={dataSource}
                  columns={columns}
                  pagination
                  rowSpacingType="border"
                  showCellRightBorder
                  rowsPerPageOptions={[100, 200, 1000]}
                  // onRowClick={(params) => {
                  //     fetchStatementsFromRepo(
                  //         (params.row as IRepository)
                  //             .title
                  //     );
                  // }}
                />
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
}

export default SparqlPage;
