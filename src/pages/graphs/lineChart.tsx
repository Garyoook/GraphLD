// import { Chart } from 'react-google-charts';
// import { VisDataProps } from '../SparqlPage';

// function LineChart(props: VisDataProps) {
//   const { headers, data } = props;

//   const options = {
//     hAxis: { title: headers[0] },
//     vAxis: { title: headers[1] },
//   };

//   return (
//     <Chart
//       chartType="LineChart"
//       width="100%"
//       height="400px"
//       data={data.length > 0 ? [headers, ...data] : []}
//       options={options}
//     />
//   );
// }

import { Line } from '@ant-design/plots';
import { useEffect, useState } from 'react';

function LineChart(props: { headers: string[]; data: any[] }) {
  const { headers, data } = props;

  const [dataSource, setDataSource] = useState<any[]>([]);

  // axis, set to states t=for future column switching requirements
  const [xField, setXField] = useState<string>('');
  const [yField, setYField] = useState<string>('');
  const [seriesField, setSeriesField] = useState<string>('');

  useEffect(() => {
    setSeriesField(headers[0]);
    setXField(headers[1]);
    setYField(headers[2]);

    const typedData = data
      .map((item: any) => {
        for (const key in item) {
          if (item.hasOwnProperty(key)) {
            const element = item[key];
            if (!isNaN(element)) {
              item[key] = Number(element);
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
    seriesField,
    // xAxis: {
    //   type: 'time',
    // },
    yAxis: {
      type: 'log',
      label: {
        // reformat the y axis
        formatter: (v: string) =>
          `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`),
      },
    },
  };

  return <Line {...config} />;
}

export default LineChart;
