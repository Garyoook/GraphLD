import {
  Button,
  FormControl,
  FormHelperText,
  Grid,
  MenuItem,
  Select,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import { VisDataProps } from '../SparqlPage';

const options = {};

function TreeMap(props: VisDataProps) {
  const { headers, data } = props;

  const [dataSource, setDataSource] = useState<(string | number)[][]>(data);
  const [renderMode, setRenderMode] = useState(0);
  const [reset, setReset] = useState(false);

  const options = {
    minColor: '#CCE5FF',
    midColor: '#66b2ff',
    maxColor: '#0080FF',
    headerHeight: 20,
    fontColor: 'black',
    showScale: true,
    useWeightedAverageForAggregation: true,
  };

  function renderMode0() {
    const groupSet: any[] = [];
    for (const [id, group, value] of data) {
      if (!groupSet.includes(group)) {
        groupSet.push(group);
      }
    }
    const dataTmp = [];
    // initialise the global group:
    // format: [id, parent, value, color]
    dataTmp.push(['all', null, 0, 0]);
    console.log('groupSet: ', groupSet);

    for (const group of groupSet) {
      dataTmp.push([group, 'all', 0, groupSet.lastIndexOf(group)]);
    }

    const header = [...headers, 'color'];

    const coloredData = data.map((item) => {
      return [...item, groupSet.lastIndexOf(item[1])];
    });

    console.log('data after preprocessing: ', [
      header,
      ...coloredData,
      ...dataTmp,
    ]);

    const preprocessedData = [header, ...coloredData, ...dataTmp];

    setDataSource(preprocessedData);
  }

  function renderMode1() {
    const groupSet: any[] = [];
    for (const [id, group, value] of data) {
      if (!groupSet.includes(group)) {
        groupSet.push(group);
      }
    }
    const dataTmp = [];
    // initialise the global group:
    // format: [id, parent, value, color]
    dataTmp.push(['all', null, 0, 0]);
    console.log('groupSet: ', groupSet);

    // for (const group of groupSet) {
    //   dataTmp.push([group, 'all', 0, groupSet.lastIndexOf(group)]);
    // }

    const header = [...headers, 'color'];

    const coloredData = data.map((item) => {
      const [id, group, value] = item;
      return [id, 'all', value, groupSet.lastIndexOf(group)];
    });

    console.log('data after preprocessing: ', [
      header,
      ...coloredData,
      ...dataTmp,
    ]);

    const preprocessedData = [header, ...coloredData, ...dataTmp];

    setDataSource(preprocessedData);
  }

  const renderModes = [renderMode0, renderMode1];

  useEffect(() => {
    renderModes[renderMode]();
  }, [data, reset, renderMode]);

  return (
    <Grid
      container
      columnSpacing={{ xs: 1, sm: 2, md: 3 }}
      alignItems="center"
      justifyContent="center"
    >
      <Grid item>
        <Button
          variant="outlined"
          size="large"
          style={{ textTransform: 'none' }}
          onClick={
            // swapColumns
            () => {}
          }
        >
          Swap columns
        </Button>
      </Grid>

      <Grid item>
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <Select
            value={renderMode}
            onChange={(e) => {
              setRenderMode(Number(e.target.value));
            }}
          >
            {renderModes.map((_, index) => {
              return <MenuItem value={index}>Mode{index}</MenuItem>;
            })}
          </Select>
          <FormHelperText>Select Render Mode</FormHelperText>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <Button
          variant="contained"
          onClick={() => {
            setReset(!reset);
          }}
          size="large"
          style={{ textTransform: 'none' }}
        >
          To Top level
        </Button>
      </Grid>

      <Chart
        chartType="TreeMap"
        width="100%"
        height="400px"
        data={data.length > 0 ? dataSource : []}
        options={options}
      />
    </Grid>
  );
}

export default TreeMap;
