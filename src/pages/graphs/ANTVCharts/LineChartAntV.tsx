import { VisDataProps } from '@/pages/SparqlPage';
import { Line } from '@ant-design/plots';
import { FormControl, Grid, MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';
import { preprocessData } from './utils';

const LineChartAntV = (props: VisDataProps) => {
  const { headers, data } = props;

  const [dataSource, setDataSource] = useState<any[]>([]);

  // axis, set to states for future column switching requirements
  const [xField, setXField] = useState<string>('');
  const [yField, setYField] = useState<string>('');

  const [fieldsAll, setFieldsAll] = useState<string[]>([]);
  useEffect(() => {
    setFieldsAll(headers);
  }, [headers]);

  useEffect(() => {
    setXField(headers[0]);
    setYField(headers[1]);

    const typedData = preprocessData(data).sort(
      (a: any, b: any) => a[headers[0]] - b[headers[0]],
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
  }, [xField, yField]);

  const config = {
    data: dataSource,
    // padding: 'auto',
    xField,
    yField,
    xAxis: {
      // type: 'timeCat',
      //   tickCount: 5,
    },
  };

  return dataSource.length > 0 ? (
    <Grid>
      <Line {...config} />

      <Grid container spacing={2}>
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
};

export default LineChartAntV;
