import { VisDataProps } from '@/pages/SparqlPage';
import { Column } from '@ant-design/plots';
import { FormControl, Grid, MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';

const BarChartAntV = (props: VisDataProps) => {
  const { headers, data } = props;

  const [dataSource, setDataSource] = useState<any[]>([]);

  // axis, set to states for future column switching requirements
  const [xField, setXField] = useState<string>('');
  const [yField, setYField] = useState<string>('');

  const [fieldsAll, setFieldsAll] = useState<string[]>([]);
  useEffect(() => {
    setFieldsAll(headers);
  }, [headers]);

  useEffect(() => {
    setXField(headers[0]);
    setYField(headers[1]);

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
    data: dataSource,
    xField,
    yField,
    columnWidthRatio: 0.8,
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
  };
  return dataSource.length > 0 ? (
    <Grid>
      <Column {...config} />

      <Grid container spacing={2}>
        <Grid item>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            source for x axis
            <Select
              value={fieldsAll.indexOf(xField)}
              onChange={(e) => {
                setXField(fieldsAll[Number(e.target.value)]);
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
            source for y axis
            <Select
              value={fieldsAll.indexOf(yField)}
              onChange={(e) => {
                setYField(fieldsAll[Number(e.target.value)]);
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
