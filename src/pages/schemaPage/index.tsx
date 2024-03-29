import { StreamLanguage } from '@codemirror/language';
import { sparql } from '@codemirror/legacy-modes/mode/sparql';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Alert,
  Backdrop,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  ListItem,
  ListItemText,
  Paper,
  Snackbar,
  styled,
} from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import { DataGrid, GridRowId } from '@mui/x-data-grid';
import { DataGridPro } from '@mui/x-data-grid-pro';
import CodeMirror from '@uiw/react-codemirror';
import { useEffect, useMemo, useState } from 'react';
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

  const [PABdataSource, setPABDataSource] = useState<any[]>([]);
  const [PABdataSourceCopy, setPABDataSourceCopy] = useState<any[]>([]);
  const [classesInPAB, setClassesInPAB] = useState<IClassFilter[]>([]);
  const classesChecked = useMemo(() => classesInPAB, [classesInPAB]);
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
           OPTIONAL {?PAB rdfs:range ?range ;}
      OPTIONAL {?PAB rdfs:domain ?domain .}
      ?d ?PAB ?r .
      ?d rdf:type ?domain .
      ?r rdf:type ?range .
      FILTER (!isBlank(?PAB) && !isBlank(?domain) && !isBlank(?range))
      FILTER(STRSTARTS(STR(?PAB), STR(:)) &&STRSTARTS(STR(?domain), STR(:)) && STRSTARTS(STR(?range), STR(:)))
  }
  GROUP BY ?PAB ?domain ?range`;

  const [classColumn, setClassColumn] = useState<any>([]);
  const [classDataSource, setClassDataSource] = useState<any>([]);
  const [classDPMapping, setClassDPMapping] = useState<any>({});
  const [tableLoading, setTableLoading] = useState(false);

  interface IClassFilter {
    id: GridRowId;
    class: string;
    checked: boolean;
  }

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
          headerName: 'Has Data Property?',
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

      const classList = new Set<string>();
      for (const item of data) {
        classList.add(item.domain);
        classList.add(item.range);
      }

      const classListArray = [...classList].sort();

      setClassesInPAB(
        classListArray.map((item, index) => {
          return {
            id: index,
            class: item,
            checked: true,
          };
        }),
      );
      // setClassesChecked(
      //   classListArray.map((item, index) => {
      //     return {
      //       id: index,
      //       class: item,
      //       checked: true,
      //     };
      //   }),
      // );

      setHeaders(headers);
      setPABDataSource(data);
      setPABDataSourceCopy(data);
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

  // effect in filter state changes
  useEffect(() => {
    const newPABdataSource = PABdataSourceCopy.filter((chordItem: any) => {
      const cd = classesChecked.find(
        (classItem) => classItem.class === chordItem.domain,
      );
      const cr = classesChecked.find(
        (classItem) => classItem.class === chordItem.range,
      );
      return cd?.checked && cr?.checked;
    });
    setPABDataSource(newPABdataSource);
  }, [classesChecked]);

  const [filterChanged, setFilterChanged] = useState(false);
  function classFilterforChord() {
    return (
      <Box sx={{ display: 'flex' }}>
        <Paper
          sx={{
            height: '75vh',
            width: 300,
          }}
        >
          <DataGrid
            rows={classesInPAB}
            columns={[
              {
                field: 'class',
                headerName: 'Class',
                width: 150,
              },
              {
                field: 'checked',
                headerName: 'Include',
                width: 200,
                disableColumnMenu: true,
                hideSortIcons: true,
                renderHeader: () => {
                  return (
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      sx={{ textTransform: 'none' }}
                      onClick={() => {
                        const newPABdataSource = PABdataSourceCopy.filter(
                          (chordItem: any) => {
                            const cd = classesChecked.find(
                              (classItem) =>
                                classItem.class === chordItem.domain,
                            );
                            const cr = classesChecked.find(
                              (classItem) =>
                                classItem.class === chordItem.range,
                            );
                            return cd?.checked && cr?.checked;
                          },
                        );
                        setPABDataSource(newPABdataSource);
                      }}
                    >
                      Apply Filter
                    </Button>
                  );
                },
                renderCell: (params) => {
                  const row = params.row;
                  const class_id = row.id;
                  const checked = classesChecked.find(
                    (c) => c.id === class_id,
                  )?.checked;
                  return (
                    <Checkbox
                      checked={checked}
                      onClick={() => {
                        const item = classesChecked.find(
                          (c) => c.id === class_id,
                        ) as IClassFilter;
                        item.checked = !item.checked;
                      }}
                    />
                  );
                },
              },
            ]}
            pageSize={classDataSource.length}
            rowsPerPageOptions={[classDataSource.length]}
            key={Date.now()}
          />
        </Paper>
      </Box>
    );
  }

  // states for code generation,
  // TODO: duplicated code with schemaGraph/Chord, should be refactored in the future
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [generatedQuery, setGeneratedQuery] = useState<string>('');
  const [showEditWarning, setShowEditWarning] = useState<boolean>(false);
  const [showCopySuccess, setShowCopySuccess] = useState<boolean>(false);
  const [showCopyUnderUnsafeOrigin, setShowCopyUnderUnsafeOrigin] =
    useState<boolean>(false);

  const [FDPList, setFDPList] = useState<string[]>([]);
  const [showFDPList, setShowFDPList] = useState<boolean>(false);
  // for FDP query generation
  const [showFDPQueryGen, setShowFDPQueryGen] = useState<boolean>(false);

  const handleCopyToClipboard = () => {
    if (window.isSecureContext && navigator.clipboard) {
      navigator.clipboard
        .writeText(generatedQuery)
        .then(() => {
          setShowCopySuccess(true);
        })
        .finally(() => {
          setTimeout(() => {
            setShowCopySuccess(false);
          }, 2000);
        });
    } else {
      try {
        setShowCopyUnderUnsafeOrigin(true);
      } catch (error) {
        console.log(error);
      } finally {
        setTimeout(() => {
          setShowCopyUnderUnsafeOrigin(false);
        }, 2000);
      }
    }
  };

  function showGeneratedFDPList(class_name: string, FDPList: string[]) {
    return (
      <Dialog
        fullWidth
        maxWidth="sm"
        open={showFDPList}
        onClose={() => setShowFDPList(false)}
      >
        <DialogTitle>{`Related data properties of ${class_name}`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Click one of the properties to get related SPARQL query
          </DialogContentText>
          {FDPList.map((dp) => {
            return (
              <>
                <ListItem
                  key={dp}
                  button
                  onClick={(e) => {
                    const DP = e.currentTarget.textContent;
                    const var_DP = DP?.split(':')[1].toLowerCase();
                    const class_URI = class_name;
                    const var_class = class_URI?.split(':')[1].toLowerCase();

                    const generatedQuery = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX : <${db_prefix_URL}>
SELECT ?${var_class} ?${var_DP}
WHERE {
    ?${var_class} rdf:type ${class_URI} ;
		${DP} ?${var_DP} .
}`;
                    setGeneratedQuery(generatedQuery);
                    setShowFDPQueryGen(true);
                  }}
                >
                  <ListItemText primary={dp} />
                </ListItem>
                <Divider />
              </>
            );
          })}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowFDPList(false);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  function generatedContent(query: string) {
    return (
      <DialogContent>
        <CodeMirror
          value={query}
          height="300px"
          extensions={[StreamLanguage.define(sparql)]}
          readOnly
          onKeyDown={() => setShowEditWarning(true)}
        />
        <DialogContentText>
          <Button
            variant="text"
            size="small"
            endIcon={<ContentCopyIcon />}
            onClick={handleCopyToClipboard}
            aria-describedby={'copySuccess'}
            style={{
              textTransform: 'none',
            }}
          >
            Copy to clipboard
          </Button>
          <br />

          <Button
            variant="text"
            color="success"
            size="medium"
            endIcon={<OpenInNewIcon />}
            style={{
              fontWeight: 'bold',
              textTransform: 'none',
            }}
            href={`/SparqlPage/?query=${encodeURIComponent(
              query,
            )}&repo_graphDB=${encodeURIComponent(
              repo_graphDB,
            )}&db_prefix_URL=${encodeURIComponent(db_prefix_URL)}`}
            target="_blank"
            rel="noreferrer"
          >
            Try this query in SPARQL page!
          </Button>
        </DialogContentText>
      </DialogContent>
    );
  }

  function showGeneratedFDPQuery() {
    return (
      <Dialog
        fullWidth
        maxWidth="md"
        open={showFDPQueryGen}
        onClose={() => setShowFDPQueryGen(false)}
      >
        <DialogTitle>{`Generated query`}</DialogTitle>
        {generatedContent(generatedQuery)}
        <DialogActions>
          <Button
            onClick={() => {
              setShowFDPQueryGen(false);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  const [expandRelationships, setExpandRelationships] = useState<boolean>(true);
  const [expandClassTable, setExpandClassTable] = useState<boolean>(false);
  const [expandQueryFactory, setExpandQueryFactory] = useState<boolean>(false);

  function toggleExpandRelationships() {
    setExpandRelationships(!expandRelationships);
  }

  function toggleExpandClassTable() {
    setExpandClassTable(!expandClassTable);
  }

  function toggleExpandQueryFactory() {
    setExpandQueryFactory(!expandQueryFactory);
  }

  return (
    <Grid>
      {PABdataSource.length > 0 &&
        classColumn.length > 0 &&
        headers.length > 0 && (
          <Grid container spacing={3} style={{ paddingTop: 20 }}>
            <Grid item xs={12}>
              <Accordion
                expanded={expandRelationships}
                onChange={toggleExpandRelationships}
                style={{
                  border: '1px solid rgba(0, 0, 0, .125)',
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ width: '33%', flexShrink: 0 }}>
                    Relationships
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>
                    Visualised Schema
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid item xs={12} display="flex" flexDirection="row">
                    <Grid margin={2}>{classFilterforChord()}</Grid>
                    <Grid marginLeft={10} maxWidth="60%">
                      <ChordSchema headers={headers} data={PABdataSource} />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Table for content of all classes */}
            <Grid item xs={12}>
              <Accordion
                expanded={expandClassTable}
                onChange={toggleExpandClassTable}
                style={{
                  border: '1px solid rgba(0, 0, 0, .125)',
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ width: '33%', flexShrink: 0 }}>
                    Table of all Classes
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>
                    browse in tabular form
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Paper
                    sx={{
                      height: '90vh',
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

                        setSelectedClass(class_name);
                        setFDPList(DP_list);
                        setShowFDPList(true);
                      }}
                    />
                  </Paper>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Experimental: query factory from schema */}
            <Grid item xs={12}>
              <Accordion
                expanded={expandQueryFactory}
                onChange={toggleExpandQueryFactory}
                style={{
                  border: '1px solid rgba(0, 0, 0, .125)',
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ width: '60%', flexShrink: 0 }}>
                    Query Factory (Not deployed)
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>
                    build your query from schema
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {/* <QueryFactory
                    classDPMapping={classDPMapping}
                    PABData={PABdataSourceCopy}
                  /> */}
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        )}

      {showGeneratedFDPList(selectedClass, FDPList)}
      {showGeneratedFDPQuery()}

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

      {/* Copied successful notification */}
      <Snackbar
        open={showCopySuccess}
        autoHideDuration={2000}
        onClose={() => setShowCopySuccess(false)}
      >
        <Alert
          severity="success"
          sx={{ width: '100%' }}
          onClose={() => setShowCopySuccess(false)}
        >
          The SPARQL query has been copied to clipboard!
        </Alert>
      </Snackbar>
      {/* Copy failed  Clipboard not available in unsafe origin */}
      <Snackbar
        open={showCopyUnderUnsafeOrigin}
        autoHideDuration={2000}
        onClose={() => setShowCopyUnderUnsafeOrigin(false)}
      >
        <Alert
          severity="error"
          sx={{ width: '100%' }}
          onClose={() => setShowCopyUnderUnsafeOrigin(false)}
        >
          Copy failed: Clipboard is not available under unsafe (non-https)
          origin!
        </Alert>
      </Snackbar>

      {/* readonly warning */}
      <Snackbar
        open={showEditWarning}
        autoHideDuration={2000}
        onClose={() => setShowEditWarning(false)}
      >
        <Alert
          severity="error"
          sx={{ width: '100%' }}
          onClose={() => setShowEditWarning(false)}
        >
          This query is readonly.
        </Alert>
      </Snackbar>
    </Grid>
  );
}

export default SchemaPage;
