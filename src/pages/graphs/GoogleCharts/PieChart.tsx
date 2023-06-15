import { Chart } from 'react-google-charts';
import { VisDataProps } from '../../SparqlPage';

const options = {};

function PieChart(props: VisDataProps) {
  const { headers, data } = props;

  return (
    <Chart
      chartType="PieChart"
      width="100%"
      height="400px"
      data={data.length > 0 ? [headers, ...data] : []}
      options={options}
    />
  );
}

export default PieChart;
