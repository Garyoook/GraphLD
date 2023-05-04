import { VisDataProps } from '@/pages/SparqlPage';
import { Treemap } from '@ant-design/plots';
import { useEffect, useState } from 'react';
import './TreeMapAntV.scss';

const TreeMapAntV = (props: VisDataProps) => {
  const { headers, data } = props;

  const [dataSource, setDataSource] = useState<any[]>([]);

  // axis, set to states t=for future column switching requirements
  const [categoryCol, setCatogoryCol] = useState<string>('');
  const [idCol, setIdCol] = useState<string>('');
  const [valueCol, setValueCol] = useState<string>('');

  const [treeData, setTreeData] = useState<any[]>([]);

  console.log('props data:', props);

  useEffect(() => {
    setCatogoryCol(headers[0]); // continent
    setIdCol(headers[1]); // carcode
    setValueCol(headers[2]); // population
  }, [headers]);

  useEffect(() => {
    const typedData = data.map((item: any) => {
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
    });

    console.log('typedData', typedData);

    const catogories = Array.from(
      new Set(typedData.map((item: any) => item[categoryCol])),
    );

    const treeData: any[] = [];

    catogories.forEach((catogory: string[]) => {
      const branchObj: any = {};
      branchObj.name = catogory;
      branchObj[categoryCol] = catogory;
      const leafData = typedData.filter(
        (item: any) => item[categoryCol] === catogory,
      );

      branchObj['children'] = leafData.map((item: any) => {
        const leafObj: { name: string; value: number } = {};
        leafObj.name = item[idCol] || 'unknown';
        leafObj[idCol] = item[idCol] || 'unknown';
        leafObj.value = item[valueCol] || 0;
        return leafObj.name ? leafObj : item;
      });
      treeData.push(branchObj);
    });

    console.log('treeData', treeData);

    //   .sort((a: any, b: any) => a[headers[1]] - b[headers[1]]);

    // setTreeData(treeData);
    setDataSource({
      name: 'root',
      children: treeData,
    });
  }, [idCol, categoryCol, valueCol, data]);

  const config = {
    data: dataSource,
    colorField: categoryCol,
    // 为矩形树图增加缩放,拖拽交互
    interactions: [
      {
        type: 'view-zoom',
      },
      {
        type: 'drag-move',
      },
      { type: 'element-active' },
    ],
    tooltip: {
      follow: true,
      enterable: true,
      offset: 5,
      // customContent: (value, items) => {
      //   if (!items || items.length <= 0) return;
      //   const { data: itemData } = items[0];
      //   const parent = itemData.path[1];
      //   const root = itemData.path[itemData.path.length - 1];
      //   return (
      // 	`<div class='container'>` +
      // 	`<div class='title'>${itemData.name}</div>` +
      // 	`<div class='tooltip-item'><span>Value</span><span>${itemData.value}</span></div>` +
      // 	`<div class='tooltip-item'><span>Name</span><span>${itemData.name}</span></div>` +
      // 	`<div class='tooltip-item'><span>Ratio</span><span>${((itemData.value / parent.value) * 100).toFixed(
      // 	  2,
      // 	)}%</span></div>` +
      // 	`<div class='tooltip-item'><span>市场占比</span><span>${((itemData.value / root.value) * 100).toFixed(
      // 	  2,
      // 	)}%</span></div>` +
      // 	`</div>`
      //   );
      // },
    },
  };

  return <Treemap {...config} />;
};

export default TreeMapAntV;
