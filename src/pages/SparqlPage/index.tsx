import { CompletionContext, autocompletion } from '@codemirror/autocomplete';
import { StreamLanguage } from '@codemirror/language';
import { sparql } from '@codemirror/legacy-modes/mode/sparql';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SendIcon from '@mui/icons-material/Send';
import {
  Alert,
  AppBar,
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  Paper,
  Popover,
  Snackbar,
  Switch,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { DataGridPro } from '@mui/x-data-grid-pro';
import CodeMirror from '@uiw/react-codemirror';
import { forwardRef, useEffect, useState } from 'react';
import {
  ChartType_mapping,
  DATA_DIMENTION_TYPE,
  countryListAlpha2,
  prefix_mapping,
  ranges_type_mapping,
} from '../../utils';
import { sendSPARQLquery } from '../services/api';
import VisOptions, { ChartType } from './VisOptions';

import LoadingButton from '@mui/lab/LoadingButton';
import { deepClone } from '@mui/x-data-grid/utils/utils';
import { useSearchParams } from 'umi';
import { conceptualModelFunctions } from './ConceptualModel/function';
import {
  getClasses,
  getDatatypeProperties,
  getDomainMapping,
  getFunctionalProperties,
  getKeyFunctionalProperties,
  getObjectPropertiesList,
  getObjectPropertyMapping,
  getRangeMapping,
} from './ConceptualModel/service';
import { customIconsTheme, defaultAutocompletions } from './codeMirrorConfigs';

export interface VisDataProps {
  headers: string[];
  data: (number | string)[][];
}

export interface ConceptialModelInfoProps {
  DP_Range_mapping?: any;
  classesList?: string[];
  FunctionalPropsList?: string[];
  DatatypePropsList?: string[];
  ObjectPropsList?: string[];
  ObjectPropsMapping?: any;
  DP_domain_mapping?: any;
  DPKList?: string[];
}

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export interface RecommendationProps {
  chart: ChartType;
  rating: number;
  threshold?: number;
  keyToCardinalityMapping?: any;
  thresholdKey?: string;
}

function isJson(str: string) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function SparqlPage(props: any) {
  const { repo_graphDB, db_prefix_URL } = props;

  const initialString = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX : <http://www.semwebtech.org/mondial/10/meta#>
      
SELECT ?name ?population
WHERE {
  ?country rdf:type :Country ;
           :name ?name ;
           :population ?population .
} ORDER BY DESC(?population)`;

  const f3a = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX : <${db_prefix_URL}>
SELECT ?inflation ?unemployment WHERE {
    ?c rdf:type :Country ;
       :inflation ?inflation ;
       :unemployment ?unemployment .
}`;

  const f3b = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX : <${db_prefix_URL}>
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
SELECT  ?year  ?population ?country
WHERE {
    ?c rdf:type :Country ; 
       :name ?country ;
       :encompassedByInfo ?en .
    ?py rdf:type :PopulationCount ;
        :year ?year;
        :value ?population .
    ?c 	:hadPopulation ?py .
}`;

  const f3d = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX : <${db_prefix_URL}>
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

  const [searchParams, setSearchParams] = useSearchParams();
  const [ConceptualModelInfo, setConceptualModelInfo] =
    useState<ConceptialModelInfoProps>({});
  const [fullLoading, setFullLoading] = useState(false);
  const tabListStorageKey = 'tabList_graphLD';
  const tabListStore = localStorage.getItem(tabListStorageKey) || '';
  const [tabList, setTabList] = useState<string[]>(() => {
    if (isJson(tabListStore) && JSON.parse(tabListStore).length > 0) {
      const tabListParsed = JSON.parse(tabListStore);
      return tabListParsed;
    } else {
      return [initialString];
    }
  });
  const [selectedTab, setSelectedTab] = useState(() => {
    if (isJson(tabListStore) && JSON.parse(tabListStore).length > 0) {
      const tabListParsed = JSON.parse(tabListStore);
      return tabListParsed.length - 1;
    } else {
      return 0;
    }
  });
  const userQueryStorageKey = 'user_query_latest_graphLD';
  const user_query_latest = localStorage.getItem(userQueryStorageKey);
  const [query, setQuery] = useState<string>(() => {
    if (isJson(tabListStore) && JSON.parse(tabListStore).length > 0) {
      const tabListParsed = JSON.parse(tabListStore);
      return tabListParsed[tabListParsed.length - 1];
    } else {
      const toSet = JSON.stringify([initialString]);
      localStorage.setItem(tabListStorageKey, toSet);
      return initialString;
    }
  });

  const [columns, setColumns] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openVis, setOpenVisOption] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState<boolean>(false);
  const [showCopyUnderUnsafeOrigin, setShowCopyUnderUnsafeOrigin] =
    useState<boolean>(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertText, setAlertText] = useState('');

  const [inferredDataQuery, setInferredDataQuery] = useState<boolean>(true);

  const [recommendations, setRecommendations] = useState<RecommendationProps[]>(
    [],
  );
  const [excludedRecommendations, setExcludedRecommendations] = useState<
    RecommendationProps[]
  >([]);

  // states for recommendation configs
  const [recommendationConfig, setRecommendationConfig] = useState({
    column: 100,
    bar: 100,
    pie: 100,
    wordClouds: 1000,
    treemap: 100,
    hierarchyTree: 100,
    sunburst: 40,
    circlePacking: 40,
    // multiLine: 20,
    spider: 20,
    stackedColumn: 20,
    groupedColumn: 20,
    stackedBar: 20,
    groupedBar: 20,
    sankey: 100,
    chord: 100,
    network: 1000,
    heatmap: 100,
  });

  useEffect(() => {
    // initialise tabList
    const tabListStoreL = localStorage.getItem(tabListStorageKey) || '[]';
    if (JSON.parse(tabListStoreL).length === 0) {
      localStorage.setItem(tabListStorageKey, JSON.stringify([initialString]));
    }
  }, []);

  useEffect(() => {
    if (repo_graphDB && db_prefix_URL) {
      setFullLoading(true);
      initConceptualModelInfo(repo_graphDB, db_prefix_URL);
    }
  }, []);

  useEffect(() => {
    if (searchParams.get('query')) {
      setQuery(searchParams.get('query') || initialString);

      const repo = searchParams.get('repo_graphDB') || '';
      const prefix = searchParams.get('db_prefix_URL') || '';

      console.log('repo: ', repo);
      console.log('prefix: ', prefix);

      setFullLoading(true);
      initConceptualModelInfo(repo, prefix);
    }
  }, [searchParams]);

  async function initConceptualModelInfo(
    repo_graphDB: string,
    db_prefix_URL: string,
  ) {
    try {
      const conceptualModelInfo: any = {};
      setFullLoading(true);
      const DP_Range_mapping = await getRangeMapping(
        repo_graphDB,
        db_prefix_URL,
      );
      const classesList = await getClasses(repo_graphDB, db_prefix_URL);
      const FunctionalPropsList = await getFunctionalProperties(
        repo_graphDB,
        db_prefix_URL,
      );
      const DatatypePropsList = await getDatatypeProperties(
        repo_graphDB,
        db_prefix_URL,
      );
      const ObjectPropsList = await getObjectPropertiesList(
        repo_graphDB,
        db_prefix_URL,
      );
      const ObjectPropsMapping = await getObjectPropertyMapping(
        repo_graphDB,
        db_prefix_URL,
      );
      const DP_domain_mapping = await getDomainMapping(
        repo_graphDB,
        db_prefix_URL,
      );
      const DPKList = await getKeyFunctionalProperties(
        repo_graphDB,
        db_prefix_URL,
      );

      conceptualModelInfo['DP_Range_mapping'] = DP_Range_mapping;
      conceptualModelInfo['classesList'] = classesList;
      conceptualModelInfo['FunctionalPropsList'] = FunctionalPropsList;
      conceptualModelInfo['DatatypePropsList'] = DatatypePropsList;
      conceptualModelInfo['ObjectPropsList'] = ObjectPropsList;
      conceptualModelInfo['ObjectPropsMapping'] = ObjectPropsMapping;
      conceptualModelInfo['DP_domain_mapping'] = DP_domain_mapping;
      conceptualModelInfo['DPKList'] = DPKList;
      console.log('conceptualModelInfo: ', conceptualModelInfo);

      setConceptualModelInfo(conceptualModelInfo);
    } catch (error) {
      console.log(error);
    } finally {
      setFullLoading(false);
    }
  }

  const functions_conceptualModel =
    conceptualModelFunctions(ConceptualModelInfo);

  const handleVisOpen = () => {
    setOpenVisOption(true);
  };

  const handleVisClose = () => {
    setOpenVisOption(false);
  };

  function generateVisRecommendation(
    user_query: string,
    dataResults: any[] = [],
  ): {
    recommendations: RecommendationProps[];
    excludedRecommendations: RecommendationProps[];
  } {
    const messages: string[] = [];
    const CLASSES: string[] = [];
    const DP_RANGE_LOCAL: any = {};
    const var_to_class: any = {};
    const var_to_range_mapping: any = {};
    const keyVar_cardinality_mapping: any = {};
    const potential_key_var_DP_map: any = {};

    // ratings dictionary:
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
      // === STEP 1 analysis to the query head, to find the variables. ===

      // regex to match variables in the query. old version, not supported by
      // Safari so replaced for now.
      // const regex_vars = /(?<!rdf)(?:\?)[a-zA-Z_][a-zA-Z0-9_]*/gm;

      // regex to match variables in the query.
      const regex_vars = /\?[a-zA-Z_][a-zA-Z0-9_]*/gm;
      // match variables in the query head (text before 'WHERE').
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
      console.log('step1 matches head', vars_head);

      // split the query body by '.' (parent statements) and ';'(children statements)
      const parent_statements = user_query_body.split('.');

      const PAB_LIST: any = {};
      const CA_DPA_mapping: any = {};
      const CA_PAB_mapping: any = {};
      for (const stmt of parent_statements) {
        const children_stmt = stmt.split(';');
        let class_type = '';
        for (const sub_stmt of children_stmt) {
          const sub_stmt_trim = sub_stmt.trim();

          // === STEP 2 analysis to the query body, to find the classes ===
          // console.log('statements, ', sub_stmt_trim);
          if (sub_stmt_trim.includes('rdf:type')) {
            const type_split = sub_stmt_trim.split('rdf:type');
            const variable = type_split[0].split('?')[1].trim();
            if (variable && variable.length > 0) {
              class_type = type_split[1].trim();
              var_to_class[variable] = class_type;
              CLASSES.push(class_type);
              CA_DPA_mapping[class_type] = [];
              CA_PAB_mapping[class_type] = [];
            }
          }

          // === STEP 3 analysis to the query body, to find the
          // dataProperty and ranges, and map them to the variables. ===
          // get DP and range
          let DP: string = '';
          if (
            ConceptualModelInfo.DatatypePropsList?.some((dp: string) => {
              DP = dp;
              return sub_stmt_trim.includes(dp);
            }) ||
            ConceptualModelInfo.FunctionalPropsList?.some((dp: string) => {
              DP = dp;
              return sub_stmt_trim.includes(dp);
            }) ||
            ConceptualModelInfo.DPKList?.some((dp: string) => {
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
              CA_DPA_mapping[class_type]?.push(DP);
              if (
                ranges_type_mapping(range) === DATA_DIMENTION_TYPE.LEXICAL ||
                ranges_type_mapping(range) === DATA_DIMENTION_TYPE.DISCRETE
              ) {
                if (vars_head.includes(var_in_stmt)) {
                  potential_key_var_DP_map[var_in_stmt] = DP;
                }
              }
            }
          }

          // === STEP 4 get PAB and its domain&range (2 linked classes) ===
          let PAB: string = '';
          if (
            ConceptualModelInfo.ObjectPropsList?.some((pab: string) => {
              PAB = pab;
              // ! the space after the PAB below
              // ! is important to avoid matching PABs that are substrings of other PABs
              return sub_stmt_trim.includes(`${pab} `);
            })
          ) {
            // const PAB_split = sub_stmt_trim.split(PAB);
            const PAB_obj = ConceptualModelInfo.ObjectPropsMapping[PAB];
            // implicitly verifies PAB and its related classes are in the query
            const c1 = PAB_obj?.domain;
            const c2 = PAB_obj?.range;
            // TODO: this relationship bt PAB and classes should be checked,
            // but currently no effective way, leave it for future work

            // if (CLASSES.includes(c1) && CLASSES.includes(c2)) {
            PAB_LIST[PAB] = {
              domain: c1,
              range: c2,
            };
            // }
            CA_PAB_mapping[class_type]?.push(PAB);
          }
        }
      }

      const noKeyWarning =
        !vars_head.some((v: string) => {
          return Object.keys(var_to_class).includes(v);
        }) && Object.keys(potential_key_var_DP_map).length === 0;
      setShowMissingKeyWarning(noKeyWarning);

      console.log('step2 Classes CA found: ', CLASSES);
      console.log('step2 var_to_class: ', var_to_class);

      console.log('step3 var_range mapping: ', var_to_range_mapping);
      console.log(`DP and its Range TA found: `, DP_RANGE_LOCAL);
      console.log('step3 CA_DPA mapping found: ', CA_DPA_mapping);
      console.log('step3 potential key DP found: ', potential_key_var_DP_map);

      console.log('step4 PAB found: ', PAB_LIST);
      console.log('step4 CA_PAB mapping found: ', CA_PAB_mapping);

      // !Recommendation rating algorithm here this one is based on analysing
      // the query head and link to query content and data results.

      let total_class_num = CLASSES.length;
      const total_PAB_num = Object.keys(PAB_LIST).length;
      const query_head_count = vars_head.length;
      let nonKey_var_count = query_head_count;
      let key_var_count = 0;

      // key variables are the variables who is classes, or whose ranges are lexical
      // ! constains variables in query body !
      const key_var_list: string[] = [
        ...Object.keys(potential_key_var_DP_map),
        ...Object.keys(var_to_class),
      ];
      const nonKey_var_list: string[] = vars_head.filter((v) => {
        return (
          !key_var_list.includes(v) && !Object.keys(var_to_class).includes(v)
        );
      });
      console.log('key_var_list: ', key_var_list);
      console.log('nonKey_var_list: ', nonKey_var_list);

      // ! cannot use the length of key_var_list to determine the number of key variables
      // ! because that includes vars in query body.
      // this means the query head contains variables whose ranges are lexical (so potential keys)
      if (Object.keys(potential_key_var_DP_map).length > 0) {
        nonKey_var_count -= Object.keys(potential_key_var_DP_map).length;
        key_var_count += Object.keys(potential_key_var_DP_map).length;
      }
      // this means the query head contains variables whose type are classes
      if (
        vars_head.some((v: string) => {
          return Object.keys(var_to_class).includes(v);
        })
      ) {
        nonKey_var_count -= Object.keys(var_to_class).length;
        key_var_count += Object.keys(var_to_class).length;
      }
      console.log('nonKey_var_count: ', nonKey_var_count);
      console.log('key_var_count: ', key_var_count);

      const ratings_1_class =
        total_class_num === 1
          ? generateRatingsFor1C(
              dataResults,
              key_var_count,
              nonKey_var_count,
              nonKey_var_list,
              var_to_range_mapping,
              messages,
            )
          : {};

      const hasKeyFunctionalProperty = Object.keys(DP_RANGE_LOCAL).some(
        (dp) => {
          return ConceptualModelInfo.DPKList?.includes(dp);
        },
      );

      const ratings_2_class_1PAB =
        total_class_num === 2 &&
        total_PAB_num === 1 &&
        !hasKeyFunctionalProperty
          ? generateRatingsFor2C1PAB(
              dataResults,
              key_var_count,
              nonKey_var_count,
              nonKey_var_list,
              var_to_range_mapping,
              vars_head,
              messages,
            )
          : {};

      const ratings_2_class_1DP =
        total_class_num === 2 && hasKeyFunctionalProperty
          ? generateRatingsFor2C1DP(
              dataResults,
              key_var_count,
              nonKey_var_count,
              key_var_list,
              nonKey_var_list,
              var_to_range_mapping,
              vars_head,
              messages,
            )
          : {};

      const ratings_3_class =
        total_class_num === 3
          ? generateRatingsFor3C(
              dataResults,
              key_var_count,
              nonKey_var_count,
              key_var_list,
              nonKey_var_list,
              var_to_range_mapping,
              messages,
            )
          : {};

      // alternatively, level-2 recommendation can be generated by checking
      // the variables in header:
      let ratings_1_class_l2 = {};
      const var_total = vars_head.length;
      const var_class = Object.keys(var_to_class).length;
      if (
        var_total == 2 &&
        (var_class == 1 ||
          Object.values(var_to_range_mapping).some((v: any) => {
            return ranges_type_mapping(v) == DATA_DIMENTION_TYPE.LEXICAL;
          })) &&
        Object.values(var_to_range_mapping).some((v: any) => {
          return ranges_type_mapping(v) == DATA_DIMENTION_TYPE.SCALAR;
        })
      ) {
        ratings_1_class_l2 = generateRatingsFor1C(
          dataResults,
          key_var_count,
          nonKey_var_count,
          nonKey_var_list,
          var_to_range_mapping,
          messages,
        );
      }

      let total_class_num_l2 = total_class_num;
      let key_var_count_l2 = key_var_count;
      let nonKey_var_count_l2 = nonKey_var_count;
      // level-2 recommendations for 2class 1PAB:
      if (Object.keys(PAB_LIST).length === 1 && total_class_num !== 2) {
        const c1 = CLASSES[0];
        if (PAB_LIST[Object.keys(PAB_LIST)[0]].domain === c1) {
          let difference_true_class = 2 - total_class_num;
          total_class_num_l2 += difference_true_class;
          key_var_count_l2 += difference_true_class;
          nonKey_var_count_l2 -= difference_true_class;
        }
      }
      const ratings_2_class_1PAB_l2 =
        total_class_num_l2 === 2 &&
        total_PAB_num === 1 &&
        !hasKeyFunctionalProperty
          ? generateRatingsFor2C1PAB(
              dataResults,
              key_var_count_l2,
              nonKey_var_count_l2,
              nonKey_var_list,
              var_to_range_mapping,
              vars_head,
              messages,
            )
          : {};

      ratings_recommendation = {
        ...ratings_recommendation,
        ...ratings_1_class,
        ...ratings_2_class_1PAB,
        ...ratings_2_class_1DP,
        ...ratings_3_class,
        ...ratings_1_class_l2,
        ...ratings_2_class_1PAB_l2,
      };

      // if rating valid in 3-class pattern, cancel the relation warning.
      const valuesOf3C = Object.values(ratings_3_class) as number[];
      const maxRating = Math.max(...(valuesOf3C || [0]));
      if (maxRating > 0) {
        setShowManyManyRelationWarning(false);
      }

      if (dataResults.length > 0) {
        const row = dataResults[0];
        const keyColumns = Object.keys(potential_key_var_DP_map);

        const counts_instances = {};
        for (const key of keyColumns) {
          const subcounts = {};
          dataResults.forEach(function (row) {
            const value = row[key];
            // @ts-ignore
            subcounts[value] = (subcounts[value] || 0) + 1;
            // @ts-ignore
            counts_instances[key] = subcounts;
          });
          // @ts-ignore
          const cardinalityKey = Object.keys(counts_instances[key]).length;

          keyVar_cardinality_mapping[key] = cardinalityKey;
        }
      }
    }

    // Start to filter out the recommendations with threshold in
    // recommendation configuration:
    for (const r of Object.keys(ratings_recommendation)) {
      const rating = ratings_recommendation[r];
      if (rating === 0) {
        delete ratings_recommendation[r];
      }
    }
    console.log('final ratings_recommendation: ', ratings_recommendation);

    const excludedRatings: any = {};

    let exceedThreshold = false;

    console.log('keyVar_cardinality_mapping: ', keyVar_cardinality_mapping);
    let thresholdKey = 'unknown';
    for (const r of Object.keys(ratings_recommendation)) {
      // @ts-ignore
      const threshold = recommendationConfig[r];
      const actuallSize = Math.max(
        // @ts-ignore
        ...Object.values(keyVar_cardinality_mapping),
      );

      for (const key of Object.keys(keyVar_cardinality_mapping)) {
        if (keyVar_cardinality_mapping[key] === actuallSize) {
          thresholdKey = key;
          break;
        }
      }

      if (threshold && actuallSize > threshold) {
        exceedThreshold = true;
        excludedRatings[r] = deepClone(ratings_recommendation[r]);
        delete ratings_recommendation[r];
      }
    }
    setShowTooMuchDataWarning(exceedThreshold);

    const recommendations: RecommendationProps[] = [];
    const excludedRecommendations: RecommendationProps[] = [];
    // TODO: complete recommendations to all catogories
    for (const r of Object.keys(ratings_recommendation)) {
      const rating = ratings_recommendation[r];
      if (rating > 0) {
        // @ts-ignore
        recommendations.push({ chart: ChartType_mapping[r], rating });
      }
    }
    for (const r of Object.keys(excludedRatings)) {
      const rating = excludedRatings[r];
      if (rating > 0) {
        excludedRecommendations.push({
          // @ts-ignore
          chart: ChartType_mapping[r],
          rating,
          // @ts-ignore
          threshold: recommendationConfig[r],
          keyToCardinalityMapping: keyVar_cardinality_mapping,
          thresholdKey,
        });
      }
    }

    // Final recommendation results:
    const result = {
      recommendations: recommendations.sort((a, b) => b.rating - a.rating),
      excludedRecommendations: excludedRecommendations.sort(
        (a, b) => b.rating - a.rating,
      ),
    };

    console.log('recommended vis: ', result);
    return result;
  }

  function checkForManyManyRelationships(
    vars_head: string[],
    var_to_range_mapping: any,
    dataResults: any[],
  ) {
    // check for posibble many-many relations:
    // by counting the number of unique values in the inferred key variables (lexical range)
    const key_var_head: string[] = vars_head.filter((v) => {
      const range = var_to_range_mapping[v];
      return ranges_type_mapping(range) === DATA_DIMENTION_TYPE.LEXICAL;
    });
    const instance_stats: any = {};
    key_var_head.forEach((column: string) => {
      instance_stats[column] = {};
    });

    dataResults.forEach((row: any, index) => {
      key_var_head.forEach((column: string) => {
        const data = row[column];
        if (instance_stats[column][data]) {
          instance_stats[column][data] += 1;
        } else {
          instance_stats[column][data] = 1;
        }
      });
    });
    const key_var_head_atleast2instances = key_var_head.filter((column) => {
      const instances_counts_dict = instance_stats[column];
      return Object.values(instances_counts_dict).some(
        (count: any) => count > 1,
      );
    });
    if (key_var_head_atleast2instances.length > 1) {
      setShowManyManyRelationWarning(true);
    }
  }

  function generateRatingsFor1C(
    dataResults: any[],
    key_var_count: number,
    nonKey_var_count: number,
    nonKey_var_list: string[],
    var_to_range_mapping: any,
    messages: string[],
  ) {
    const ratings = {
      scatter: 0,
      bubble: 0,
      bar: 0,
      column: 0,
      line: 0,
      wordClouds: 0,
      calendar: 0,
      pie: 0,
      choroplethMap: 0,
    };

    let findCountryNames = false;
    for (const row of dataResults) {
      const values = Object.values(row);
      if (
        Object.keys(countryListAlpha2).some((code) => values.includes(code)) ||
        Object.values(countryListAlpha2).some((code) => values.includes(code))
      ) {
        findCountryNames = true;
        console.log('Found geograohical values in the data');
      }
    }

    if (key_var_count >= 1 && nonKey_var_count === 1) {
      const nonKey_var = nonKey_var_list[0];
      const nonKey_var_range = var_to_range_mapping[nonKey_var];
      if (
        ranges_type_mapping(nonKey_var_range) === DATA_DIMENTION_TYPE.SCALAR
      ) {
        if (findCountryNames) {
          ratings.choroplethMap += 110;
        }

        ratings.bar += 100;
        ratings.column += 110;
        ratings.pie += 100;
        ratings.wordClouds = 100;
      }
    }

    // for calendar chart, one of the variables must have a temporal range
    if (nonKey_var_count >= 1 && key_var_count <= 1) {
      if (
        nonKey_var_list.some((v: any) => {
          const range = var_to_range_mapping[v];
          const range_type = ranges_type_mapping(range);
          return range_type === DATA_DIMENTION_TYPE.TEMPORAL;
        })
      ) {
        ratings.calendar += 80;
      }
    }

    if (nonKey_var_count === 2) {
      let allScalar = true;

      if (
        nonKey_var_list.some((v: string) => {
          const range = var_to_range_mapping[v];
          if (ranges_type_mapping(range) !== DATA_DIMENTION_TYPE.SCALAR) {
            return true;
          }
        })
      ) {
        allScalar = false;
      }
      ratings.scatter += allScalar ? 100 : 0;
    }

    if (nonKey_var_count === 3) {
      let allScalar = true;

      if (
        nonKey_var_list.some((v: string) => {
          const range = var_to_range_mapping[v];
          if (ranges_type_mapping(range) !== DATA_DIMENTION_TYPE.SCALAR) {
            return true;
          }
        })
      ) {
        allScalar = false;
      }
      ratings.scatter += allScalar ? 50 : 0;
      ratings.bubble += allScalar ? 100 : 0;
    }
    return ratings;
  }

  function generateRatingsFor2C1PAB(
    dataResults: any[],
    key_var_count: number,
    nonKey_var_count: number,
    nonKey_var_list: string[],
    var_to_range_mapping: any,
    vars_head: string[],
    messages: string[],
  ) {
    const ratings: any = {
      treemap: 0,
      hierarchyTree: 0,
      sunburst: 0,
      circlePacking: 0,
    };
    // if key var is explicitly specified as classes or lexical value
    if (key_var_count === 2 && nonKey_var_count === 1) {
      if (
        nonKey_var_list.some((v: string) => {
          const range = var_to_range_mapping[v];
          return ranges_type_mapping(range) === DATA_DIMENTION_TYPE.SCALAR;
        })
      ) {
        ratings.treemap += 100;
        ratings.sunburst += 100;
        ratings.circlePacking += 80;
      }
    }

    if (key_var_count == 2) {
      ratings.hierarchyTree += 100;
    }

    checkForManyManyRelationships(vars_head, var_to_range_mapping, dataResults);

    return ratings;
  }

  function generateRatingsFor2C1DP(
    dataResults: any[],
    key_var_count: number,
    nonKey_var_count: number,
    key_var_list: string[],
    nonKey_var_list: string[],
    var_to_range_mapping: any,
    vars_head: string[],
    messages: string[],
  ) {
    const ratings: any = {
      multiLine: 0,
      spider: 0,
      stackedBar: 0,
      groupedBar: 0,
      stackedColumn: 0,
      groupedColumn: 0,
    };
    if (key_var_count == 2 && nonKey_var_count === 1) {
      if (
        // scalar exists in the key variables and non-key variables
        nonKey_var_list.some((v: string) => {
          const range = var_to_range_mapping[v];
          return ranges_type_mapping(range) === DATA_DIMENTION_TYPE.SCALAR;
        }) &&
        key_var_list.some((v: string) => {
          const range = var_to_range_mapping[v];
          return (
            ranges_type_mapping(range) === DATA_DIMENTION_TYPE.SCALAR ||
            ranges_type_mapping(range) === DATA_DIMENTION_TYPE.DISCRETE
          );
        })
      ) {
        ratings.multiLine += 100;
        ratings.stackedBar += 100;
        ratings.groupedBar += 100;
        ratings.stackedColumn += 110;
        ratings.groupedColumn += 110;
      }

      if (
        // scalar exists in the key variables and non-key variables
        nonKey_var_list.some((v: string) => {
          const range = var_to_range_mapping[v];
          return ranges_type_mapping(range) === DATA_DIMENTION_TYPE.SCALAR;
        })
      ) {
        ratings.spider += 100;
        ratings.stackedBar += 100;
        ratings.groupedBar += 100;
        ratings.stackedColumn += 110;
        ratings.groupedColumn += 110;
      }

      ratings.multiLine += 20;
      ratings.stackedBar += 10;
      ratings.groupedBar += 10;
      ratings.stackedColumn += 15;
      ratings.groupedColumn += 15;
    }

    checkForManyManyRelationships(vars_head, var_to_range_mapping, dataResults);

    return ratings;
  }

  function generateRatingsFor3C(
    dataResults: any[],
    key_var_count: number,
    nonKey_var_count: number,
    key_var_list: string[],
    nonKey_var_list: string[],
    var_to_range_mapping: any,
    messages: string[],
  ) {
    const ratings: any = {
      chord: 0,
      sankey: 0,
      network: 0,
      heatmap: 0,
    };
    if (key_var_count == 2 && nonKey_var_count === 1) {
      if (
        // scalar exists in the key variables and non-key variables
        nonKey_var_list.some((v: string) => {
          const range = var_to_range_mapping[v];
          return ranges_type_mapping(range) === DATA_DIMENTION_TYPE.SCALAR;
        })
      ) {
        ratings.sankey += 100;
        ratings.chord += 100;
        ratings.heatmap += 100;
        ratings.network += 100;
      }
    }

    if (key_var_count == 2 && nonKey_var_count === 0) {
      if (
        // scalar exists in the key variables and non-key variables
        nonKey_var_list.some((v: string) => {
          const range = var_to_range_mapping[v];
          return ranges_type_mapping(range) === DATA_DIMENTION_TYPE.SCALAR;
        })
      ) {
        ratings.chord += 100;
        ratings.network += 100;
      }
    }

    return ratings;
  }

  const [showMissingKeyWarning, setShowMissingKeyWarning] = useState(false);
  const [showTooMuchDataWarning, setShowTooMuchDataWarning] = useState(false);
  const [showManyManyRelationWarning, setShowManyManyRelationWarning] =
    useState(false);

  function closeAllWarnings() {
    setShowMissingKeyWarning(false);
    setShowTooMuchDataWarning(false);
    setShowManyManyRelationWarning(false);
  }

  function toggleInferredDataQuery() {
    setInferredDataQuery(!inferredDataQuery);
  }

  const handleQuery = async (query: string) => {
    const repositoryID = repo_graphDB || searchParams.get('repo_graphDB');

    closeAllWarnings();
    try {
      setLoading(true);
      const queryRes = await sendSPARQLquery(
        repositoryID,
        query,
        inferredDataQuery,
      );

      // console.log('original queryRes', queryRes);

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

      // console.log('remapped data', data);
      const recommendations = generateVisRecommendation(query, data);
      setRecommendations(recommendations.recommendations);
      setExcludedRecommendations(recommendations.excludedRecommendations);
      setDataSource(data);
      setShowAlert(false);
      return recommendations;
    } catch (e: any) {
      console.error('Error', e.response?.data);
      setShowAlert(true);
      setAlertText(
        e.response?.data ||
          'Error: either missing content in the query or unknown syntax error, please check your query and try again.',
      );
    } finally {
      setLoading(false);
    }
    return null;
  };

  function separateHeader_Data(dataSource: any[]): VisDataProps {
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
    // console.log('preprocessed data for Google Charts: ', { headers, data });
    return { headers, data };
  }

  // below are code for the auto-completion feature
  const [completionsContent, setCompletionsContent] = useState<any[]>(
    defaultAutocompletions,
  );

  const onChangeCodeArea = (value: string, viewUpdate: any) => {
    const splitUpper = value.split('WHERE');
    const splitLower = value.split('where');
    if (splitUpper.length == 2 || splitLower.length == 2) {
      const varsDirty = splitUpper.length == 2 ? splitUpper[0] : splitLower[0];
      const varsClean =
        varsDirty.split('SELECT').length == 2
          ? varsDirty.split('SELECT')[1]
          : varsDirty.split('select')[1];
      const varsList = varsClean
        ? varsClean.split(' ').filter((v: string) => v.length > 0)
        : [];

      if (varsList.length > 0) {
        const varsAutocompletion = varsList.map((v: string) => {
          return {
            label: v,
            type: 'variable',
          };
        });
        setCompletionsContent([...completionsContent, ...varsAutocompletion]);
      }
    }

    const newTabList = localStorage.getItem(tabListStorageKey);
    const tabListParsed = JSON.parse(newTabList || '[]');
    tabListParsed[selectedTab] = value;

    setTabList(tabListParsed);
    setQuery(value);
  };

  useEffect(() => {
    localStorage.setItem(tabListStorageKey, JSON.stringify(tabList));
  }, [tabList, selectedTab]);

  function closeTab(index: number) {
    if (tabList.length > 1) {
      const newTabList = tabList.filter((_, i) => i !== index);
      setTabList(newTabList);
      setSelectedTab(selectedTab - 1);
      setQuery(newTabList[selectedTab - 1]);
    }
  }

  // side effects for generating autocompletions content
  useEffect(() => {
    // generate completions for Functional Data Properties
    const completions = [];
    if (
      ConceptualModelInfo.FunctionalPropsList &&
      ConceptualModelInfo.DP_domain_mapping
    ) {
      // Functional Data Properties
      const DP_list = ConceptualModelInfo.FunctionalPropsList;
      const completions_DP = DP_list.map((dp: string) => {
        // !this handles the case when DP's domain is a collection (unhandled limitation in SPARQL handling collections)
        const domains = ConceptualModelInfo.DP_domain_mapping[dp]
          ? ConceptualModelInfo.DP_domain_mapping[dp]
          : 'unknown';
        return {
          label: dp,
          type: 'property',
          info: `owl:FunctionalProperty of domain ${domains}`,
        };
      });

      // Object Properties
      const PAB_list = ConceptualModelInfo.ObjectPropsList as string[];
      const completions_PAB = PAB_list.map((pab: string) => {
        return {
          label: pab,
          type: 'property',
          info: 'owl:ObjectProperty',
        };
      });

      completions.push(...completions_DP, ...completions_PAB);
    }

    // generate completions for Classes
    if (ConceptualModelInfo.classesList) {
      const classList = ConceptualModelInfo.classesList;

      const completions_Class = classList.map((c: string) => {
        return {
          label: c,
          type: 'class',
          detail: 'owl:Class',
        };
      });
      completions.push(...completions_Class);
    }

    setCompletionsContent([...completionsContent, ...completions]);
  }, [ConceptualModelInfo, query]);

  function myCompletions(context: CompletionContext) {
    let before = context.matchBefore(/(\:|\?|\w)+/);
    // If completion wasn't explicitly started and there
    // is no word before the cursor, don't open completions.
    if (!context.explicit && !before) return null;
    return {
      from: before ? before.from : context.pos,
      options: completionsContent,
      validFor: /^\w*$/,
    };
  }

  const handleCopyPrefixesReference = () => {
    const prefixes = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX : <${db_prefix_URL}>`;
    if (window.isSecureContext && navigator.clipboard) {
      navigator.clipboard
        .writeText(prefixes)
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

  const exampleQueryList = [initialString, f3a, f3b, f3c, f3d];
  const exampleQueryFeatures = [
    'Countries with their population count',
    'Countries with their inflation rate and unemployment rate, key missing in query header',
    'Countries with their continent and population count',
    'Historical population statictics through time',
    'Countries with neighbouring countries and border length',
  ];

  function exampleQueries() {
    return (
      <Grid sx={{ marginBottom: 2 }}>
        Example querys:
        {exampleQueryList.map((q, index) => {
          return (
            <Tooltip
              title={exampleQueryFeatures[index]}
              arrow
              placement="bottom"
            >
              <Button
                variant="outlined"
                size="small"
                color={query == q ? 'success' : 'primary'}
                onClick={() => {
                  const newTabList = localStorage.getItem(tabListStorageKey);
                  const tabListParsed = JSON.parse(newTabList || '[]');
                  tabListParsed[selectedTab] = q;
                  setTabList(tabListParsed);
                  setQuery(q);
                  setDataSource([]);
                  setRecommendations([]);
                  setExcludedRecommendations([]);
                  closeAllWarnings();
                }}
                style={{
                  textTransform: 'none',
                  marginLeft: 4,
                }}
              >
                query {index + 1}
              </Button>
            </Tooltip>
          );
        })}
      </Grid>
    );
  }
  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    const newQuery = tabList[newValue];
    setQuery(newQuery);
    setSelectedTab(newValue);
  };

  function editorTabs() {
    return (
      <Grid
        container
        flexDirection="row"
        justifyContent="flex-end"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Grid xs={12}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ backgroundColor: '#fff' }}
          >
            {tabList.length > 0 ? (
              tabList.map((_: any, index: number) => {
                return (
                  <Tab
                    sx={{ textTransform: 'none' }}
                    value={index}
                    label={`Tab ${index + 1}`}
                    {...a11yProps(0)}
                  />
                );
              })
            ) : (
              <Tab label={`Tab 1`} {...a11yProps(0)} />
            )}
            <IconButton
              color="primary"
              size="large"
              onClick={() => {
                const newQuery = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX : <${db_prefix_URL}>`;
                setTabList([...tabList, newQuery]);
                setQuery(newQuery);
                setSelectedTab(tabList.length);
              }}
            >
              <AddCircleOutlineIcon />
            </IconButton>
          </Tabs>
        </Grid>
        <Grid id="closeTabButton">
          <Button
            variant="outlined"
            color="error"
            sx={{
              textTransform: 'none',
              backgroundColor: '#fff',
              '&:hover': {
                color: '#fff',
                backgroundColor: '#d32f2f',
              },
            }}
            size="small"
            endIcon={<CloseIcon />}
            onClick={() => closeTab(selectedTab)}
            disabled={tabList.length <= 1}
          >
            Close this Tab
          </Button>
        </Grid>
      </Grid>
    );
  }

  function PrefixReference() {
    return (
      <Grid sx={{ marginBottom: 3, maxWidth: 500 }}>
        <Button
          variant="outlined"
          color="success"
          aria-describedby={id_prefixRef}
          onClick={(event) => {
            setAnchorEl(event.currentTarget);
            setShowPrefixReference(!showPrefixReference);
          }}
          sx={{
            textTransform: 'none',
            '&:hover': {
              color: '#fff',
              backgroundColor: '#2e7d32',
            },
          }}
        >
          {showPrefixReference
            ? 'Close Prefix Reference'
            : 'Open Prefix Reference'}
        </Button>
        <Popover
          id={id_prefixRef}
          open={showPrefixReference}
          anchorEl={anchorEl}
          onClose={() => {
            setAnchorEl(null);
            setShowPrefixReference(false);
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6" component="div">
              Quick Reference to Prefixes
            </Typography>
            <Grid
              sx={{
                padding: 1,
                borderRadius: 2,
                ':hover': { backgroundColor: '#1976d233' },
                ':active': { backgroundColor: '#1976d266' },
                cursor: 'pointer',
              }}
              onClick={handleCopyPrefixesReference}
            >
              <Typography variant="subtitle2" component="div">
                {`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>`}
              </Typography>
              <Typography variant="subtitle2" component="div">
                {`PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>`}
              </Typography>
              <Typography variant="subtitle2" component="div">
                {`PREFIX owl: <http://www.w3.org/2002/07/owl#>`}
              </Typography>
              <Typography variant="subtitle2" component="div" color={'#22cc22'}>
                {`PREFIX : <${db_prefix_URL}>`}
              </Typography>
            </Grid>

            <Button
              variant="text"
              size="small"
              endIcon={<ContentCopyIcon />}
              onClick={handleCopyPrefixesReference}
              aria-describedby={'copySuccess'}
              style={{
                textTransform: 'none',
              }}
            >
              Click to copy
            </Button>
          </Paper>
        </Popover>
      </Grid>
    );
  }

  const keyboardShortcutList = [
    {
      key: '[Ctrl|Cmd]-z',
      description: 'Undo',
    },
    {
      key: '[Ctrl|Cmd]-shift-z',
      description: 'Redo',
    },
    {
      key: '[Ctrl|Cmd]-u',
      description: 'Undo',
    },
    {
      key: '[Ctrl|Cmd]-f',
      description: 'Find/Relpace',
    },
    {
      key: '[Ctrl|Cmd]-d',
      description: 'Delete current/selected line(s)',
    },
    {
      key: '[Ctrl|Cmd]-x',
      description: 'Cut current/selected line(s)',
    },
    {
      key: '[Ctrl|Cmd]-c',
      description: 'Copy current/selected line(s)',
    },
    {
      key: '[Ctrl|Cmd]-v',
      description: 'Paste',
    },
  ];

  function KeyboardShortcut() {
    return (
      <Grid sx={{ marginBottom: 3, marginLeft: 3, maxWidth: 500 }}>
        <Button
          variant="outlined"
          color="success"
          aria-describedby={id_sc}
          onClick={(event) => {
            setAnchorElSc(event.currentTarget);
            setShowShortcut(!showShortcut);
          }}
          sx={{
            textTransform: 'none',
            '&:hover': {
              color: '#fff',
              backgroundColor: '#2e7d32',
            },
          }}
        >
          {showShortcut ? 'Close Keyboard Shortcut' : 'Open Keyboard Shortcut'}
        </Button>
        <Popover
          id={id_sc}
          open={showShortcut}
          anchorEl={anchorElSc}
          onClose={() => {
            setAnchorElSc(null);
            setShowShortcut(false);
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6" component="div">
              Keyboard Shortcut
            </Typography>
            <Grid
              sx={{
                padding: 1,
              }}
            >
              {keyboardShortcutList.map((item) => {
                return (
                  <Grid container style={{ padding: 5 }}>
                    <Grid
                      style={{
                        fontFamily: 'monospace',
                        borderRadius: 4,
                        color: '#fff',
                        backgroundColor: '#333',
                        padding: '0 6px 0 6px',
                      }}
                    >
                      {item.key}
                    </Grid>
                    <Grid style={{ padding: '0 6px 0 6px' }}>
                      {item.description}
                    </Grid>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Popover>
      </Grid>
    );
  }

  function missingKeyWarning() {
    return (
      <Alert
        sx={{
          display: showMissingKeyWarning ? 'flex' : 'none',
          width: '100%',
        }}
        severity="warning"
        onClose={() => setShowMissingKeyWarning(false)}
      >
        Key is missing in your query, this may affect your data visualisation
        please consider adding one
      </Alert>
    );
  }

  function tooMuchDataForVisWarning() {
    return (
      <Alert
        sx={{
          display: showTooMuchDataWarning ? 'flex' : 'none',
          width: '100%',
        }}
        severity="warning"
        onClose={() => setShowTooMuchDataWarning(false)}
      >
        The cardinality of your result seems to exceed the configured threshold,
        some affected visualisation have been removed from recommendation.
        Please consider applying a FILTER after your query.
      </Alert>
    );
  }
  function manyManyRelationshipWarning() {
    return (
      <Alert
        sx={{
          display: showManyManyRelationWarning ? 'flex' : 'none',
          width: '100%',
        }}
        severity="warning"
        onClose={() => setShowManyManyRelationWarning(false)}
      >
        Your query result contains many-many relationships, this may result in
        incorrect visualisation. Please consider applying a filter in your query
        to remove possible overlaps in datasets.
      </Alert>
    );
  }

  function visOptionPanel() {
    return (
      <Grid item>
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
              <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                Choose your visualisation
              </Typography>
              <Button autoFocus color="inherit" onClick={handleVisClose}>
                close
              </Button>
            </Toolbar>
          </AppBar>
          <DialogContent>
            <VisOptions
              data={separateHeader_Data(dataSource)}
              originalData={dataSource}
              recommendations={recommendations}
              excludedRecommendations={excludedRecommendations}
            />
          </DialogContent>
        </Dialog>
      </Grid>
    );
  }

  const [showConfigPanel, setShowConfigPanel] = useState(false);

  function handleCloseConfigPanel() {
    handleQuery(query);
    setShowConfigPanel(false);
  }

  function RecommendatoinConfigPanel() {
    return (
      <Grid item>
        <Button
          variant="outlined"
          sx={{ textTransform: 'none' }}
          onClick={() => setShowConfigPanel(true)}
        >
          Recommendation Config
        </Button>
        <Dialog
          open={showConfigPanel}
          TransitionComponent={Transition}
          onClose={handleCloseConfigPanel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {'Configure the Threshold of instance cardinalities'}
          </DialogTitle>
          <DialogContent>
            <Grid container flexDirection="column" spacing={2}>
              {Object.keys(recommendationConfig).map((config) => {
                return (
                  <Grid
                    item
                    container
                    flexDirection="row"
                    spacing={2}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Grid item>
                      {
                        // @ts-ignore
                        ChartType_mapping[config]
                      }
                    </Grid>
                    <Grid item>
                      <TextField
                        id="outlined-basic"
                        type="number"
                        // @ts-ignore
                        // value={recommendationConfig[config]}
                        defaultValue={recommendationConfig[config]}
                        size="small"
                        variant="outlined"
                        onChange={(event) => {
                          const value = Number(event.target.value);
                          const newConfig = recommendationConfig;
                          // @ts-ignore
                          newConfig[config] = value;
                          setRecommendationConfig(newConfig);
                        }}
                        style={{
                          margin: 3,
                          backgroundColor: 'white',
                          width: '100%',
                        }}
                      />
                    </Grid>
                  </Grid>
                );
              })}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfigPanel}>Close</Button>
          </DialogActions>
        </Dialog>
      </Grid>
    );
  }

  async function accuracyTesting() {
    const initialString = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX : <http://www.semwebtech.org/mondial/10/meta#>
          
    SELECT ?name ?population
    WHERE {
      ?country rdf:type :Country ;
               :name ?name ;
               :population ?population .
    } ORDER BY DESC(?population) LIMIT 100`;

    const f3a = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX : <${db_prefix_URL}>
    SELECT ?inflation ?unemployment WHERE {
        ?c rdf:type :Country ;
           :inflation ?inflation ;
           :unemployment ?unemployment .
    }`;

    const f3b = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX : <${db_prefix_URL}>
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
    } LIMIT 40`;

    const f3c = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX : <http://www.semwebtech.org/mondial/10/meta#>
    SELECT  ?year  ?population ?country
    WHERE {
        ?c rdf:type :Country ; 
           :name ?country ;
           :encompassedByInfo ?en .
        ?py rdf:type :PopulationCount ;
            :year ?year;
            :value ?population .
        ?c 	:hadPopulation ?py .
    } LIMIT 100`;

    const f3d = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX : <${db_prefix_URL}>
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
    } LIMIT 100`;
    const queryList = [initialString, f3a, f3b, f3c, f3d];
    const expectedVisList = [
      ['bar', 'column', 'wordClouds', 'pie', 'choroplethMap'],
      ['scatter'],
      ['treemap', 'sunburst', 'circlePacking'],
      [
        'multiLine',
        'stackedBar',
        'stackedColumn',
        'groupedBar',
        'groupedColumn',
      ],
      ['network', 'chord', 'sankey', 'heatmap'],
    ];

    const results = [];
    for (const q of queryList) {
      results.push(await handleQuery(q));
    }

    const recommendations = results.map((r: any) => {
      return r.recommendations;
    });

    const failedResults = [];

    for (let i = 0; i < recommendations.length; i++) {
      const expectedVis = expectedVisList[i].map((v) => {
        // @ts-ignore
        return ChartType_mapping[v];
      });
      const actualVis = recommendations[i].map((r: any) => {
        return r.chart;
      });

      console.log(`Query ${i} expected vis`, expectedVis);
      console.log(`Query ${i} actual vis`, actualVis);

      const missingVis = expectedVis.filter((v) => {
        return !actualVis.includes(v);
      });

      if (missingVis.length > 0) {
        failedResults.push({
          query: queryList[i],
          expectedVisualisation: expectedVis,
          actualVisualisation: actualVis,
          missingVisualisation: missingVis,
        });
      }

      if (missingVis.length === 0) {
        console.log(`Query ${i} passed accuracy test`);
      } else {
        console.log(
          `Query ${i} failed accuracy test, please check test report`,
        );
      }
    }

    if (failedResults.length === 0) {
      console.log('All tests passed');
    } else {
      console.log('Failed tests', failedResults);
    }
  }

  const [showPrefixReference, setShowPrefixReference] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const canBeOpen_prefixRef = showPrefixReference && Boolean(anchorEl);
  const id_prefixRef = canBeOpen_prefixRef ? 'simple-popover' : undefined;

  const [showShortcut, setShowShortcut] = useState(false);
  const [anchorElSc, setAnchorElSc] = useState<null | HTMLElement>(null);
  const canBeOpen_sc = showShortcut && Boolean(anchorElSc);
  const id_sc = canBeOpen_sc ? 'simple-popover' : undefined;

  return (
    <Grid style={{ margin: 10 }}>
      <Grid container>
        {PrefixReference()}
        {KeyboardShortcut()}
      </Grid>

      {exampleQueries()}
      {editorTabs()}
      <CodeMirror
        value={query}
        minHeight="300px"
        maxHeight="500px"
        extensions={[
          StreamLanguage.define(sparql),
          autocompletion({ override: [myCompletions] }),
          customIconsTheme,
        ]}
        onChange={onChangeCodeArea}
      />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {missingKeyWarning()}
          {tooMuchDataForVisWarning()}
          {manyManyRelationshipWarning()}
        </Grid>
        <Grid
          item
          container
          flexDirection="row"
          justifyContent="flex-start"
          alignItems="center"
        >
          <LoadingButton
            variant="contained"
            onClick={() => {
              handleQuery(query);
            }}
            loading={loading}
            loadingPosition="end"
            // disabled={loading}
            endIcon={<SendIcon />}
            style={{ textTransform: 'none' }}
            sx={{
              maxHeight: '40px',
            }}
          >
            Execute Query
          </LoadingButton>

          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  defaultChecked
                  value={inferredDataQuery}
                  onClick={() => {
                    toggleInferredDataQuery();
                    handleQuery(query);
                  }}
                />
              }
              label="Use inferred data?"
              labelPlacement="start"
            />
          </FormGroup>

          {process.env.NODE_ENV == 'development' && (
            <LoadingButton
              variant="outlined"
              color="success"
              onClick={accuracyTesting}
              loading={loading}
              loadingPosition="end"
              // disabled={loading}
              // endIcon={<SendIcon />}
              style={{ textTransform: 'none' }}
              sx={{
                margin: 2,
              }}
            >
              Run Accuracy Test
            </LoadingButton>
          )}
        </Grid>

        <Grid item xs={12}></Grid>

        <Grid
          item
          container
          flexDirection="row"
          justifyContent="flex-start"
          alignItems="center"
          spacing={2}
        >
          {visOptionPanel()}

          {RecommendatoinConfigPanel()}
        </Grid>
      </Grid>

      {columns.length > 0 && (
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
              ) : dataSource.length === 0 ? (
                <Alert
                  severity="info"
                  style={{ height: '100%', textAlign: 'center' }}
                >
                  {`Empty result`}
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

      {fullLoading && (
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
          open={fullLoading}
        >
          <CircularProgress color="inherit" />
          <div style={{ marginLeft: 20 }}>
            {' '}
            Collecting info for Conceptual Model ...{' '}
          </div>
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
          The Prefixes reference has been copied to clipboard!
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
    </Grid>
  );
}

export default SparqlPage;
