import { StreamLanguage } from '@codemirror/language';
import { sparql } from '@codemirror/legacy-modes/mode/sparql';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import {
  Alert,
  AppBar,
  Button,
  Dialog,
  DialogContent,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  Paper,
  Switch,
  Toolbar,
  Typography,
} from '@mui/material';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { DataGridPro } from '@mui/x-data-grid-pro';
import CodeMirror from '@uiw/react-codemirror';
import { forwardRef, useCallback, useState } from 'react';
import { ConceptualModelInfo } from '..';
import {
  ChartType_mapping,
  DATA_DIMENTION_TYPE,
  prefix_mapping,
  ranges_type_mapping,
} from '../../utils';
import { sendSPARQLquery } from '../services/api';
import { DataPropertyDomain } from './ConceptualModel/function';
import VisOptions, { ChartType } from './VisOptions';

import { repo_graphDB } from '@/consts';
import LoadingButton from '@mui/lab/LoadingButton';

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

const initialString = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix : <http://www.semwebtech.org/mondial/10/meta#>
		
SELECT ?country ?population
WHERE {
	?country rdf:type :Country ;
        :population ?population .
} ORDER BY DESC(?population) LIMIT 50`;

const f3a = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX : <http://www.semwebtech.org/mondial/10/meta#>
SELECT ?inflation ?unemployment WHERE {
    ?c rdf:type :Country ;
       :inflation ?inflation ;
       :unemployment ?unemployment .
}`;

const f3b = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX : <http://www.semwebtech.org/mondial/10/meta#>
SELECT ?continent ?carcode ?population 
WHERE {
    ?c rdf:type :Country ;
       :carCode ?carcode ;
       :population ?population ;
       :encompassedByInfo ?en .
    ?en :encompassedBy ?con ;
		:percent ?percent .
    ?con rdf:type :Continent ;
         :name ?continent .
    FILTER ( ?percent > 50)
}`;

const f3c = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX : <http://www.semwebtech.org/mondial/10/meta#>
SELECT ?country ?year ?population 
WHERE {
    ?c rdf:type :Country ; 
       :name ?country ;
       :encompassedByInfo ?en .
    ?py rdf:type :PopulationCount ;
        :year ?year;
        :value ?population .
    ?c 	:hadPopulation ?py .
# Filter conditions
    ?en :encompassedBy ?con .
    ?con rdf:type :Continent ;
         :name "Australia/Oceania" .
}`;

const f3d = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX : <http://www.semwebtech.org/mondial/10/meta#>
SELECT ?country1 ?country2 ?length
WHERE {
    ?b rdf:type :Border ;
       :isBorderOf ?c1 ;
       :isBorderOf ?c2 ;
       :length ?length .
  ?c1 rdf:type :Country ;
      :carCode ?country1 .
  ?c2 rdf:type :Country ;
      :carCode ?country2 .
  # Filter conditions
  FILTER (?country1<?country2)
}`;

export interface RecommendationProps {
  chart: ChartType;
  rating: number;
}

function SparqlPage() {
  const [query, setQuery] = useState<string>(initialString);
  const [columns, setColumns] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openVis, setOpenVisOption] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertText, setAlertText] = useState('');

  const [inferredDataQuery, setInferredDataQuery] = useState<boolean>(true);

  const [recommendations, setRecommendations] = useState<RecommendationProps[]>(
    [],
  );

  // console.log('Classes: ', classesList);
  // console.log('Functional Props: ', FunctionalPropsList);
  // console.log('Datatype Props', DatatypePropsList);
  // console.log('Key DPs: ', DPKList);
  // console.log('Object Props: ', ObjectPropsList);
  // console.log('DP-Domain Map: ', DP_domain_mapping);
  // console.log('DP-T Map: ', DP_Range_mapping);

  const handleVisOpen = () => {
    setOpenVisOption(true);
  };

  const handleVisClose = () => {
    setOpenVisOption(false);
  };

  function generateRatingsFor1C(
    c_num: number,
    t_num: number,
    var_to_range_mapping: any,
  ) {
    // ratings for 1 class with DPs:
    const ratings: any = {
      scatter: 0,
      bubble: 0,
      bar: 0,
      wordClouds: 0,
      calendar: 0,
      pie: 0,
    };

    if (c_num == 1 && t_num == 2) {
      let allScalar = true;
      if (
        Object.values(var_to_range_mapping).some((v: any) => {
          return ranges_type_mapping[v] == DATA_DIMENTION_TYPE.LEXICAL;
        })
      ) {
        allScalar = false;
        ratings.wordClouds += 100;
      }
      if (
        Object.values(var_to_range_mapping).some((v: any) => {
          return ranges_type_mapping[v] == DATA_DIMENTION_TYPE.DISCRETE;
        })
      ) {
        allScalar = false;
      }
      ratings.scatter += allScalar ? 100 : 30;
    }

    if (
      c_num == 1 &&
      t_num >= 2 &&
      t_num <= 4 &&
      Object.values(var_to_range_mapping).some((v: any) => {
        return ranges_type_mapping[v] == DATA_DIMENTION_TYPE.SCALAR;
      })
    ) {
      ratings.bubble += 100;
    }

    if (
      c_num == 1 &&
      t_num == 2 &&
      Object.values(var_to_range_mapping).some((v: any) => {
        return ranges_type_mapping[v] == DATA_DIMENTION_TYPE.SCALAR;
      })
    ) {
      ratings.scatter += 100;
    }

    // TODO: here will be a checker & new branch for the key(a must) to apply bar/wordClouds/pie chart.
    if (
      c_num == 1 &&
      t_num == 1 &&
      Object.values(var_to_range_mapping).some((v: any) => {
        return ranges_type_mapping[v] == DATA_DIMENTION_TYPE.SCALAR;
      })
    ) {
      ratings.bar += 100;
      ratings.wordClouds += 70;
      ratings.pie += 100;
    }
    if (
      c_num == 1 &&
      t_num == 1 &&
      Object.values(var_to_range_mapping).some((v: any) => {
        return ranges_type_mapping[v] == DATA_DIMENTION_TYPE.SCALAR;
      }) &&
      Object.values(var_to_range_mapping).some((v: any) => {
        return ranges_type_mapping[v] == DATA_DIMENTION_TYPE.LEXICAL;
      })
    ) {
      ratings.bar += 100;
      ratings.wordClouds += 100;
    }
    if (
      c_num == 1 &&
      t_num == 1 &&
      Object.values(var_to_range_mapping).some((v: any) => {
        return v == 'xsd:date';
      })
    ) {
      ratings.calendar += 80;
    }
    console.log('Final 1 class vis ratings: ', ratings);

    return ratings;
  }

  function generateratingsFor2C1PAB(
    c_num: number,
    t_num: number,
    pab_num: number,
    var_to_class: any,
    var_to_range_mapping: any,
  ) {
    // ratings for 1 class with DPs:
    const ratings: any = {
      treeMap: 0,
      hierarchyTree: 0,
      sunburst: 0,
      circlePacking: 0,
    };

    if (c_num == 2 && t_num == 2) {
      ratings.hierarchyTree += 100;
    }

    if (
      c_num == 2 &&
      t_num == 3 &&
      Object.values(var_to_range_mapping).some((v: any) => {
        return ranges_type_mapping[v] == DATA_DIMENTION_TYPE.SCALAR;
      })
    ) {
      ratings.treeMap += 100;
      ratings.hierarchyTree += 20;
      ratings.sunburst += 70;
      ratings.circlePacking += 70;
    }

    console.log('Final 2 class vis ratings: ', ratings);

    return ratings;
  }

  function generateRatingsFor3C(
    c_num: number,
    t_num: number,
    var_to_range_mapping: any,
  ) {
    // ratings for 1 class with DPs:
    const ratings: any = {
      sankey: 0,
      chord: 0,
    };

    if (c_num == 3) {
      // TODO: separate sankey and chord ratings by checking the reflexivity.
      ratings.sankey += 100;
      ratings.chord += 100;
    }

    console.log('Final 2 class vis ratings: ', ratings);

    return ratings;
  }

  function generateVisRecommendation(
    user_query: string,
  ): RecommendationProps[] {
    const CLASSES: string[] = [];
    const CLASS_DP_LOCAL: any = {};
    const DP_RANGE_LOCAL: any = {};
    const var_to_class: any = {};
    const var_to_range_mapping: any = {};

    // ratings for 1 class with DPs:
    let ratings_recommendation: any = {};

    const user_query_normalised = user_query.replace(/[\n\t]/g, '');
    let user_query_split;
    if (user_query_normalised.split('where').length === 2) {
      user_query_split = user_query_normalised.split('where');
    } else {
      user_query_split = user_query_normalised.split('WHERE');
    }

    if (user_query_split.length === 2) {
      const user_query_head = user_query_split[0];
      const user_query_body = user_query_split[1];

      // regex to match variables in the query.
      const regex_vars = /(?<!rdf)(?:\?)[a-zA-Z_][a-zA-Z0-9_]*/gm;

      // regex to match variables in the query head (text before 'WHERE').
      const vars_head: string[] = [];
      let m_head;
      while ((m_head = regex_vars.exec(user_query_head)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m_head.index === regex_vars.lastIndex) {
          regex_vars.lastIndex++;
        }
        // The result can be accessed through the `m`-variable.
        m_head.forEach((match, groupIndex) => {
          vars_head.push(match.split('?')[1]);
        });
      }
      console.log('matches head', vars_head);

      // analysis to the query body, to find the classes, data/object properties
      // and ranges, and map them to the variables.
      const statements = user_query_body.split('.');
      for (const stmt of statements) {
        const stmt_split = stmt.split(';');
        for (const sub_stmt of stmt_split) {
          const sub_stmt_trim = sub_stmt.trim();
          // console.log('statements, ', sub_stmt_trim);
          if (sub_stmt_trim.includes('rdf:type')) {
            const type_split = sub_stmt_trim.split('rdf:type');
            const variable = type_split[0].split('?')[1].trim();
            if (variable && variable.length > 0) {
              const class_type = type_split[1].trim();
              var_to_class[variable] = class_type;
              CLASSES.push(class_type);
            }
          }
        }
      }
      console.log('var_to_class: ', var_to_class);

      const PAB_LIST: any = [];
      // const var_to_DPA_mapping: any = {};
      for (const stmt of statements) {
        const stmt_split = stmt.split(';');
        for (const sub_stmt of stmt_split) {
          const sub_stmt_trim = sub_stmt.trim();

          // get DP and range
          let DP: string = '';
          if (
            ConceptualModelInfo.DatatypePropsList.some((dp: string) => {
              DP = dp;
              return sub_stmt_trim.includes(dp);
            }) ||
            ConceptualModelInfo.FunctionalPropsList.some((dp: string) => {
              DP = dp;
              return sub_stmt_trim.includes(dp);
            })
          ) {
            const DP_split = sub_stmt_trim.split(DP);
            const var_in_stmt = DP_split[1].split('?')[1];
            if (var_in_stmt && var_in_stmt.length > 0) {
              // var_to_DPA_mapping[var_in_stmt] = DP;
              const range = ConceptualModelInfo.DP_Range_mapping[DP];
              var_to_range_mapping[var_in_stmt] = range;
              DP_RANGE_LOCAL[DP] = range;
            }
          }

          // get PAB and its domain&range (2 linked classes)
          let PAB: string = '';
          if (
            ConceptualModelInfo.ObjectPropsList.some((pab: string) => {
              PAB = pab;
              // ! the space after the PAB is important to avoid matching PABs that are substrings of other PABs
              return sub_stmt_trim.includes(`${pab} `);
            })
          ) {
            // const PAB_split = sub_stmt_trim.split(PAB);
            const PAB_obj = ConceptualModelInfo.ObjectPropsMapping[PAB];
            // implicitly verifies PAB and its related classes are in the query
            const c1 = PAB_obj?.domain;
            const c2 = PAB_obj?.range;
            // TODO: this relationship bt PAB and classes should be checked, but currently no effective way, leave it for future work
            // if (CLASSES.includes(c1) && CLASSES.includes(c2)) {
            PAB_LIST.push(PAB);
            // }
          }
        }
      }
      // console.log('var_DP mapping: ', var_to_DPA_mapping);
      // console.log('var_range mapping: ', var_to_range_mapping);

      // console.log(`Classes CA found: `, CLASSES);
      // console.log(`DP and its Range TA found: `, DP_RANGE_LOCAL);

      for (const dp of Object.keys(DP_RANGE_LOCAL)) {
        let class_local = '';
        if (
          CLASSES.some((c: string) => {
            class_local = c;
            return DataPropertyDomain(dp, c);
          })
        ) {
          CLASS_DP_LOCAL[class_local] = dp;
        }
      }

      // !Recommendation rating algorithm here
      // first check number of Classes(C) and Ranges(T)
      // let c_num = 0;
      let t_num = 0;
      for (const v of vars_head) {
        // if (Object.keys(var_to_class).includes(v)) {
        //   c_num++;
        // }
        if (Object.keys(var_to_range_mapping).includes(v)) {
          t_num++;
        }
      }

      let c_num = CLASSES.length;

      let pab_num = PAB_LIST.length;
      console.log(
        `The query contains ${c_num} Cs, ${t_num} Ts, and ${pab_num} PABs`,
      );
      // ratings for 1 class with DPs:
      const ratings_1_class = generateRatingsFor1C(
        c_num,
        t_num,
        var_to_range_mapping,
      );
      const ratings_2_classes = generateratingsFor2C1PAB(
        c_num,
        t_num,
        pab_num,
        var_to_class,
        var_to_range_mapping,
      );

      const ratings_3_classes = generateRatingsFor3C(
        c_num,
        t_num,
        var_to_range_mapping,
      );

      ratings_recommendation = {
        ...ratings_recommendation,
        ...ratings_1_class,
        ...ratings_2_classes,
        ...ratings_3_classes,
      };
    }

    const recommendations: RecommendationProps[] = [];
    // TODO: complete recommendations to all catogories
    for (const r of Object.keys(ratings_recommendation)) {
      const rating = ratings_recommendation[r];
      if (rating > 0) {
        // @ts-ignore
        recommendations.push({ chart: ChartType_mapping[r], rating });
      }
    }

    // Final recommendation results:
    const result = recommendations.sort((a, b) => b.rating - a.rating);

    console.log('recommended vis: ', result);
    return result;
  }

  function toggleInferredDataQuery() {
    setInferredDataQuery(!inferredDataQuery);
  }

  const handleQuery = async () => {
    const repositoryID = repo_graphDB;

    try {
      setLoading(true);
      const queryRes = await sendSPARQLquery(
        repositoryID,
        query,
        inferredDataQuery,
      );

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
      console.error('Error', e.response?.data);
      setShowAlert(true);
      setAlertText(
        e.response?.data ||
          'Error: either missing content in the query or unknown syntax error, please check your query and try again.',
      );
    } finally {
      setRecommendations(generateVisRecommendation(query));
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
          <LoadingButton
            variant="contained"
            onClick={handleQuery}
            loading={loading}
            loadingPosition="end"
            // disabled={loading}
            endIcon={<SendIcon />}
            style={{ textTransform: 'none' }}
          >
            Execute Query
          </LoadingButton>
          {/* {loading && (
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
          )} */}
        </Grid>

        <Grid item xs={12}></Grid>

        {/* <Grid item xs> */}
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                defaultChecked
                value={inferredDataQuery}
                onClick={() => {
                  toggleInferredDataQuery();
                  handleQuery();
                }}
              />
            }
            label="Use inferred data?"
            labelPlacement="start"
          />
        </FormGroup>

        <Grid item xs={12}></Grid>

        <Grid item xs>
          <LoadingButton
            variant="contained"
            color={recommendations.length > 0 ? 'success' : 'primary'}
            disabled={dataSource.length == 0}
            loading={loading}
            loadingPosition="end"
            onClick={handleVisOpen}
            endIcon={<AutoGraphIcon />}
            style={{
              textTransform: 'none',
            }}
          >
            {recommendations.length > 0
              ? `Visualisation Options (${recommendations.length} Recommendations)`
              : `Visualisation Options`}
          </LoadingButton>
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
                recommendations={recommendations}
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
                  key={Date.now()}
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
