import { VisDataProps } from '@/pages/SparqlPage';
import { WordCloud } from '@ant-design/plots';
import { FormControl, Grid, MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  preprocessDataForVisualisation,
  safeGetField,
  safeGetFieldIndex,
} from './utils';

const BarChartAntV = (props: VisDataProps) => {
  const { headers, data } = props;

  const [dataSource, setDataSource] = useState<any[]>([]);

  // axis, set to states for future column switching requirements
  const [wordField, setWordField] = useState<string>('');
  const [weightField, setWeightField] = useState<string>('');

  const [fieldsAll, setFieldsAll] = useState<string[]>([]);

  const emptyHeader = '-';
  useEffect(() => {
    setFieldsAll([emptyHeader, ...headers]);
  }, [headers]);

  useEffect(() => {
    setWordField(headers[0]);
    setWeightField(headers[1]);

    const typedData = preprocessDataForVisualisation(data);

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
      if (keyHeader.length >= 1) {
        setWordField(keyHeader[0]);
      }
      if (scalarHeaders.length === 1) {
        setWeightField(scalarHeaders[0]);
      }
      if (scalarHeaders.length === 2) {
        setWordField(scalarHeaders[0]);
        setWeightField(scalarHeaders[1]);
      }
    }

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
    tooltip: {
      // fields: ['value'],
      showContent: true,
      formatter: (datum: any) => {
        const { text, value } = datum;

        return {
          name: text,
          value: `(${weightField}) ${value}`,
        };
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
              value={safeGetFieldIndex(fieldsAll, wordField)}
              onChange={(e) => {
                setWordField(
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

        <Grid item>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            source for weight
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
    <div>Loading ...</div>
  );
};

export default BarChartAntV;
