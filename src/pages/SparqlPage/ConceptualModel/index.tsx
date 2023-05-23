import { db_prefix_URL, repo_graphDB } from '@/config';
import { sendSPARQLquery } from '@/pages/services/api';
import { prefix_mapping } from '@/utils';
import { Alert, Backdrop, CircularProgress, Grid, Paper } from '@mui/material';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { useEffect, useState } from 'react';

function ConceptualModelPage(props: any) {
  const [FunctionalPropsColumns, setFunctionalPropsColumns] = useState<any[]>(
    [],
  );
  const [ObjectPropsColumns, setObjectPropsColumns] = useState<any[]>([]);
  const [RangePropsColumns, setRangePropsColumns] = useState<any[]>([]);
  const [classesColumns, setClassesColumns] = useState<any[]>([]);
  const [FunctionalPropsDataSource, setFunctionalPropsDataSource] = useState(
    [],
  );
  const [ObjectPropsDataSource, setObjectPropsDataSource] = useState([]);
  const [RangePropsDataSource, setRangePropsDataSource] = useState([]);
  const [classesDataSource, setClassesDataSource] = useState([]);

  const [loading, setLoading] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertText, setAlertText] = useState('');

  useEffect(() => {
    init();
  }, []);

  async function init() {
    await findFunctionalProperties();

    await findObjectProperties();

    await findRanges();

    await findClasses();
  }

  async function findRanges() {
    try {
      const repositoryID = repo_graphDB;
      const query = `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX mons: <${db_prefix_URL}>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX : <${db_prefix_URL}>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
SELECT ?DP ?T
WHERE {
    {
        ?DP rdfs:range ?T .
        ?DP rdf:type owl:FunctionalProperty .
    }
    FILTER (!isBlank(?DP))
    FILTER(STRSTRTS(STR(?T), STR(xsd:)) || STRSTRTS(STR(?T), STR(:)))
}`;

      setLoading(true);
      const queryRes = await sendSPARQLquery(repositoryID, query);

      const head = queryRes.head.vars;
      const results_bindings = queryRes.results.bindings;

      const columns = head.map((h: any) => ({
        field: h,
        headerName: h,
        minWidth: 300,
        maxWidth: 600,
      }));

      setRangePropsColumns(columns);

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

      console.log('Ranges datasource: ', data);
      setRangePropsDataSource(data);
      //   setShowAlert(false);
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function findClasses() {
    try {
      const repositoryID = repo_graphDB;
      const query = `
      PREFIX mons: <${db_prefix_URL}>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX owl: <http://www.w3.org/2002/07/owl#>
      SELECT DISTINCT ?class
      WHERE {
          {
              ?class rdf:type owl:Class . 
          }
          FILTER(STRSTARTS(STR(?class), STR(mons:)))
      }`;

      setLoading(true);
      const queryRes = await sendSPARQLquery(repositoryID, query);

      const head = queryRes.head.vars;
      const results_bindings = queryRes.results.bindings;

      const columns = head.map((h: any) => ({
        field: h,
        headerName: h,
        minWidth: 300,
        maxWidth: 600,
      }));

      setClassesColumns(columns);

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

      console.log('Classes datasource: ', data);

      setClassesDataSource(data);
      //   setShowAlert(false);
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function findFunctionalProperties() {
    try {
      const repositoryID = repo_graphDB;
      const query = `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
	  PREFIX mons: <${db_prefix_URL}>
	  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
	  PREFIX owl: <http://www.w3.org/2002/07/owl#>
	  PREFIX : <${db_prefix_URL}>
	  SELECT ?DP
	  WHERE {
		  {
			  ?DP rdf:type owl:FunctionalProperty .
		  }
		  FILTER (!isBlank(?DP))
	  }`;

      setLoading(true);
      const queryRes = await sendSPARQLquery(repositoryID, query);

      const head = queryRes.head.vars;
      const results_bindings = queryRes.results.bindings;

      const columns = head.map((h: any) => ({
        field: h,
        headerName: h,
        minWidth: 300,
        maxWidth: 600,
      }));

      setFunctionalPropsColumns(columns);

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

      console.log('FPs: ', data);
      setFunctionalPropsDataSource(data);
      //   setShowAlert(false);
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function findObjectProperties() {
    try {
      const repositoryID = repo_graphDB;
      const query = `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
	  PREFIX mons: <${db_prefix_URL}>
	  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
	  PREFIX owl: <http://www.w3.org/2002/07/owl#>
	  PREFIX : <${db_prefix_URL}>
	  SELECT ?PAB
	  WHERE {
		  {
			  ?PAB rdf:type owl:ObjectProperty .
		  }
		  FILTER (!isBlank(?PAB))
		  FILTER(STRSTARTS(STR(?PAB), STR(:)))
	  }`;
      setLoading(true);
      const queryRes = await sendSPARQLquery(repositoryID, query);

      const head = queryRes.head.vars;
      const results_bindings = queryRes.results.bindings;

      const columns = head.map((h: any) => ({
        field: h,
        headerName: h,
        minWidth: 300,
        maxWidth: 600,
      }));
      setObjectPropsColumns(columns);

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

      console.log('OPs: ', data);

      setObjectPropsDataSource(data);
      //   setShowAlert(false);
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Grid>
      <Grid container spacing={2}>
        <Grid item xs={4}>
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
      </Grid>

      <Grid container spacing={3} style={{ paddingTop: 20 }}>
        {/* Chart */}
        {FunctionalPropsDataSource.length > 0 &&
          FunctionalPropsColumns.length > 0 && (
            <Grid item xs>
              Functional Properties
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
                    rows={FunctionalPropsDataSource}
                    columns={FunctionalPropsColumns}
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
          )}

        {RangePropsDataSource.length > 0 && RangePropsColumns.length > 0 && (
          <Grid item xs>
            All Classes
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
                  rows={classesDataSource}
                  columns={classesColumns}
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
        )}

        {ObjectPropsDataSource.length > 0 && ObjectPropsColumns.length > 0 && (
          <Grid item xs>
            Object Properties
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
                  rows={ObjectPropsDataSource}
                  columns={ObjectPropsColumns}
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
        )}

        {RangePropsDataSource.length > 0 && RangePropsColumns.length > 0 && (
          <Grid item xs>
            Range Properties
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
                  rows={RangePropsDataSource}
                  columns={RangePropsColumns}
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
        )}

        {classesDataSource.length > 0 && classesColumns.length > 0 && (
          <Grid item xs>
            Object Properties
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
                  rows={ObjectPropsDataSource}
                  columns={ObjectPropsColumns}
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
        )}
      </Grid>
    </Grid>
  );
}

export default ConceptualModelPage;
