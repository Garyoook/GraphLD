import { db_prefix_URL, repo_graphDB } from '@/config';
import {
  Backdrop,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  styled,
} from '@mui/material';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { useEffect, useState } from 'react';
import { prefix_mapping } from '../../utils';
import { sendSPARQLquery } from '../services/api';
import ChordSchema from './schemaGraph/Chord';

function SchemaPage() {
  const query = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  PREFIX : <${db_prefix_URL}>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  SELECT ?domain ?range
  (count(?d) AS ?count) ?PAB
  WHERE {
      ?PAB rdf:type owl:ObjectProperty ;
           rdfs:range ?range ;
           rdfs:domain ?domain .
      ?d ?PAB ?r .
  #    ?d rdf:type ?domain .
  #    ?r rdf:type ?range .
      FILTER (!isBlank(?PAB) && !isBlank(?domain) && !isBlank(?range))
      FILTER(STRSTARTS(STR(?PAB), STR(:)) &&STRSTARTS(STR(?domain), STR(:)) && STRSTARTS(STR(?range), STR(:)))
  }
  GROUP BY ?PAB ?domain ?range`;
  const [columns, setColumns] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);

  const [headers, setHeaders] = useState<string[]>([]);

  const handleQuery = async () => {
    const repositoryID = repo_graphDB;

    try {
      setLoading(true);
      const queryRes = await sendSPARQLquery(repositoryID, query, false);

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
            if (
              value_split[0] === 'http://www.semwebtech.org/mondial/10/meta'
            ) {
              obj[key] = `${prefix_mapping[value_split[0]]}:${value_split[1]}`;
            }
          } else {
            obj[key] = value;
          }
        }

        if (Object.keys(obj).length === 0) {
          return null;
        } else {
          // console.log("obj: ", obj);
        }
        return {
          id: index,
          ...obj,
        };
      });

      const headers: string[] = [];
      if (data.length > 0) {
        const firstRow = data[0];
        const keys = Object.keys(firstRow);
        for (const key of keys) {
          headers.push(key);
        }
      }

      if (headers.includes('id')) {
        const spliceIndex = headers.indexOf('id');
        headers.splice(spliceIndex, 1);
      }

      setHeaders(headers);

      setDataSource(data);
    } catch (e) {
      console.log('Error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleQuery();
  }, []);

  const DividerWrapper = styled('div')(({ theme }) => ({
    width: '100%',
    marginTop: 20,
    ...theme.typography.body2,
    '& > :not(style) + :not(style)': {
      marginTop: theme.spacing(2),
    },
  }));

  return (
    <Grid>
      {dataSource.length > 0 && columns.length > 0 && headers.length > 0 && (
        <Grid container spacing={3} style={{ paddingTop: 20 }}>
          <DividerWrapper>
            <Divider>Relationships</Divider>
          </DividerWrapper>
          <Grid item xs={12}>
            <ChordSchema headers={headers} data={dataSource} />
          </Grid>

          <DividerWrapper>
            <Divider>Table</Divider>
          </DividerWrapper>
          {/* Table */}
          <Grid item xs={12}>
            <Paper
              sx={{
                height: '100vh',
              }}
            >
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
            </Paper>
          </Grid>
        </Grid>
      )}

      {loading && (
        <Backdrop
          sx={{
            color: '#fff',
            fontSize: 20,
            fontWeight: 'bold',
            backgroundColor: '#1976d255',
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
          open={loading}
        >
          <CircularProgress color="inherit" />
          <div style={{ marginLeft: 20 }}> Loading Schema ... </div>
        </Backdrop>
      )}
    </Grid>
  );
}

export default SchemaPage;
