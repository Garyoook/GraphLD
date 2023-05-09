import { VisDataProps } from '@/pages/SparqlPage';
import { Pie } from '@ant-design/plots';
import { FormControl, Grid, MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';
import { preprocessData } from './utils';

const PieChartAntV = (props: VisDataProps) => {
  const { headers, data } = props;

  const [dataSource, setDataSource] = useState<any[]>([]);

  // axis, set to states for future column switching requirements
  const [angleField, setAngleField] = useState<string>('');
  const [colorField, setColorField] = useState<string>('');

  const [fieldsAll, setFieldsAll] = useState<string[]>([]);
  useEffect(() => {
    setFieldsAll(headers);
  }, [headers]);

  useEffect(() => {
    setColorField(headers[0]);
    setAngleField(headers[1]);

    const typedData = preprocessData(data);

    setDataSource(typedData);
  }, [headers, data]);
  const config = {
    appendPadding: 10,
    data: dataSource,
    angleField,
    colorField,
    radius: 0.75,
    label: {
      type: 'spider',
      labelHeight: 28,
      content: '{name}\n{percentage}',
    },
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
    ],
  };

  return dataSource.length > 0 ? (
    <Grid>
      <Pie {...config} />

      <Grid container spacing={2}>
        <Grid item>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            source for quantity field
            <Select
              value={fieldsAll.indexOf(angleField)}
              onChange={(e) => {
                setAngleField(fieldsAll[Number(e.target.value)]);
              }}
            >
              {fieldsAll.map((item, index) => {
                return <MenuItem value={index}>{item}</MenuItem>;
              })}
            </Select>
          </FormControl>
        </Grid>

        <Grid item>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            source for catorization field
            <Select
              value={fieldsAll.indexOf(colorField)}
              onChange={(e) => {
                setColorField(fieldsAll[Number(e.target.value)]);
              }}
            >
              {fieldsAll.map((item, index) => {
                return <MenuItem value={index}>{item}</MenuItem>;
              })}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Grid>
  ) : (
    <div>No Data Available</div>
  );
};

export default PieChartAntV;
