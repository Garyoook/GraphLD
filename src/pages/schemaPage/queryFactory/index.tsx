import {
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
} from '@mui/material';
import { useEffect, useState } from 'react';

function QueryFactory(props: any) {
  const { classDPMapping, PABData } = props;

  console.log('QueryFactory: classDPMapping', classDPMapping);
  console.log('QueryFactory: PABData', PABData);

  const [selectedClass, setSelectedClass] = useState<string>('');
  const [classList, setClassList] = useState<string[]>([]);
  const [selectedFunctionalProp, setSelectedFunctionalProp] =
    useState<string>('');
  const [functionalPropsList, setFunctionalPropsList] = useState<string[]>([]);
  const [selectedObjectProp, setSelectedObjectProp] = useState<string>('');
  const [objectPropsList, setObjectPropsList] = useState<string[]>([]);

  useEffect(() => {
    const classes = Object.keys(classDPMapping);
    if (classes.length > 0) {
      setClassList(['None', ...classes]);
    }
  }, [classDPMapping]);

  //   useEffect(() => {
  //     if (functionalPropsList.length > 0) {
  //       setFunctionalPropsList(['None', ...functionalPropsList]);
  //     }
  //   }, [functionalPropsList]);

  return (
    <Paper
      sx={{
        height: '90vh',
      }}
    >
      <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
        <InputLabel>Class 1</InputLabel>
        <Select
          value={selectedClass}
          label="Class 1"
          onChange={(e) => {
            const selectedClass = e.target.value as string;
            setSelectedClass(selectedClass);
            setFunctionalPropsList(classDPMapping[selectedClass]);
          }}
        >
          {classList.map((classItem: string) => {
            return <MenuItem value={classItem}>{classItem}</MenuItem>;
          })}
        </Select>
      </FormControl>

      <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
        <InputLabel>Functional Property</InputLabel>
        <Select
          value={selectedFunctionalProp}
          label="Functional Property"
          onChange={(e) => {
            const selectedFunctionalProp = e.target.value as string;
            setSelectedFunctionalProp(selectedFunctionalProp);
          }}
        >
          {functionalPropsList.map((DPname: string) => {
            return <MenuItem value={DPname}>{DPname}</MenuItem>;
          })}
        </Select>
      </FormControl>
    </Paper>
  );
}

export default QueryFactory;
