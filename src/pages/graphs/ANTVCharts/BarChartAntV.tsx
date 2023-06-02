import { VisDataProps } from '@/pages/SparqlPage';
import { Bar } from '@ant-design/plots';
import { FormControl, Grid, MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  preprocessDataForVisualisation,
  safeGetField,
  safeGetFieldIndex,
} from './utils';

const BarChartAntV = (props: VisDataProps) => {
  const { headers, data } = props;

  const [dataSource, setDataSource] = useState<any[]>([]);

  // axis, set to states for future column switching requirements
  const [xField, setXField] = useState<string>('');
  const [yField, setYField] = useState<string>('');

  const [fieldsAll, setFieldsAll] = useState<string[]>([]);

  const emptyHeader = '-';
  useEffect(() => {
    setFieldsAll([emptyHeader, ...headers]);
  }, [headers]);

  useEffect(() => {
    setXField(headers[1]);
    setYField(headers[0]);

    const typedData = preprocessDataForVisualisation(data);
    // sort is not necessary
    // .sort((a: any, b: any) => a[headers[1]] - b[headers[1]],);

    setDataSource(typedData);
  }, [headers, data]);

  const config = {
    data: dataSource,
    xField,
    yField,
    columnWidthRatio: 0.8,
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    interactions: [{ type: 'element-active' }],
    brush: {
      enabled: true,
      type: 'x-rect' as 'x-rect',
      action: 'filter' as 'filter',
    },
    // scrollbar: {
    //   type: 'horizontal' as 'horizontal',
    //   categorySize: 12.5,
    // },
  };
  return dataSource.length > 0 ? (
    <Grid>
      <Bar {...config} />

      <Grid container spacing={2}>
        <Grid item>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            source for x axis
            <Select
              value={safeGetFieldIndex(fieldsAll, xField)}
              onChange={(e) => {
                const field = safeGetField(
                  fieldsAll,
                  Number(e.target.value),
                  emptyHeader,
                );
                setXField(field);
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
            source for y axis
            <Select
              value={safeGetFieldIndex(fieldsAll, yField)}
              onChange={(e) => {
                const field = safeGetField(
                  fieldsAll,
                  Number(e.target.value),
                  emptyHeader,
                );
                setYField(field);
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
    <div>Loading ...</div>
  );
};

export default BarChartAntV;
