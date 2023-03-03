import { Chart } from "react-google-charts";

const options = {};

function PieChart(props: { data: any[] }) {
    const { data } = props;
    const data_dummy = [
        ["Year", "Sales"],
        ["2014", 1000],
        ["2015", 1170],
        ["2016", 660],
        ["2017", 1030],
    ];
    return (
        <Chart
            chartType='PieChart'
            width='100%'
            height='400px'
            data={data.length > 0 ? data : data_dummy}
            options={options}
        />
    );
}

export default PieChart;
