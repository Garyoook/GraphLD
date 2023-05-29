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
import { useSelector } from 'react-redux';
import { prefix_mapping } from '../../utils';
import {
  getClasses,
  getDPByClass,
} from '../SparqlPage/ConceptualModel/service';
import { DatabaseState } from '../reducer/databaseReducer';
import { sendSPARQLquery } from '../services/api';
import ChordSchema from './schemaGraph/Chord';

function SchemaPage() {
  const repo_graphDB = useSelector(
    (state: DatabaseState) => state.database.repo,
  );
  const db_prefix_URL = useSelector(
    (state: DatabaseState) => state.database.db_prefix_URL,
  );

  const [PABdataSource, setPABDataSource] = useState([]);
  const [loading, setLoading] = useState(false);

  const [headers, setHeaders] = useState<string[]>([]);

  const query_for_PAB_relation = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
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

  const [classColumn, setClassColumn] = useState<any>([]);
  const [classDataSource, setClassDataSource] = useState<any>([]);
  const [classDPMapping, setClassDPMapping] = useState<any>({});
  const [tableLoading, setTableLoading] = useState(false);

  async function initClassInfo(repo_graphDB: string, db_prefix_URL: string) {
    try {
      const classesList = await getClasses(repo_graphDB, db_prefix_URL);

      const columns = [
        {
          field: 'class',
          headerName: 'Class Name',
          width: 300,
        },
        {
          field: 'hasDP',
          headerName: 'Has Direct Functional Property?',
          width: 300,
        },
      ];

      const data = classesList.map((classItem: string, index: number) => {
        return {
          id: index,
          class: classItem,
        };
      });

      const newData = await initDPInfo(data);

      setClassColumn(columns);
      setClassDataSource([
        ...newData
          .filter((item: any) => item.hasDP)
          .sort((a: { class: string }, b: { class: string }) =>
            a.class.localeCompare(b.class),
          ),
        ...newData
          .filter((item: any) => !item.hasDP)
          .sort((a: { class: string }, b: { class: string }) =>
            a.class.localeCompare(b.class),
          ),
      ]);
    } catch (error) {
      console.log(error);
    }
  }

  async function initDPInfo(classDataSource: any) {
    try {
      setTableLoading(true);
      for (const classItem of classDataSource) {
        const class_name = classItem.class;
        try {
          const DP_list = await getDPByClass(
            class_name,
            repo_graphDB,
            db_prefix_URL,
          );
          classDPMapping[class_name] = DP_list;
          setClassDPMapping(classDPMapping);

          classItem.hasDP = DP_list.length > 0;
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setTableLoading(false);
    }

    return classDataSource;
  }

  useEffect(() => {
    initClassInfo(repo_graphDB, db_prefix_URL);
  }, [repo_graphDB, db_prefix_URL]);

  const loadDataForPABRelation = async () => {
    const repositoryID = repo_graphDB;

    try {
      setLoading(true);
      const queryRes = await sendSPARQLquery(
        repositoryID,
        query_for_PAB_relation,
        false,
      );

      const head = queryRes.head.vars;
      const results_bindings = queryRes.results.bindings;

      const columns = head.map((h: any) => ({
        field: h,
        headerName: h,
        minWidth: 300,
        maxWidth: 600,
      }));

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

      setPABDataSource(data);
    } catch (e) {
      console.log('Error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataForPABRelation();
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
      {PABdataSource.length > 0 &&
        classColumn.length > 0 &&
        headers.length > 0 && (
          <Grid container spacing={3} style={{ paddingTop: 20 }}>
            <DividerWrapper>
              <Divider>Relationships</Divider>
            </DividerWrapper>
            <Grid item xs={12}>
              <ChordSchema headers={headers} data={PABdataSource} />
            </Grid>

            <DividerWrapper>
              <Divider>Table</Divider>
            </DividerWrapper>

            {/* Table for content of all classes */}
            <Grid item xs={12}>
              <Paper
                sx={{
                  height: '100vh',
                }}
              >
                <DataGridPro
                  rows={classDataSource}
                  columns={classColumn}
                  rowSpacingType="border"
                  showCellRightBorder
                  key={Date.now()}
                  onRowClick={async (params) => {
                    const row = params.row;
                    const class_name = row.class;
                    const DP_list = classDPMapping[class_name];
                    console.log(
                      'DP of class ',
                      class_name,
                      ' : ',
                      classDPMapping[class_name],
                    );
                  }}
                />
              </Paper>
            </Grid>
          </Grid>
        )}

      {(loading || tableLoading) && (
        <Backdrop
          sx={{
            marginLeft: `${
              document.getElementById('DashBoardDrawer')?.offsetWidth
            }px`,
            marginTop: `${
              document.getElementById('DashBoardToolbar')?.offsetHeight
            }px`,
            color: '#fff',
            fontSize: 20,
            fontWeight: 'bold',
            backgroundColor: '#1976d2',
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
          open={loading || tableLoading}
        >
          <CircularProgress color="inherit" />
          <div style={{ marginLeft: 20 }}> Loading Schema ... </div>
        </Backdrop>
      )}
    </Grid>
  );
}

export default SchemaPage;
