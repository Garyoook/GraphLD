import { VisDataProps } from '@/pages/SparqlPage';
import { Scatter } from '@ant-design/plots';
import { FormControl, Grid, MenuItem, Select, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import { preprocessData } from './utils';

enum Regression_Type {
  // linear, exp, loess, log, poly, pow, quad
  NONE,
  LINEAR,
  EXP,
  LOESS,
  LOG,
  POLY,
  POW,
  QUAD,
}

const regressionTypes = [
  'No Regression',
  'linear',
  'exp',
  'loess',
  'log',
  'poly',
  'pow',
  'quad',
];

const ScatterPlotAntV = (props: VisDataProps) => {
  const { headers, data } = props;

  const [dataSource, setDataSource] = useState<any[]>([]);

  // axis, set to states for future column switching requirements
  const [xField, setXField] = useState<string>('');
  const [yField, setYField] = useState<string>('');
  const [regressionType, setRegressionType] = useState(Regression_Type.NONE);

  const [fieldsAll, setFieldsAll] = useState<string[]>([]);
  useEffect(() => {
    setFieldsAll(headers);
  }, [headers]);

  useEffect(() => {
    setXField(headers[0]);
    setYField(headers[1]);

    const typedData = preprocessData(data);

    setDataSource(typedData);
  }, [headers, data]);

  const config = {
    appendPadding: 10,
    data: dataSource,
    xField,
    yField,
    shape: 'circle',
    // colorField: '',
    size: 4,
    yAxis: {
      nice: true,
      line: {
        style: {
          stroke: '#aaa',
        },
      },
    },
    xAxis: {
      //   min: 0,
      grid: {
        line: {
          style: {
            stroke: '#eee',
          },
        },
      },
      line: {
        style: {
          stroke: '#aaa',
        },
      },
    },
    brush: {
      enabled: true,
      mask: {
        style: {
          fill: 'rgba(0.15,0,0,255)',
        },
      },
    },
    regressionLine: {
      type: regressionTypes[regressionType], // linear, exp, loess, log, poly, pow, quad
    },
  };

  return dataSource.length > 0 ? (
    <Grid>
      <Scatter {...config} />

      <Grid container spacing={2}>
        <Grid item>
          <Tooltip title="Select input source for x axis" arrow placement="top">
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
          </Tooltip>
        </Grid>

        <Grid item>
          <Tooltip title="Select input source for y axis" arrow placement="top">
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
          </Tooltip>
        </Grid>

        {/* regression plot options */}
        <Grid item xs={12}>
          <Tooltip title="Select for regression line" arrow placement="right">
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              Regression Plot
              <Select
                value={regressionType}
                onChange={(e) => {
                  setRegressionType(Number(e.target.value));
                }}
              >
                {regressionTypes.map((item, index) => {
                  return <MenuItem value={index}>{item}</MenuItem>;
                })}
              </Select>
              {/* <FormHelperText>Select Render Mode</FormHelperText> */}
            </FormControl>
          </Tooltip>
        </Grid>
      </Grid>
    </Grid>
  ) : (
    <div>Loading...</div>
  );
};

export default ScatterPlotAntV;
