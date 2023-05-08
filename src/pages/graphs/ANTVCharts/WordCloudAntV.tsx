import { VisDataProps } from '@/pages/SparqlPage';
import { WordCloud } from '@ant-design/plots';
import { FormControl, Grid, MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';

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

    const typedData = data
      .map((item: any) => {
        for (const key in item) {
          if (item.hasOwnProperty(key)) {
            const element = item[key];
            if (!isNaN(element)) {
              item[key] = Number(element);
            }

            // below code is used to remove LD PREFIX from the data
            if (
              typeof element == 'string' &&
              element.match(/http:\/\/www\.semwebtech\.org\/mondial\/10\/(.*)/)
            ) {
              const newValue = element.split('/').reverse()[1];
              item[key] = newValue;
            }
          }
        }
        return item;
      })
      .sort((a: any, b: any) => a[headers[1]] - b[headers[1]]);

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
