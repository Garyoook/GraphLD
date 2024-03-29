import { VisDataProps } from '@/pages/SparqlPage';
import { Scatter } from '@ant-design/plots';
import {
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  MenuItem,
  Select,
  Switch,
  Tooltip,
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
  preprocessDataForVisualisation,
  safeGetField,
  safeGetFieldIndex,
} from './utils';

const BubbleChartAntV = (props: VisDataProps) => {
  const { headers, data } = props;

  const [dataSource, setDataSource] = useState<any[]>([]);

  // axis, set to states for future column switching requirements
  const [xField, setXField] = useState<string>('');
  const [yField, setYField] = useState<string>('');
  const [sizeField, setSizeField] = useState('');
  const [colorField, setColorField] = useState('');
  const [turnOffColour, setTurnOffColour] = useState(false);

  const [fieldsAll, setFieldsAll] = useState<string[]>([]);

  const emptyHeader = '-';
  useEffect(() => {
    setFieldsAll([emptyHeader, ...headers]);
  }, [headers]);

  useEffect(() => {
    setXField(headers[0]);
    setYField(headers[1]);
    setSizeField(headers[2]);
    setColorField(headers[3]);

    const typedData = preprocessDataForVisualisation(data);

    // setting the axis based on the data type
    if (typedData.length > 0) {
      const firstRow = data[0];

      const keyHeader = headers.filter((item: any) => {
        return typeof firstRow[item] == 'string';
      });

      const scalarHeaders = headers.filter((item: any) => {
        return typeof firstRow[item] == 'number';
      });

      // console.log('keyHeader', keyHeader);
      // console.log('scalarHeaders', scalarHeaders);

      if (keyHeader.length >= 1) {
        setColorField(keyHeader[0]);
      }

      if (scalarHeaders.length >= 3) {
        setXField(scalarHeaders[0]);
        setYField(scalarHeaders[1]);
        setSizeField(scalarHeaders[2]);
      }
    }

    setDataSource(typedData);
  }, [headers, data]);

  const config = {
    appendPadding: 30,
    data: dataSource,
    xField,
    yField,
    sizeField,
    colorField,
    color: turnOffColour
      ? ['#1976d2']
      : ['#ffd500', '#82cab2', '#193442', '#d18768', '#7e827a'],
    size: [4, 40] as any,
    shape: 'circle',
    pointStyle: {
      fillOpacity: 0.8,
      stroke: '#bbb',
    },
    xAxis: {
      //   min: -25,
      //   max: 5,
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
    yAxis: {
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
  };

  return dataSource.length > 0 ? (
    <Grid>
      <Scatter {...config} />

      <Grid container spacing={2} alignItems="center">
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
            source for size field
            <Select
              value={safeGetFieldIndex(fieldsAll, sizeField)}
              onChange={(e) => {
                const field = safeGetField(
                  fieldsAll,
                  Number(e.target.value),
                  emptyHeader,
                );
                setSizeField(field);
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
          <Tooltip
            title="Used for catorization of data points (if applicable)"
            arrow
            placement="top"
          >
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              source for colour/identity field
              <Select
                value={safeGetFieldIndex(fieldsAll, colorField)}
                onChange={(e) => {
                  const field = safeGetField(
                    fieldsAll,
                    Number(e.target.value),
                    emptyHeader,
                  );
                  setColorField(field);
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
          </Tooltip>
        </Grid>

        <Grid item>
          <Tooltip
            title="Remove the color but keep the identification of the data points"
            arrow
            placement="top"
          >
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={turnOffColour}
                    onChange={(checked) =>
                      setTurnOffColour(checked.target.checked)
                    }
                  />
                }
                label="Trun off colour?"
              />
            </FormGroup>
          </Tooltip>
        </Grid>
      </Grid>
    </Grid>
  ) : (
    <div>Loading...</div>
  );
};

export default BubbleChartAntV;
