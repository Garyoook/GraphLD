import { VisDataProps } from '@/pages/SparqlPage';
import { CirclePacking } from '@ant-design/plots';
import { FormControl, Grid, MenuItem, Select, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  preprocessDataForVisualisation,
  safeGetField,
  safeGetFieldIndex,
} from './utils';

const CirclePackingAntV = (props: VisDataProps) => {
  const { headers, data } = props;

  // const [dataSource, setDataSource] = useState<any>([]);

  const [treeData, setTreeData] = useState<any>({
    name: undefined,
    children: [],
  });

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
      // console.log('keyHeader', keyHeader);
      // console.log('scalarHeaders', scalarHeaders);
      if (keyHeader.length >= 2) {
        setCatogoryCol(keyHeader[0]);
        setIdCol(keyHeader[1]);
      }
      if (scalarHeaders.length >= 1) {
        setValueCol(scalarHeaders[0]);
      }
    }
  }, [headers]);

  useEffect(() => {
    const typedData = preprocessDataForVisualisation(data);

    const catogories = Array.from(
      new Set(typedData.map((item: any) => item[categoryCol])),
    );

    const treeData: any[] = [];

    catogories.forEach((catogory: string[]) => {
      const branchObj: any = {};
      branchObj.name = catogory;
      branchObj[categoryCol] = catogory;
      const leafData = typedData.filter(
        (item: any) => item[categoryCol] === catogory,
      );

      branchObj['children'] = leafData.map((item: any) => {
        const leafObj: any = {};
        leafObj.name = item[idCol] || 'unknown';
        leafObj.value = item[valueCol] || 0;
        return leafObj.name ? leafObj : item;
      });
      treeData.push(branchObj);
    });

    console.log('treeData', {
      name: 'root',
      children: treeData,
    });

    if (treeData.length > 0) {
      setTreeData({
        name: 'root',
        children: treeData,
      });
    }
  }, [idCol, categoryCol, valueCol, data]);

  const config = {
    autoFit: true,
    padding: 0,
    data: treeData,
    sizeField: 'r',
    colorField: 'r',
    // color ranges, need to be configured better in future.
    color: 'rgb(252, 253, 191)-rgb(210, 160, 140)-rgb(200, 100, 122)',
    pointStyle: {
      stroke: 'rgb(183, 55, 121)',
      lineWidth: 0.5,
    },
    // legend: false,
    drilldown: {
      enabled: true,
      breadCrumb: {
        position: 'top-left' as 'top-left',
      },
    },
    label: {
      formatter: ({ name }: any) => {
        return name !== 'root' ? name : '';
      },
      // 偏移
      offsetY: 8,
      style: {
        fontSize: 12,
        textAlign: 'center',
        fill: 'rgba(0,0,0,0.65)',
      },
    },
  };

  return treeData.name ? (
    <Grid>
      <CirclePacking {...config} />

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

export default CirclePackingAntV;
