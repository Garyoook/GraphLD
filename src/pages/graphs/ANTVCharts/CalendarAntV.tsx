// @ts-nocheck
import { VisDataProps } from '@/pages/SparqlPage';
import { G2, Heatmap } from '@ant-design/plots';
import { FormControl, Grid, MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';
import { preprocessData } from './utils';

const CalendarChart = (props: VisDataProps) => {
  const { headers, data } = props;

  const [dataSource, setDataSource] = useState<any[]>([]);

  // axis, set to states for future column switching requirements
  const [dateField, setDateField] = useState<string>('');
  //   const [yField, setYField] = useState<string>('');
  const [colorField, setColorField] = useState<string>('');

  const [fieldsAll, setFieldsAll] = useState<string[]>([]);
  useEffect(() => {
    setFieldsAll(headers);
  }, [headers]);

  useEffect(() => {
    setDateField(headers[0]);
    // setYField(headers[1]);
    headers[1] && setColorField(headers[1]);
  }, [headers, data]);

  useEffect(() => {
    let dateData = preprocessData(data);
    if (dateData.length > 0 && dateData[0][dateField]) {
      dateData = dateData
        .map((item: any) => {
          const d_str = item[dateField];
          const d = new Date(d_str);
          const color_strength = item[colorField] | 100;
          return {
            date: d_str,
            date_obj: d,
            month: d.getMonth(),
            day: d.getDay(),
            color_strength,
          };
        })
        .sort((a, b) => a.date_obj - b.date_obj)
        .slice(-5, -1);

      console.log('calendar data: ', dateData);

      const completeDateData = [];

      const d_start = dateData[0];
      const d_end = dateData[dateData.length - 1];
      let week = 0;
      for (
        let d = new Date(d_start.date);
        d <= new Date(d_end.date);
        d.setDate(d.getDate() + 1)
      ) {
        const d_str = d.toISOString();
        completeDateData.push({
          date: d_str,
          //   date_obj: d,
          week,
          month: d.getMonth(),
          day: d.getDay(),
          color_strength: 0,
        });
        week += d.getDay() == 6 ? 1 : 0;
      }

      for (const d of dateData) {
        let week = 0;
        if (
          completeDateData.some((item) => {
            week = item.week;
            const d1 = new Date(item.date);
            const d2 = new Date(d.date);
            d1.setHours(0);
            d2.setHours(0);
            return d1.toISOString() == d2.toISOString();
          })
        ) {
          d.week = week;
        }

        completeDateData.push(d);
      }

      console.log('complete calendar data', completeDateData);
      setDataSource(completeDateData);
    }
  }, [dateField, colorField]);

  G2.registerShape('polygon', 'boundary-polygon', {
    draw(cfg, container) {
      const group = container.addGroup();
      const attrs = {
        stroke: '#fff',
        lineWidth: 1,
        fill: cfg.color,
        paht: [],
      };
      const points = cfg.points;
      const path = [
        ['M', points[0].x, points[0].y],
        ['L', points[1].x, points[1].y],
        ['L', points[2].x, points[2].y],
        ['L', points[3].x, points[3].y],
        ['Z'],
      ]; // @ts-ignore

      attrs.path = this.parsePath(path);
      group.addShape('path', {
        attrs,
      });

      if (cfg.data.lastWeek) {
        const linePath = [
          ['M', points[2].x, points[2].y],
          ['L', points[3].x, points[3].y],
        ]; // 最后一周的多边形添加右侧边框

        group.addShape('path', {
          attrs: {
            path: this.parsePath(linePath),
            lineWidth: 4,
            stroke: '#404040',
          },
        });

        if (cfg.data.lastDay) {
          group.addShape('path', {
            attrs: {
              path: this.parsePath([
                ['M', points[1].x, points[1].y],
                ['L', points[2].x, points[2].y],
              ]),
              lineWidth: 4,
              stroke: '#404040',
            },
          });
        }
      }

      return group;
    },
  });
  const config = {
    data: dataSource,
    height: 400,
    autoFit: false,
    xField: 'week',
    yField: 'day',
    colorField: 'color_strength',
    reflect: 'y',
    shape: 'boundary-polygon',
    meta: {
      day: {
        type: 'cat',
        values: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      },
      week: {
        type: 'cat',
      },
      //   commits: {
      //     sync: true,
      //   },
      date: {
        type: 'cat',
      },
    },
    yAxis: {
      grid: null,
    },
    tooltip: {
      title: dateField,
      showMarkers: false,
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
    xAxis: {
      position: 'top',
      tickLine: null,
      line: null,
      label: {
        offset: 12,
        style: {
          fontSize: 12,
          fill: '#666',
          textBaseline: 'top',
        },
        // formatter: (val: string) => {
        //   if (val == '2') {
        //     return 'MAY';
        //   } else if (val == '6') {
        //     return 'JUN';
        //   } else if (val == '10') {
        //     return 'JUL';
        //   } else if (val == '15') {
        //     return 'AUG';
        //   } else if (val == '19') {
        //     return 'SEP';
        //   } else if (val == '24') {
        //     return 'OCT';
        //   }

        //   return '';
        // },
      },
    },
  };

  return dataSource.length > 0 ? (
    <Grid>
      <Heatmap {...config} />

      <Grid container spacing={2}>
        <Grid item>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            source for date field
            <Select
              value={fieldsAll.indexOf(dateField)}
              onChange={(e) => {
                setDateField(fieldsAll[Number(e.target.value)]);
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
        </Grid>
      </Grid>
    </Grid>
  ) : (
    <div>Loading ...</div>
  );
};

export default CalendarChart;
