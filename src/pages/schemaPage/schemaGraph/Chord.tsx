import { VisDataProps } from '@/pages/SparqlPage';
import { getDPByClass } from '@/pages/SparqlPage/ConceptualModel/service';
import { preprocessDataForVisualisation } from '@/pages/graphs/ANTVCharts/utils';
import { DatabaseState } from '@/pages/reducer/databaseReducer';
import { PlotEvent } from '@ant-design/charts';
import { Chord } from '@ant-design/plots';
import { StreamLanguage } from '@codemirror/language';
import { sparql } from '@codemirror/legacy-modes/mode/sparql';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  ListItem,
  ListItemText,
  Snackbar,
} from '@mui/material';
import CodeMirror from '@uiw/react-codemirror';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const ChordSchema = (props: VisDataProps) => {
  const { headers, data } = props;

  const repo_graphDB = useSelector(
    (state: DatabaseState) => state.database.repo,
  );
  const db_prefix_URL = useSelector(
    (state: DatabaseState) => state.database.db_prefix_URL,
  );

  const [dataSource, setDataSource] = useState<any[]>([]);

  // fields
  const [sourceField, setSourceField] = useState<string>('');
  const [targetField, setTargetField] = useState<string>('');
  const [weightField, setWeightField] = useState<string>('');
  const [fieldsAll, setFieldsAll] = useState<string[]>([]);

  const emptyHeader = '-';
  useEffect(() => {
    setFieldsAll([emptyHeader, ...headers]);
  }, [headers]);

  // for generated query
  const [generatedQuery, setGeneratedQuery] = useState<string>('');
  const [showEditWarning, setShowEditWarning] = useState<boolean>(false);

  // for ODP query generation
  const [showODPQueryGen, setShowQueryGen] = useState<boolean>(false);
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [objectProp, setObjectProp] = useState('');
  const [showCopySuccess, setShowCopySuccess] = useState<boolean>(false);
  const [showCopyUnderUnsafeOrigin, setShowCopyUnderUnsafeOrigin] =
    useState<boolean>(false);
  const [ODPList, setODPList] = useState<string[]>([]);
  const [showODPList, setShowODPList] = useState(false);

  // for FDP list
  const [showFDPList, setShowFDPList] = useState<boolean>(false);
  const [FDPList, setFDPList] = useState<string[]>([]);
  // for FDP query generation
  const [showFDPQueryGen, setShowFDPQueryGen] = useState<boolean>(false);

  useEffect(() => {
    setSourceField(headers[0]);
    setTargetField(headers[1]);
    setWeightField(headers[2]);

    const typedData = preprocessDataForVisualisation(data);

    setDataSource(typedData);
  }, [data, headers]);

  const config = {
    data: dataSource,
    width: 600,
    height: 600,
    interactions: [{ type: 'element-active' }],
    sourceField,
    targetField,
    weightField,
    tooltip: {
      fields: ['name', 'source', 'target', 'value', 'isNode'],
      showContent: true,
      formatter: (datum: any) => {
        const { isNode, name, source, target, value } = datum;

        if (isNode) {
          return {
            name: `${name}(Source)`,
            value: `${dataSource
              .filter((d) => d[sourceField] === name)
              .reduce((a, b) => a + b[weightField], 0)} instances`,
          };
        }

        const filteredData = dataSource.filter(
          (d) => d[sourceField] === name && d[targetField] === target,
        );
        const ObjectProps = filteredData.map((d) => d['PAB']).join(', ');

        return {
          name: `${source} -> ${target}`,
          value: `${ObjectProps}`,
        };
      },
    },
  };

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

  function showGeneratedODPList() {
    return (
      <Dialog
        fullWidth
        maxWidth="sm"
        open={showODPList}
        onClose={() => setShowODPList(false)}
      >
        <DialogTitle>{`Related Object Properties of ${source}`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Click one of the Object Properties to get related SPARQL query
          </DialogContentText>
          {ODPList.map((pab) => {
            return (
              <>
                <ListItem
                  button
                  key={pab}
                  onClick={(e) => {
                    const var_source = source?.split(':')[1].toLowerCase();
                    const var_target = target?.split(':')[1].toLowerCase();

                    const generatedQuery = `PREFIX : <${db_prefix_URL}>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
SELECT  ?${var_source} ?${var_target}
WHERE{
?${var_source} ${pab} ?${var_target} .
?${var_source} rdf:type ${source} .
?${var_target} rdf:type ${target} .
}`;

                    setSource(source);
                    setTarget(target);
                    setGeneratedQuery(generatedQuery);
                    setShowQueryGen(pab !== 'unknown');
                  }}
                >
                  <ListItemText primary={pab} />
                </ListItem>
                <Divider />
              </>
            );
          })}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowODPList(false);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  function showGeneratedODPQuery() {
    return (
      <Dialog
        fullWidth
        maxWidth="md"
        open={showODPQueryGen}
        onClose={() => setShowQueryGen(false)}
      >
        <DialogTitle>{`Generated query from ${source} to ${target}`}</DialogTitle>
        {generatedContent(generatedQuery)}
        <DialogActions>
          <Button
            onClick={() => {
              setShowQueryGen(false);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  function showGeneratedFDPList() {
    return (
      <Dialog
        fullWidth
        maxWidth="sm"
        open={showFDPList}
        onClose={() => setShowFDPList(false)}
      >
        <DialogTitle>{`Related data properties of ${source}`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Click one of the properties to get related SPARQL query
          </DialogContentText>
          {FDPList.map((dp) => {
            return (
              <>
                <ListItem
                  button
                  key={dp}
                  onClick={(e) => {
                    const DP = e.currentTarget.textContent;
                    const var_DP = DP?.split(':')[1].toLowerCase();
                    const class_URI = source;
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

  function showGeneratedFDPQuery() {
    return (
      <Dialog
        fullWidth
        maxWidth="md"
        open={showFDPQueryGen}
        onClose={() => setShowFDPQueryGen(false)}
      >
        <DialogTitle>{`Generated query of class ${source} on property ${target}`}</DialogTitle>
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

  const handleClickChord = async (_: any, event: PlotEvent) => {
    if (event.type === 'click') {
      const data = event.data?.data || [];
      const { isNode } = data;
      if (isNode) {
        const source = data.name;
        try {
          // ! limitations: some data properties are not here because of disjointUnionOf or other Collection relationship.
          const FDP_list = await getDPByClass(
            source,
            repo_graphDB,
            db_prefix_URL,
          );

          setFDPList(FDP_list);
          setSource(source);
          setShowFDPList(true);
        } catch (error) {
          console.log(error);
        }
      } else {
        if (data.source && data.target) {
          const { source, target, isNode } = data;
          const filteredData = dataSource.filter(
            (d) => d[sourceField] === source && d[targetField] === target,
          );

          const ObjectProps = filteredData.map((d) => d['PAB']);
          setODPList(ObjectProps);
          setSource(source);
          setTarget(target);
          setShowODPList(true);
        }
      }
    }
  };

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

  return dataSource.length > 0 ? (
    <Grid>
      <Chord {...config} onEvent={handleClickChord} />

      {showGeneratedODPList()}
      {showGeneratedODPQuery()}
      {showGeneratedFDPList()}
      {showGeneratedFDPQuery()}

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
  ) : (
    <div>Loading ... </div>
  );
};

export default ChordSchema;
