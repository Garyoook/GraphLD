import { Grid } from '@mui/material';
import CirclePack from './CirclePack';
import BarChart from './GoogleCharts/BarChart';
import LinkedNode from './LinkedNode';
import D3CircularPacking from './PackGPT';

function GraphsPage() {
  return (
    <Grid>
      <BarChart headers={[]} data={[]} />
      <LinkedNode />
      <CirclePack />
      <D3CircularPacking />
    </Grid>
  );
}

export default GraphsPage;
