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

  const [categoryCol, setCatogoryCol] = useState<string>('');
  const [idCol, setIdCol] = useState<string>('');
  const [valueCol, setValueCol] = useState<string>('');

  const [fieldsAll, setFieldsAll] = useState<string[]>([]);

  const emptyHeader = '-';
  useEffect(() => {
    setFieldsAll([emptyHeader, ...headers]);
  }, [headers]);

  useEffect(() => {
    setCatogoryCol(headers[0]);
    setIdCol(headers[1]);
    setValueCol(headers[2]);
  }, [headers]);

  useEffect(() => {
    const typedData = preprocessDataForVisualisation(data);

    const catogories = Array.from(
      new Set(typedData.map((item: any) => item[categoryCol])),
    );

    const treeData: any[] = [];

    catogories.forEach((catogory: string[]) => {
      const branchObj: any = {};
      branchObj.id = catogory;
      branchObj.value = catogory;
      const leafData = typedData.filter(
        (item: any) => item[categoryCol] === catogory,
      );

      branchObj['children'] = leafData.map((item: any) => {
        const leafObj: any = {};
        leafObj.id =
          item[idCol] ||
          String(Date.now() + Math.random() * (Math.random() * 1000000));
        leafObj.value = item[idCol] || 0;
        return leafObj.id ? leafObj : item;
      });
      treeData.push(branchObj);
    });

    setDataSource(treeData);
  }, [idCol, categoryCol, valueCol, data]);

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
        <Grid item>
          <Tooltip
            title="For catogorise data by different colors"
            arrow
            placement="top"
          >
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              source for catogories field
              <Select
                value={safeGetFieldIndex(fieldsAll, categoryCol)}
                onChange={(e) => {
                  setCatogoryCol(
                    safeGetField(
                      fieldsAll,
                      Number(e.target.value),
                      emptyHeader,
                    ),
                  );
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
          <Tooltip
            title="For the displayed id of the visualised data"
            arrow
            placement="top"
          >
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              source for identification field
              <Select
                value={safeGetFieldIndex(fieldsAll, idCol)}
                onChange={(e) => {
                  setIdCol(
                    safeGetField(
                      fieldsAll,
                      Number(e.target.value),
                      emptyHeader,
                    ),
                  );
                }}
              >
                {fieldsAll.map((item, index) => {
                  return <MenuItem value={index}>{item}</MenuItem>;
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
