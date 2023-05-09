import { VisDataProps } from '@/pages/SparqlPage';
import { Line } from '@ant-design/plots';
import { FormControl, Grid, MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';
import { preprocessData } from './utils';

function MultipleLineChart(props: VisDataProps) {
  const { headers, data } = props;

  const [dataSource, setDataSource] = useState<any[]>([]);

  // axis, set to states for future column switching requirements
  const [xField, setXField] = useState<string>('');
  const [yField, setYField] = useState<string>('');
  const [seriesField, setSeriesField] = useState<string>('');

  const [fieldsAll, setFieldsAll] = useState<string[]>([]);
  useEffect(() => {
    setFieldsAll(headers);
  }, [headers]);

  useEffect(() => {
    setSeriesField(headers[0]);
    setXField(headers[1]);
    setYField(headers[2]);

    const typedData = preprocessData(data);

    setDataSource(typedData);
  }, [headers, data]);

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
              value={fieldsAll.indexOf(seriesField)}
              onChange={(e) => {
                setSeriesField(fieldsAll[Number(e.target.value)]);
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
              value={fieldsAll.indexOf(xField)}
              onChange={(e) => {
                setXField(fieldsAll[Number(e.target.value)]);
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
              value={fieldsAll.indexOf(yField)}
              onChange={(e) => {
                setYField(fieldsAll[Number(e.target.value)]);
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
