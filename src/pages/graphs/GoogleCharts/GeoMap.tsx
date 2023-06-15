import { Chart } from 'react-google-charts';
import { VisDataProps } from '../../SparqlPage';

function GeoMap(props: VisDataProps) {
  const { headers, data } = props;

  console.log('GeoMap data: ', headers, data);

  const data_dummy = [
    ['Country', 'Popularity'],
    ['Germany', 200],
    ['United States', 300],
    ['Brazil', 400],
    ['Canada', 500],
    ['France', 600],
    ['RU', 700],
  ];

  const options = {
    colorAxis: {
      colors: ['rgb(210, 225, 210)', 'rgb(30, 200, 40)', 'rgb(15, 100, 30)'],
    },
    backgroundColor: '#d1f4ff',
    datalessRegionColor: '#fff',
    defaultColor: '#f5f5f5',
  };

  return (
    <Chart
      chartEvents={[
        {
          eventName: 'select',
          callback: ({ chartWrapper }) => {
            const chart = chartWrapper.getChart();
            const selection = chart.getSelection();
            if (selection.length === 0) return;
            const region = data[selection[0].row + 1];
            console.log('Selected : ' + region);
          },
        },
      ]}
      chartType="GeoChart"
      width="100%"
      height="400px"
      data={[headers, ...data]}
      options={options}
    />
  );
}

export default GeoMap;
