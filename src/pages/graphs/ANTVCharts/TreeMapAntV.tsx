import { VisDataProps } from '@/pages/SparqlPage';
import { Treemap } from '@ant-design/plots';
import { FormControl, Grid, MenuItem, Select, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import './TreeMapAntV.scss';
import { preprocessData } from './utils';

const TreeMapAntV = (props: VisDataProps) => {
  const { headers, data } = props;

  const [dataSource, setDataSource] = useState<any[]>([]);

  const [categoryCol, setCatogoryCol] = useState<string>('');
  const [idCol, setIdCol] = useState<string>('');
  const [valueCol, setValueCol] = useState<string>('');

  const [renderMode, setRenderMode] = useState(0);
  const [drillDownOpen, setDrillDownOpen] = useState(false);

  const [fieldsAll, setFieldsAll] = useState<string[]>([]);
  useEffect(() => {
    setFieldsAll(headers);
  }, [headers]);

  const renderModes = [
    { name: 'Overview', drillDown: false },
    { name: 'Layers', drillDown: true },
  ];

  useEffect(() => {
    setCatogoryCol(headers[0]);
    setIdCol(headers[1]);
    setValueCol(headers[2]);
  }, [headers]);

  const swapColumns = () => {
    setCatogoryCol(idCol);
    setIdCol(categoryCol);
    // setValueCol(headers[2]);
  };

  useEffect(() => {
    const typedData = preprocessData(data);

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
    colorField: categoryCol,
    interactions: [
      {
        type: 'view-zoom',
      },
      {
        type: 'drag-move',
      },
      { type: 'element-active' },
    ],
    drilldown: {
      enabled: drillDownOpen,
      breadCrumb: {
        rootText: 'Root',
        position: 'top-left' as 'top-left',
      },
    },
    tooltip: {
      follow: true,
      enterable: true,
      offset: 5,
      // customContent: (value, items) => {
      //   if (!items || items.length <= 0) return;
      //   const { data: itemData } = items[0];
      //   const parent = itemData.path[1];
      //   const root = itemData.path[itemData.path.length - 1];
      //   return (
      // 	`<div class='container'>` +
      // 	`<div class='title'>${itemData.name}</div>` +
      // 	`<div class='tooltip-item'><span>Value</span><span>${itemData.value}</span></div>` +
      // 	`<div class='tooltip-item'><span>Name</span><span>${itemData.name}</span></div>` +
      // 	`<div class='tooltip-item'><span>Ratio</span><span>${((itemData.value / parent.value) * 100).toFixed(
      // 	  2,
      // 	)}%</span></div>` +
      // 	`</div>`
      //   );
      // },
    },
  };

  return (
    <Grid>
      <Treemap {...config} />

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
                value={fieldsAll.indexOf(categoryCol)}
                onChange={(e) => {
                  setCatogoryCol(fieldsAll[Number(e.target.value)]);
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
                value={fieldsAll.indexOf(idCol)}
                onChange={(e) => {
                  setIdCol(fieldsAll[Number(e.target.value)]);
                }}
              >
                {fieldsAll.map((item, index) => {
                  return <MenuItem value={index}>{item}</MenuItem>;
                })}
              </Select>
            </FormControl>
          </Tooltip>
        </Grid>

        {/* <Grid item xs={12}>
          <Tooltip
            title="If you find visualisation incorrect, please try to fix by swapping columns"
            arrow
            placement="right"
          >
            <Button
              variant="outlined"
              size="large"
              style={{ textTransform: 'none' }}
              onClick={() => swapColumns()}
            >
              Swap columns
            </Button>
          </Tooltip>
        </Grid> */}

        <Grid item xs={12}>
          <Tooltip
            title="Change render mode: Overview or Layers"
            arrow
            placement="right"
          >
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              Render Mode
              <Select
                value={renderMode}
                onChange={(e) => {
                  setRenderMode(Number(e.target.value));
                  setDrillDownOpen(
                    renderModes[Number(e.target.value)].drillDown,
                  );
                }}
              >
                {renderModes.map((item, index) => {
                  return <MenuItem value={index}>{item.name}</MenuItem>;
                })}
              </Select>
              {/* <FormHelperText>Select Render Mode</FormHelperText> */}
            </FormControl>
          </Tooltip>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default TreeMapAntV;
