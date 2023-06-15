import { Chart } from 'react-google-charts';
import { VisDataProps } from '../../SparqlPage';

const options = {};

function BarChart(props: VisDataProps) {
  const { headers, data } = props;

  return (
    <Chart
      chartType="Bar"
      width="100%"
      height="400px"
      data={data.length > 0 ? [headers, ...data] : []}
      options={options}
    />
  );
}

export default BarChart;
