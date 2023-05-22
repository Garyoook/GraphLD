import { VisDataProps } from '@/pages/SparqlPage';
import {
  preprocessDataForVisualisation,
  safeGetField,
  safeGetFieldIndex,
} from '@/pages/graphs/ANTVCharts/utils';
import { Chord } from '@ant-design/plots';
import { StreamLanguage } from '@codemirror/language';
import { sparql } from '@codemirror/legacy-modes/mode/sparql';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  MenuItem,
  Popover,
  Select,
  Typography,
} from '@mui/material';
import CodeMirror from '@uiw/react-codemirror';
import { useEffect, useState } from 'react';

const ChordSchema = (props: VisDataProps) => {
  const { headers, data } = props;

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
  const [showQueryGen, setShowQueryGen] = useState<boolean>(false);
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [objectProp, setObjectProp] = useState('');
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  useEffect(() => {
    setSourceField(headers[0]);
    setTargetField(headers[1]);
    setWeightField(headers[2]);

    const typedData = preprocessDataForVisualisation(data);

    setDataSource(typedData);
  }, [data, headers]);

  const config = {
    data: dataSource,
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
            value: dataSource
              .filter((d) => d[sourceField] === name)
              .reduce((a, b) => a + b[weightField], 0),
          };
        }

        const filteredData = dataSource.filter(
          (d) => d[sourceField] === name && d[targetField] === target,
        );
        const ObjectProp =
          filteredData.length === 1 ? filteredData[0]['PAB'] : 'unknown';

        return {
          name: `${source} -> ${target}`,
          value: `${ObjectProp} : ${value} instances`,
        };
      },
    },
  };

  return dataSource.length > 0 ? (
    <Grid>
      <Chord
        {...config}
        onEvent={(_, event) => {
          if (event.type === 'click') {
            const data = event.data?.data || [];
            const { source, target } = data;

            if (data.source && data.target) {
              const filteredData = dataSource.filter(
                (d) => d[sourceField] === source && d[targetField] === target,
              );
              const ObjectProp =
                filteredData.length === 1 ? filteredData[0]['PAB'] : 'unknown';

              const generatedQuery = `PREFIX : <http://www.semwebtech.org/mondial/10/meta#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
SELECT  ?s ?t
WHERE{
	?s ${ObjectProp} ?t .
	?s rdf:type ${source} .
	?t rdf:type ${target} .
}`;

              setSource(source);
              setTarget(target);
              setObjectProp(ObjectProp);
              setGeneratedQuery(generatedQuery);
              setShowQueryGen(ObjectProp !== 'unknown');
            }
          }
        }}
      />

      {/* Field controllers, now hiden because no changing requirement */}
      <Grid container spacing={2} style={{ display: 'none' }}>
        <Grid item>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            source field
            <Select
              value={safeGetFieldIndex(fieldsAll, sourceField)}
              onChange={(e) => {
                const field = safeGetField(
                  fieldsAll,
                  Number(e.target.value),
                  emptyHeader,
                );
                setSourceField(field);
              }}
            >
              {fieldsAll.map((item, index) => {
                return <MenuItem value={index}>{item}</MenuItem>;
              })}
            </Select>
          </FormControl>
        </Grid>

        <Grid item>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            target field
            <Select
              value={safeGetFieldIndex(fieldsAll, targetField)}
              onChange={(e) => {
                const field = safeGetField(
                  fieldsAll,
                  Number(e.target.value),
                  emptyHeader,
                );
                setTargetField(field);
              }}
            >
              {fieldsAll.map((item, index) => {
                return <MenuItem value={index}>{item}</MenuItem>;
              })}
            </Select>
          </FormControl>
        </Grid>

        <Grid item>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            weight field
            <Select
              value={safeGetFieldIndex(fieldsAll, weightField)}
              onChange={(e) => {
                setWeightField(
                  safeGetField(fieldsAll, Number(e.target.value), emptyHeader),
                );
              }}
            >
              {fieldsAll.map((item, index) => {
                return <MenuItem value={index}>{item}</MenuItem>;
              })}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Dialog
        fullWidth
        maxWidth="md"
        open={showQueryGen}
        onClose={() => setShowQueryGen(false)}
      >
        <DialogTitle>{`Generated query from ${source} to ${target}`}</DialogTitle>
        <DialogContent>
          <CodeMirror
            value={generatedQuery}
            height="300px"
            extensions={[StreamLanguage.define(sparql)]}
            // onChange={onChange}
          />
          <DialogContentText>
            <Button
              variant="text"
              size="small"
              onClick={() => {
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
              }}
              aria-describedby={'copySuccess'}
              style={{
                textTransform: 'none',
              }}
            >
              Click here to copy the query to clipboard
            </Button>
          </DialogContentText>
          <Popover
            id={'copySuccess'}
            open={showCopySuccess}
            onClose={() => setShowCopySuccess(false)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            <Typography sx={{ p: 2 }}>
              The SPARQL query has been copied to clipboard!
            </Typography>
          </Popover>
        </DialogContent>
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
    </Grid>
  ) : (
    <div>Loading ... </div>
  );
};

export default ChordSchema;
