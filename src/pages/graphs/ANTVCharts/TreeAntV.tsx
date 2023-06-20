import { VisDataProps } from '@/pages/SparqlPage';
import { RadialTreeGraph } from '@ant-design/graphs';
import { FormControl, Grid, MenuItem, Select, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  preprocessDataForVisualisation,
  safeGetField,
  safeGetFieldIndex,
} from './utils';

const TreeAntV = (props: VisDataProps) => {
  const { headers, data } = props;

  const [dataSource, setDataSource] = useState<any>([]);

  const [categoryCol, setCategoryCol] = useState<string>('');
  const [valueCol, setValueCol] = useState<string>('');

  const [layerHeaders, setLayerHeaders] = useState(headers);

  const [fieldsAll, setFieldsAll] = useState<string[]>([]);

  const emptyHeader = '-';
  useEffect(() => {
    setFieldsAll([emptyHeader, ...headers]);
  }, [headers]);

  useEffect(() => {
    setCategoryCol(headers[0]);
    setValueCol(headers[1]);
    const typedData = preprocessDataForVisualisation(data);
    // setting the axis based on the data type
    if (typedData && typedData.length > 0) {
      const firstRow = data[0];
      const keyHeader = headers.filter((item: any) => {
        return typeof firstRow[item] == 'string';
      });
      const scalarHeaders = headers.filter((item: any) => {
        return typeof firstRow[item] == 'number';
      });
      console.log('keyHeader', keyHeader);
      console.log('scalarHeaders', scalarHeaders);
      if (keyHeader.length >= 2) {
        setCategoryCol(keyHeader[0]);
        setCategoryCol(keyHeader[0]);
        setLayerHeaders([...keyHeader, ...scalarHeaders]);
      }
      if (scalarHeaders.length >= 1) {
        setValueCol(scalarHeaders[0]);
      }
    }
  }, [headers]);

  useEffect(() => {
    const typedData = preprocessDataForVisualisation(data);

    // the first layer is the category criteria
    setCategoryCol(layerHeaders[0]);

    const treeData = DFS([layerHeaders[0]], typedData);
    function DFS(hds: any[], layerData: any[]): any[] {
      if (hds.length === layerHeaders.length) {
        return [];
      }
      const layer = hds[hds.length - 1];
      const nextLayer = layerHeaders[layerHeaders.indexOf(layer) + 1];

      const categories = Array.from(
        new Set(layerData.map((item: any) => item[layer])),
      );

      const treeData: any[] = [];
      categories.forEach((category: string[]) => {
        const categoriesData = layerData.filter((item: any) => {
          return item[layer] === category;
        });

        const branchObj: any = {};
        branchObj.id =
          category +
          String(Date.now() + Math.random() * (Math.random() * 1000000));
        branchObj.value = category;
        const children = DFS([...hds, nextLayer], categoriesData);
        if (children.length > 0) {
          branchObj['children'] = children;
        } else {
          branchObj.id =
            category +
            String(Date.now() + Math.random() * (Math.random() * 1000000));
          branchObj.value = category;
        }
        treeData.push(branchObj);
      });
      return treeData;
    }
    console.log('treeData', treeData);
    setDataSource(treeData);
  }, [layerHeaders, valueCol, data]);

  const config = {
    data: {
      id: 'root',
      value: 'root' as any,
      children: dataSource,
    },
    nodeCfg: {
      type: 'circle',
    },
    layout: {
      type: 'compactBox',
      direction: 'RL' as any,
      getId: function getId(d: {
        id: string | number;
        value: string;
        children?: any[];
      }) {
        return d.id;
      },
      getHeight: () => {
        return 26;
      },
      getWidth: () => {
        return 26;
      },
      getVGap: () => {
        return 20;
      },
      getHGap: () => {
        return 30;
      },
      radial: true,
    },
    behaviors: ['drag-canvas', 'zoom-canvas', 'drag-node'],
  };

  return dataSource.length > 0 ? (
    <Grid>
      <RadialTreeGraph {...config} />

      <Grid container spacing={2}>
        {layerHeaders.length > 1 &&
          layerHeaders.slice(0, -1).map((layer, index) => {
            return (
              <Grid item>
                <Tooltip
                  title="Adjust the parent-chilren relationship between layers"
                  arrow
                  placement="top"
                >
                  <FormControl sx={{ m: 1, minWidth: 120 }}>
                    {`${index + 1}th Layer`}
                    <Select
                      value={fieldsAll.indexOf(layer)}
                      onChange={(e) => {
                        const newLayerHeaders = [...layerHeaders];
                        newLayerHeaders[index] = safeGetField(
                          fieldsAll,
                          Number(e.target.value),
                          emptyHeader,
                        );
                        setLayerHeaders(newLayerHeaders);
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
            );
          })}

        <Grid item>
          <Tooltip
            title="Magnitude field for sizes of the rectangles"
            arrow
            placement="top"
          >
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              source for size field
              <Select
                value={safeGetFieldIndex(fieldsAll, valueCol)}
                onChange={(e) => {
                  setValueCol(
                    safeGetField(
                      fieldsAll,
                      Number(e.target.value),
                      emptyHeader,
                    ),
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
          </Tooltip>
        </Grid>
      </Grid>
    </Grid>
  ) : (
    <div>Loading ...</div>
  );
};

export default TreeAntV;
