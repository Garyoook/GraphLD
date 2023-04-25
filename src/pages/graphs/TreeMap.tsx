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

  function showFullTooltip(row: any, size: string, value: any) {
    return `<div style="z-index: 99999999999;position: relative; background:#d0f0ff; border-radius: 10px; padding:10px; border-style:solid">
            <span style="font-family:Courier"> ${headers[2]}: <div style="font-weight: 800;">${size}</div> </span> </div>`;
  }

  const options = {
    minColor: '#CCE5FF',
    midColor: '#66b2ff',
    maxColor: '#0080FF',
    headerHeight: 20,
    fontColor: 'black',
    showScale: true,
    useWeightedAverageForAggregation: true,
    showTooltips: true,
    generateTooltip: showFullTooltip,
  };

  function renderByGroup(headers: string[], data: (number | string)[][]) {
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

  function renderAll(headers: string[], data: (number | string)[][]) {
    // display all data in the same group
    const groupSet: any[] = [];
    for (const [id, group, value] of data) {
      if (!groupSet.includes(group)) {
        groupSet.push(group);
      }
    }
    const dataTmp: any[][] = [];
    dataTmp.push(['all', null, 0, 0]);
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

  function swapColumns() {
    // if cannot render, try swap id col(0) and parent col(1)
    const swappedHeaders = [headers[1], headers[0], headers[2]];
    const swappedData = data.map((item) => {
      return [item[1], item[0], item[2]];
    });
    console.log('swapped datasource: ', [swappedHeaders, ...swappedData]);
    // setDataSource([swappedHeaders, ...swappedData]);
    renderModes.at(renderMode)?.renderer(swappedHeaders, swappedData);
  }

  const renderModes = [
    { name: 'Groups', renderer: renderByGroup },
    { name: 'Overview', renderer: renderAll },
  ];

  useEffect(() => {
    renderModes.at(renderMode)?.renderer(headers, data);
  }, [reset, renderMode]);

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
          onClick={() => swapColumns()}
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
            {renderModes.map((item, index) => {
              return <MenuItem value={index}>{item.name}</MenuItem>;
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
