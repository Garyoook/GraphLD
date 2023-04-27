import { Chart } from 'react-google-charts';
import { VisDataProps } from '../../SparqlPage';

const options = {};

function BarChart(props: VisDataProps) {
  const { headers, data } = props;
  const data_dummy = [
    ['Year', 'Sales'],
    ['2014', 1000],
    ['2015', 1170],
    ['2016', 660],
    ['2017', 1030],
  ];
  return (
    <Chart
      chartType="Bar"
      width="100%"
      height="400px"
      data={data.length > 0 ? [headers, ...data] : data_dummy}
      options={options}
    />
  );
}

export default BarChart;
