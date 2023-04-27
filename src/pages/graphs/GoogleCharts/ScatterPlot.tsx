import { Chart } from 'react-google-charts';
import { VisDataProps } from '../../SparqlPage';

function ScatterPlot(props: VisDataProps) {
  const { headers, data } = props;

  const options = {
    pointSize: 4,

    hAxis: { title: headers[0] },
    vAxis: { title: headers[1] },
  };

  return (
    <Chart
      chartType="Scatter"
      width="100%"
      height="400px"
      data={data.length > 0 ? [headers, ...data] : []}
      options={options}
    />
  );
}

export default ScatterPlot;
