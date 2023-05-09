import { VisDataProps } from '@/pages/SparqlPage';
import { WordCloud } from '@ant-design/plots';
import { FormControl, Grid, MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';
import { preprocessData } from './utils';

const BarChartAntV = (props: VisDataProps) => {
  const { headers, data } = props;

  const [dataSource, setDataSource] = useState<any[]>([]);

  // axis, set to states for future column switching requirements
  const [wordField, setWordField] = useState<string>('');
  const [weightField, setWeightField] = useState<string>('');

  const [fieldsAll, setFieldsAll] = useState<string[]>([]);
  useEffect(() => {
    setFieldsAll(headers);
  }, [headers]);

  useEffect(() => {
    setWordField(headers[0]);
    setWeightField(headers[1]);

    const typedData = preprocessData(data);

    setDataSource(typedData);
  }, [headers, data]);

  const config = {
    data,
    wordField,
    weightField,
    // color: '#122c6a',
    colorField: wordField,
    wordStyle: {
      fontFamily: 'Verdana',
      fontSize: [24, 80] as any,
    },
    // 设置交互类型
    interactions: [
      {
        type: 'element-active',
      },
    ],
    state: {
      active: {
        // 这里可以设置 active 时的样式
        style: {
          lineWidth: 3,
        },
      },
    },
  };

  return dataSource.length > 0 ? (
    <Grid>
      <WordCloud {...config} />

      <Grid container spacing={2}>
        <Grid item>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            source for words
            <Select
              value={fieldsAll.indexOf(wordField)}
              onChange={(e) => {
                setWordField(fieldsAll[Number(e.target.value)]);
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
            source for weight
            <Select
              value={fieldsAll.indexOf(weightField)}
              onChange={(e) => {
                setWeightField(fieldsAll[Number(e.target.value)]);
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
    <div>Loading ...</div>
  );
};

export default BarChartAntV;
