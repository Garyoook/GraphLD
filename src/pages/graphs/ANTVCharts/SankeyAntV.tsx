import { VisDataProps } from '@/pages/SparqlPage';
import { Sankey } from '@ant-design/plots';
import { FormControl, Grid, MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  preprocessDataForVisualisation,
  safeGetField,
  safeGetFieldIndex,
} from './utils';

const SankeyAntV = (props: VisDataProps) => {
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

        return {
          name: `${source} -> ${target}`,
          value: `${weightField}: ${value}`,
        };
      },
    },
  };

  return dataSource.length > 0 ? (
    <Grid>
      <Sankey {...config} />

      <Grid container spacing={2}>
        <Grid item>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            source field
            <Select
              value={safeGetFieldIndex(fieldsAll, sourceField)}
              onChange={(e) => {
                setSourceField(
                  safeGetField(fieldsAll, Number(e.target.value), emptyHeader),
                );
              }}
            >
              {fieldsAll.map((item, index) => {
                return (
                  <MenuItem key={index} value={index}>
                    {item}
                  </MenuItem>
                );
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
                setTargetField(
                  safeGetField(fieldsAll, Number(e.target.value), emptyHeader),
                );
              }}
            >
              {fieldsAll.map((item, index) => {
                return (
                  <MenuItem key={index} value={index}>
                    {item}
                  </MenuItem>
                );
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
                return (
                  <MenuItem key={index} value={index}>
                    {item}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Grid>
  ) : (
    <div>Loading ... </div>
  );
};

export default SankeyAntV;
