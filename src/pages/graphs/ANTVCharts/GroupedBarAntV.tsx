import { VisDataProps } from '@/pages/SparqlPage';
import { Bar } from '@ant-design/plots';
import { FormControl, Grid, MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  preprocessDataForVisualisation,
  safeGetField,
  safeGetFieldIndex,
} from './utils';

const GroupedColumnChart = (props: VisDataProps) => {
  const { headers, data } = props;

  const [dataSource, setDataSource] = useState<any[]>([]);

  // axis, set to states for future column switching requirements
  const [xField, setXField] = useState<string>('');
  const [yField, setYField] = useState<string>('');
  const [seriesField, setSeriesField] = useState<string>('');

  const [fieldsAll, setFieldsAll] = useState<string[]>([]);

  const emptyHeader = '-';
  useEffect(() => {
    setFieldsAll([emptyHeader, ...headers]);
  }, [headers]);

  useEffect(() => {
    setXField(headers[1]);
    setYField(headers[0]);
    setSeriesField(headers[2]);

    const typedData = preprocessDataForVisualisation(data).sort(
      (a: any, b: any) => {
        return a[headers[0]] - b[headers[0]];
      },
    );
    // sort is not necessary
    // .sort((a: any, b: any) => a[headers[1]] - b[headers[1]],);

    setDataSource(typedData);
  }, [headers, data]);

  useEffect(() => {
    if (dataSource.length > 0) {
      const orderedData = dataSource.sort((a, b) => {
        return a[xField] - b[xField];
      });
      setDataSource(orderedData);
    }
  }, [xField, yField, seriesField]);

  const config = {
    data: dataSource,
    isGroup: true,
    xField,
    yField,
    seriesField,
    //color: ['#1ca9e6', '#f88c24'],
    // marginRatio: 0.1,
    label: {
      position: 'middle' as 'middle',
      // 'top', 'middle', 'bottom'
      layout: [
        {
          type: 'interval-adjust-position' as 'interval-adjust-position',
        },
        {
          type: 'interval-hide-overlap' as 'interval-hide-overlap',
        },
        {
          type: 'adjust-color' as 'adjust-color',
        },
      ],
    },
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

        <Grid item>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            source for series
            <Select
              value={safeGetFieldIndex(fieldsAll, seriesField)}
              onChange={(e) => {
                const field = safeGetField(
                  fieldsAll,
                  Number(e.target.value),
                  emptyHeader,
                );
                setSeriesField(field);
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

export default GroupedColumnChart;
