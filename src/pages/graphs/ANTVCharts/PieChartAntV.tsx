import { VisDataProps } from '@/pages/SparqlPage';
import { Pie } from '@ant-design/plots';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import {
  Button,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Tooltip,
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
  preprocessDataForVisualisation,
  safeGetField,
  safeGetFieldIndex,
} from './utils';

const PieChartAntV = (props: VisDataProps) => {
  const { headers, data } = props;

  const [dataSource, setDataSource] = useState<any[]>([]);

  // axis, set to states for future column switching requirements
  const [angleField, setAngleField] = useState<string>('');
  const [colorField, setColorField] = useState<string>('');

  const [fieldsAll, setFieldsAll] = useState<string[]>([]);

  const emptyHeader = '-';
  useEffect(() => {
    setFieldsAll([emptyHeader, ...headers]);
  }, [headers]);

  useEffect(() => {
    setColorField(headers[0]);
    setAngleField(headers[1]);

    const typedData = preprocessDataForVisualisation(data);

    // setting the axis based on the data type
    if (typedData.length > 0) {
      const firstRow = data[0];
      const keyHeader = headers.filter((item: any) => {
        return typeof firstRow[item] == 'string';
      });
      const scalarHeaders = headers.filter((item: any) => {
        return typeof firstRow[item] == 'number';
      });
      // console.log('keyHeader', keyHeader);
      // console.log('scalarHeaders', scalarHeaders);
      if (keyHeader.length >= 1) {
        setColorField(keyHeader[0]);
      }
      if (scalarHeaders.length === 1) {
        setAngleField(scalarHeaders[0]);
      }
      if (scalarHeaders.length === 2) {
        setColorField(scalarHeaders[0]);
        setAngleField(scalarHeaders[1]);
      }
    }

    setDataSource(typedData);
  }, [headers, data]);

  const config = {
    appendPadding: 10,
    data: dataSource,
    angleField,
    colorField,
    radius: 0.75,
    label: {
      type: 'spider',
      labelHeight: 28,
      content: '{name}\n{percentage}',
    },
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
    ],
  };

  const [sortAngle, setSortAngle] = useState(false);

  return dataSource.length > 0 ? (
    <Grid>
      <Tooltip
        title="Some data can be sorted by certain values of its attributes, try it out!"
        placement="bottom-start"
        arrow
      >
        <Grid
          container
          spacing={2}
          sx={{ alignItems: 'center', marginBottom: 2 }}
        >
          <Grid item>
            <Button
              variant="outlined"
              color="success"
              size="small"
              sx={{
                textTransform: 'none',
              }}
              endIcon={<CompareArrowsIcon />}
              onClick={() => {
                const orderedData = dataSource.sort((a, b) => {
                  return sortAngle
                    ? a[angleField] - b[angleField]
                    : b[angleField] - a[angleField];
                });
                setDataSource(orderedData);

                setSortAngle(!sortAngle);
              }}
            >
              Sort by axis {angleField}
            </Button>
          </Grid>
        </Grid>
      </Tooltip>
      <Pie {...config} />

      <Grid container spacing={2}>
        <Grid item>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            source for catorization field
            <Select
              value={safeGetFieldIndex(fieldsAll, colorField)}
              onChange={(e) => {
                setColorField(
                  safeGetField(fieldsAll, Number(e.target.value), emptyHeader),
                );
              }}
            >
              {fieldsAll.map((item, index) => {
                return (
                  <MenuItem key={index} value={index}>
                    {item}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>

        <Grid item>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            source for quantity field
            <Select
              value={safeGetFieldIndex(fieldsAll, angleField)}
              onChange={(e) => {
                setAngleField(
                  safeGetField(fieldsAll, Number(e.target.value), emptyHeader),
                );
              }}
            >
              {fieldsAll.map((item, index) => {
                return (
                  <MenuItem key={index} value={index}>
                    {item}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Grid>
  ) : (
    <div>No Data Available</div>
  );
};

export default PieChartAntV;
