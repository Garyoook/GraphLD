import { VisDataProps } from '@/pages/SparqlPage';
import { Line } from '@ant-design/plots';
import { FormControl, Grid, MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  preprocessDataForVisualisation,
  safeGetField,
  safeGetFieldIndex,
} from './utils';

function MultipleLineChart(props: VisDataProps) {
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
    setSeriesField(headers[0]);
    setXField(headers[1]);
    setYField(headers[2]);

    const typedData = preprocessDataForVisualisation(data).sort(
      (a: any, b: any) => a[headers[1]] - b[headers[1]],
    );

    setDataSource(typedData);
  }, [headers, data]);

  useEffect(() => {
    if (dataSource.length !== 0) {
      const orderedData = dataSource.sort(
        (a: any, b: any) => a[xField] - b[xField],
      );

      setDataSource(orderedData);
    }
  }, [xField, yField, seriesField]);

  const config = {
    data: dataSource,
    xField,
    yField,
    seriesField,
    // xAxis: {
    //   type: 'time',
    // },
    yAxis: {
      type: 'log',
      label: {
        // reformat the y axis
        formatter: (v: string) =>
          `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`),
      },
    },
  };

  return dataSource.length > 0 ? (
    <Grid>
      <Line {...config} />

      <Grid container spacing={2}>
        <Grid item>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            source for series
            <Select
              value={safeGetFieldIndex(fieldsAll, seriesField)}
              onChange={(e) => {
                setSeriesField(
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

        <Grid item>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            source for x axis
            <Select
              value={safeGetFieldIndex(fieldsAll, xField)}
              onChange={(e) => {
                setXField(
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

        <Grid item>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            source for y axis
            <Select
              value={safeGetFieldIndex(fieldsAll, yField)}
              onChange={(e) => {
                setYField(
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
    </Grid>
  ) : (
    <div>No Data Available</div>
  );
}

export default MultipleLineChart;
