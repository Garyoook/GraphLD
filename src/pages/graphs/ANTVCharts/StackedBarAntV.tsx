import { VisDataProps } from '@/pages/SparqlPage';
import { Bar } from '@ant-design/plots';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import {
  Button,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Tooltip,
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
  preprocessDataForVisualisation,
  safeGetField,
  safeGetFieldIndex,
} from './utils';

const StackedColumnChart = (props: VisDataProps) => {
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

    const typedData = preprocessDataForVisualisation(data);

    setDataSource(typedData);
  }, [headers, data]);

  const config = {
    data: dataSource,
    isStack: true,
    xField,
    yField,
    seriesField,
    //color: ['#1ca9e6', '#f88c24'],
    // marginRatio: 0.1,
    label: {
      position: 'middle' as 'middle', // 'top', 'bottom', 'middle'
    },
    interactions: [
      {
        type: 'active-region' as 'active-region',
        enable: false,
      },
    ],
    connectedArea: {
      style: (oldStyle: any, element: any) => {
        return {
          fill: 'rgba(0,0,0,0.25)',
          stroke: oldStyle.fill,
          lineWidth: 0.5,
        };
      },
    },
  };

  const [sortX, setSortX] = useState(false);
  const [sortY, setSortY] = useState(false);

  return dataSource.length > 0 ? (
    <Grid>
      <Tooltip
        title="Some data can be sorted by certain values of its attributes, try it out!"
        placement="bottom-start"
        arrow
      >
        <Grid
          container
          spacing={2}
          sx={{ alignItems: 'center', marginBottom: 2 }}
        >
          <Grid item>
            <Button
              variant="outlined"
              color="success"
              size="small"
              sx={{
                textTransform: 'none',
              }}
              endIcon={<CompareArrowsIcon />}
              onClick={() => {
                const orderedData = dataSource.sort((a, b) => {
                  return sortX ? a[xField] - b[xField] : b[xField] - a[xField];
                });
                setDataSource(orderedData);

                setSortX(!sortX);
              }}
            >
              Sort by axis {xField}
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              color="success"
              size="small"
              sx={{
                textTransform: 'none',
              }}
              endIcon={<CompareArrowsIcon />}
              onClick={() => {
                const orderedData = dataSource.sort((a, b) => {
                  return sortY ? a[yField] - b[yField] : b[yField] - a[yField];
                });
                setDataSource(orderedData);

                setSortY(!sortY);
              }}
            >
              Sort by axis {yField}
            </Button>
          </Grid>
        </Grid>
      </Tooltip>
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

export default StackedColumnChart;
