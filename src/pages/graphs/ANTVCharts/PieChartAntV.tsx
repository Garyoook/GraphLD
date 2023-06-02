import { VisDataProps } from '@/pages/SparqlPage';
import { Pie } from '@ant-design/plots';
import { FormControl, Grid, MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  preprocessDataForVisualisation,
  safeGetField,
  safeGetFieldIndex,
} from './utils';

const PieChartAntV = (props: VisDataProps) => {
  const { headers, data } = props;

  const [dataSource, setDataSource] = useState<any[]>([]);

  // axis, set to states for future column switching requirements
  const [angleField, setAngleField] = useState<string>('');
  const [colorField, setColorField] = useState<string>('');

  const [fieldsAll, setFieldsAll] = useState<string[]>([]);

  const emptyHeader = '-';
  useEffect(() => {
    setFieldsAll([emptyHeader, ...headers]);
  }, [headers]);

  useEffect(() => {
    setColorField(headers[0]);
    setAngleField(headers[1]);

    const typedData = preprocessDataForVisualisation(data).sort(
      (a: any, b: any) => a[headers[1]] - b[headers[1]],
    );

    setDataSource(typedData);
  }, [headers, data]);

  useEffect(() => {
    if (dataSource.length !== 0) {
      const orderedData = dataSource.sort(
        (a: any, b: any) => a[angleField] - b[angleField],
      );

      setDataSource(orderedData);
    }
  }, [colorField, angleField]);

  const config = {
    appendPadding: 10,
    data: dataSource,
    angleField,
    colorField,
    radius: 0.75,
    label: {
      type: 'spider',
      labelHeight: 28,
      content: '{name}\n{percentage}',
    },
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
    ],
  };

  return dataSource.length > 0 ? (
    <Grid>
      <Pie {...config} />

      <Grid container spacing={2}>
        <Grid item>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            source for catorization field
            <Select
              value={safeGetFieldIndex(fieldsAll, colorField)}
              onChange={(e) => {
                setColorField(
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
            source for quantity field
            <Select
              value={safeGetFieldIndex(fieldsAll, angleField)}
              onChange={(e) => {
                setAngleField(
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
    <div>No Data Available</div>
  );
};

export default PieChartAntV;
