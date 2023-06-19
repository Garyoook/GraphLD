import { ChoroplethMap } from '@ant-design/maps';
import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';

// ! warning: this is experimental map and not connected to query, see GooglrCharts/ChoroplethMap that one is used in GraphLD.
// ! warning: this is experimental map and not connected to query, see GooglrCharts/ChoroplethMap that one is used in GraphLD.

function ChoroplethMapAntV(props: any) {
  //   const { headers, data } = props;

  const [data, setData] = useState({ type: 'FeatureCollection', features: [] });

  useEffect(() => {
    asyncFetch();
  }, []);
  // ! warning: this is experimental map and not connected to query, see GooglrCharts/ChoroplethMap that one is used in GraphLD.
  // ! warning: this is experimental map and not connected to query, see GooglrCharts/ChoroplethMap that one is used in GraphLD.

  const asyncFetch = () => {
    fetch(
      'https://gw.alipayobjects.com/os/bmw-prod/d6da7ac1-8b4f-4a55-93ea-e81aa08f0cf3.json',
    )
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => {
        console.log('fetch data failed', error);
      });
  };
  const config = {
    map: {
      type: 'mapbox',
      style: 'blank',
      center: [120.19382669582967, 30.258134],
      zoom: 3,
      pitch: 0,
    },
    source: {
      data: data,
      parser: {
        type: 'geojson',
      },
    },
    autoFit: true,
    color: {
      field: 'adcode',
      value: [
        'rgb(239,243,255)',
        'rgb(189,215,231)',
        'rgb(107,174,214)',
        'rgb(49,130,189)',
        'rgb(8,81,156)',
      ],
      scale: {
        type: 'quantile',
      },
    },
    style: {
      opacity: 1,
      stroke: 'rgb(93,112,146)',
      lineWidth: 0.6,
      lineOpacity: 1,
    },
    state: {
      active: true,
    },
    label: {
      visible: true,
      field: 'name',
      style: {
        fill: '#000',
        opacity: 0.8,
        fontSize: 10,
        stroke: '#fff',
        strokeWidth: 1.5,
        textAllowOverlap: false,
        padding: [5, 5],
      },
    },
    tooltip: {
      items: ['name', 'adcode'],
    },
    zoom: {
      position: 'bottomright',
    },
    legend: {
      position: 'bottomleft',
    },
    // ! warning: this is experimental map and not connected to query, see GooglrCharts/ChoroplethMap that one is used in GraphLD.
    // ! warning: this is experimental map and not connected to query, see GooglrCharts/ChoroplethMap that one is used in GraphLD.
  };

  return (
    <Grid minHeight={500}>
      <ChoroplethMap {...config} />
    </Grid>
  );
}
// ! warning: this is experimental map and not connected to query, see GooglrCharts/ChoroplethMap that one is used in GraphLD.
// ! warning: this is experimental map and not connected to query, see GooglrCharts/ChoroplethMap that one is used in GraphLD.

export default ChoroplethMapAntV;
