import { Chart } from 'react-google-charts';
import { VisDataProps } from '../../SparqlPage';

const options = {};

function LineChart(props: VisDataProps) {
  const { headers, data } = props;

  return (
    <Chart
      chartType="Line"
      width="100%"
      height="400px"
      data={data.length > 0 ? [headers, ...data] : []}
      options={options}
    />
  );
}

export default LineChart;
