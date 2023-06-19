import { VisDataProps } from '@/pages/SparqlPage';
import { Sunburst } from '@ant-design/plots';
import { FormControl, Grid, MenuItem, Select, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import './TreeMapAntV.scss';
import {
  preprocessDataForVisualisation,
  safeGetField,
  safeGetFieldIndex,
} from './utils';

const SunBurst = (props: VisDataProps) => {
  const { headers, data } = props;

  const [dataSource, setDataSource] = useState<any[]>([]);

  const [categoryCol, setCatogoryCol] = useState<string>('');
  const [idCol, setIdCol] = useState<string>('');
  const [valueCol, setValueCol] = useState<string>('');

  const [renderMode, setRenderMode] = useState(0);
  const [drillDownOpen, setDrillDownOpen] = useState(false);

  const [fieldsAll, setFieldsAll] = useState<string[]>([]);

  const emptyHeader = '-';
  useEffect(() => {
    setFieldsAll([emptyHeader, ...headers]);
  }, [headers]);

  const renderModes = [
    { name: 'Overview', drillDown: false },
    { name: 'Layers', drillDown: true },
  ];

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

  const swapColumns = () => {
    setCatogoryCol(idCol);
    setIdCol(categoryCol);
    // setValueCol(headers[2]);
  };

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
    setDataSource(treeData);
  }, [idCol, categoryCol, valueCol, data]);

  const config = {
    data: {
      name: 'root',
      children: dataSource,
    },
    innerRadius: 0.3,
    // colorField: 'name',
    interactions: [
      {
        type: 'element-active',
      },
    ],
    hierarchyConfig: {
      field: 'value',
    } as any,
    label: {
      style: {
        fontSize: 12,
        textAlign: 'center',
        // fill: 'rgba(0,0,0,0.65)',
      },
    },
  };

  return (
    <Grid>
      <Sunburst {...config} />

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
  );
};

export default SunBurst;
