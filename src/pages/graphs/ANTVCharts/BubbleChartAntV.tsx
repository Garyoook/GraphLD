import { VisDataProps } from '@/pages/SparqlPage';
import { Scatter } from '@ant-design/plots';
import { FormControl, Grid, MenuItem, Select, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';

const BubbleChartAntV = (props: VisDataProps) => {
  const { headers, data } = props;

  const [dataSource, setDataSource] = useState<any[]>([]);

  // axis, set to states for future column switching requirements
  const [xField, setXField] = useState<string>('');
  const [yField, setYField] = useState<string>('');
  const [sizeField, setSizeField] = useState('');
  const [colorField, setColorField] = useState('');

  const [fieldsAll, setFieldsAll] = useState<string[]>([]);
  useEffect(() => {
    setFieldsAll(headers);
  }, [headers]);

  useEffect(() => {
    setXField(headers[0]);
    setYField(headers[1]);
    setSizeField(headers[2]);
    setColorField(headers[3]);

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

    console.log('headers: ', headers);
    console.log('data: ', typedData);

    setDataSource(typedData);
  }, [headers, data]);

  const config = {
    appendPadding: 30,
    data: dataSource,
    xField,
    yField,
    sizeField,
    colorField,
    color: ['#ffd500', '#82cab2', '#193442', '#d18768', '#7e827a'],
    size: [4, 40] as any,
    shape: 'circle',
    pointStyle: {
      fillOpacity: 0.8,
      stroke: '#bbb',
    },
    xAxis: {
      //   min: -25,
      //   max: 5,
      grid: {
        line: {
          style: {
            stroke: '#eee',
          },
        },
      },
      line: {
        style: {
          stroke: '#aaa',
        },
      },
    },
    yAxis: {
      line: {
        style: {
          stroke: '#aaa',
        },
      },
    },
    brush: {
      enabled: true,
      mask: {
        style: {
          fill: 'rgba(0.15,0,0,255)',
        },
      },
    },
    // quadrant: {
    //   xBaseline: 0,
    //   yBaseline: 0,
    //   labels: [
    //     {
    //       content: 'Male decrease,\nfemale increase',
    //     },
    //     {
    //       content: 'Female decrease,\nmale increase',
    //     },
    //     {
    //       content: 'Female & male decrease',
    //     },
    //     {
    //       content: 'Female &\n male increase',
    //     },
    //   ],
    // },
  };

  return (
    <Grid>
      <Scatter {...config} />

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

        <Grid item>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            source for size field
            <Select
              value={fieldsAll.indexOf(sizeField)}
              onChange={(e) => {
                setSizeField(fieldsAll[Number(e.target.value)]);
              }}
            >
              {fieldsAll.map((item, index) => {
                return <MenuItem value={index}>{item}</MenuItem>;
              })}
            </Select>
          </FormControl>
        </Grid>

        <Grid item>
          <Tooltip
            title="Used for catorization of data points (if applicable)"
            arrow
            placement="top"
          >
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              source for color field
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
          </Tooltip>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default BubbleChartAntV;
