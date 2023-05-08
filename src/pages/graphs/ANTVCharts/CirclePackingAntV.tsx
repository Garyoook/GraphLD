import { VisDataProps } from '@/pages/SparqlPage';
import { CirclePacking } from '@ant-design/plots';
import { useEffect, useState } from 'react';

const CirclePackingAntV = (props: VisDataProps) => {
  const { headers, data } = props;

  const [dataSource, setDataSource] = useState<any[]>([]);

  // axis, set to states for future column switching requirements
  const [xField, setXField] = useState<string>('');
  const [yField, setYField] = useState<string>('');

  useEffect(() => {
    setXField(headers[0]);
    setYField(headers[1]);

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

    setDataSource(typedData);
  }, [headers, data]);

  const config = {
    autoFit: true,
    padding: 0,
    data: dataSource,
    sizeField: 'r',
    color: 'rgb(252, 253, 191)-rgb(231, 82, 99)-rgb(183, 55, 121)',
    // 自定义 label 样式
    label: {
      formatter: ({ name }: any) => {
        return name !== 'root' ? name : '';
      },
      // 偏移
      offsetY: 8,
      style: {
        fontSize: 12,
        textAlign: 'center',
        fill: 'rgba(0,0,0,0.65)',
      },
    },
    // legend: false,
  };
  return <CirclePacking {...config} />;
};

export default CirclePackingAntV;
