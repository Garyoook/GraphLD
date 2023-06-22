import { VisDataProps } from '@/pages/SparqlPage';
import { RadialGraph } from '@ant-design/graphs';
import {
  Backdrop,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  MenuItem,
  Select,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import {
  preprocessDataForVisualisation,
  safeGetField,
  safeGetFieldIndex,
} from './utils';

const NetworkChart = (props: VisDataProps) => {
  const { headers, data } = props;

  const chartRef = useRef();

  const [dataSource, setDataSource] = useState<any>([]);
  const [loading, setLoading] = useState(false);

  // fields
  const [sourceField, setSourceField] = useState<string>('');
  const [targetField, setTargetField] = useState<string>('');
  const [weightField, setWeightField] = useState<string>('');

  const [fieldsAll, setFieldsAll] = useState<string[]>([]);

  const emptyHeader = '-';
  useEffect(() => {
    setSourceField(headers[0]);
    setTargetField(headers[1]);
    setWeightField(headers[2]);
    setFieldsAll([emptyHeader, ...headers]);
  }, [headers]);

  useEffect(() => {
    setLoading(true);
    const typedData = preprocessDataForVisualisation(data);

    const networkData = preProcessNetworkData(typedData);

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
      if (keyHeader.length >= 2) {
        setSourceField(keyHeader[0]);
        setTargetField(keyHeader[1]);
      }
      if (scalarHeaders.length >= 1) {
        setWeightField(scalarHeaders[0]);
      }
    }

    setDataSource(networkData);

    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, [data, sourceField, targetField, weightField]);

  function preProcessNetworkData(data: any[]) {
    const nodes = new Set();

    data.forEach((item, index) => {
      const nodeSourceLabel = item[sourceField];
      nodes.add(nodeSourceLabel);

      const nodeTargetLabel = item[targetField];
      nodes.add(nodeTargetLabel);
    });

    const nodesData = Array.from(nodes).map((item: any, index) => {
      return {
        id: index.toString(),
        label: item,
      };
    });

    const edgesData = data.map((item, index) => {
      return {
        source: nodesData.find((node) => node.label === item[sourceField])?.id,
        target: nodesData.find((node) => node.label === item[targetField])?.id,
        value: item[weightField]?.toString(),
      };
    });

    console.log('networkData', {
      nodes: nodesData,
      edges: edgesData,
    });

    return {
      nodes: nodesData,
      edges: edgesData,
    };
  }

  const config = {
    data: dataSource,
    autoFit: true,
    layout: {
      unitRadius: 80,
      nodeSize: 20,
      nodeSpacing: 10,
      preventOverlap: true,
      strictRadial: true,
    },
    nodeCfg: {
      size: 20,
      style: {
        fill: '#6CE8DC',
        stroke: '#6CE8DC',
      },
      labelCfg: {
        style: {
          fontSize: 5,
          fill: '#000',
        },
      },
    },
    edgeCfg: {
      style: {
        lineWidth: 1,
      },
      endArrow: {
        d: 10,
        size: 2,
      },
    },
    minimapCfg: {
      show: true,
    },
    behaviors: ['drag-canvas', 'zoom-canvas', 'drag-node'],
    onReady: (graph: any) => {
      chartRef.current = graph;
    },
  };

  return dataSource.nodes && !loading ? (
    <Grid>
      <Grid>
        You can{' '}
        <Button size="small" sx={{ textTransform: 'none' }}>
          Zoom{' '}
        </Button>{' '}
        or{' '}
        <Button size="small" sx={{ textTransform: 'none' }}>
          Drag
        </Button>{' '}
        to adjust the viewpoint
      </Grid>
      <RadialGraph {...config} />
      <Grid
        container
        spacing={2}
        sx={{ marginLeft: '10px', width: '95%', backgroundColor: '#aaddee33' }}
      >
        <Grid item>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            source field
            <Select
              value={safeGetFieldIndex(fieldsAll, sourceField)}
              onChange={(e) => {
                const field = safeGetField(
                  fieldsAll,
                  Number(e.target.value),
                  emptyHeader,
                );
                setSourceField(field);
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
            target field
            <Select
              value={safeGetFieldIndex(fieldsAll, targetField)}
              onChange={(e) => {
                const field = safeGetField(
                  fieldsAll,
                  Number(e.target.value),
                  emptyHeader,
                );
                setTargetField(field);
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
            weight field
            <Select
              value={safeGetFieldIndex(fieldsAll, weightField)}
              onChange={(e) => {
                setWeightField(
                  safeGetField(fieldsAll, Number(e.target.value), emptyHeader),
                );
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
    <div>
      <Backdrop
        sx={{
          position: 'relative',
          height: '500px',
          width: '100%',
          borderRadius: '10px',
          color: '#1976d2',
          fontSize: 20,
          fontWeight: 'bold',
          backgroundColor: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        open={loading}
      >
        <CircularProgress color="inherit" />
        <div style={{ marginLeft: 20 }}>{`Loading Network ...`}</div>
      </Backdrop>
    </div>
  );
};

export default NetworkChart;
