import { VisDataProps } from '@/pages/SparqlPage';
import { Chord } from '@ant-design/plots';
import { FormControl, Grid, MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';

const ChordAntV = (props: VisDataProps) => {
  const { headers, data } = props;

  const [dataSource, setDataSource] = useState<any[]>([]);

  // fields
  const [sourceField, setSourceField] = useState<string>('');
  const [targetField, setTargetField] = useState<string>('');
  const [weightField, setWeightField] = useState<string>('');

  const [fieldsAll, setFieldsAll] = useState<string[]>([]);
  useEffect(() => {
    setFieldsAll(headers);
  }, [headers]);

  useEffect(() => {
    setSourceField(headers[0]);
    setTargetField(headers[1]);
    setWeightField(headers[2]);

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

    console.log('ChordAntV: typedData', typedData);
    setDataSource(typedData);
  }, [data, headers]);

  const config = {
    data: dataSource,
    sourceField,
    targetField,
    weightField,
    tooltip: {
      fields: ['name', 'source', 'target', 'value', 'isNode'],
      showContent: true,
      formatter: (datum: any) => {
        const { isNode, name, source, target, value } = datum;

        if (isNode) {
          return {
            name: `${name}(Source)`,
            value: dataSource
              .filter((d) => d[sourceField] === name)
              .reduce((a, b) => a + b[weightField], 0),
          };
        }

        return {
          name: `${source} -> ${target}`,
          value,
        };
      },
    },
  };

  return dataSource.length > 0 ? (
    <Grid>
      <Chord {...config} />
      <Grid container spacing={2}>
        <Grid item>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            source field
            <Select
              value={fieldsAll.indexOf(sourceField)}
              onChange={(e) => {
                setSourceField(fieldsAll[Number(e.target.value)]);
              }}
            >
              {fieldsAll.map((item, index) => {
                return <MenuItem value={index}>{item}</MenuItem>;
              })}
            </Select>
          </FormControl>
        </Grid>

        <Grid item>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            target field
            <Select
              value={fieldsAll.indexOf(targetField)}
              onChange={(e) => {
                setTargetField(fieldsAll[Number(e.target.value)]);
              }}
            >
              {fieldsAll.map((item, index) => {
                return <MenuItem value={index}>{item}</MenuItem>;
              })}
            </Select>
          </FormControl>
        </Grid>

        <Grid item>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            weight field
            <Select
              value={fieldsAll.indexOf(weightField)}
              onChange={(e) => {
                setWeightField(fieldsAll[Number(e.target.value)]);
              }}
            >
              {fieldsAll.map((item, index) => {
                return <MenuItem value={index}>{item}</MenuItem>;
              })}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Grid>
  ) : (
    <div>Loading ... </div>
  );
};

export default ChordAntV;
