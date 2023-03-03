import { Grid } from "@mui/material";
import BarChart from "./BarChart";
import CirclePack from "./CirclePack";
import LinkedNode from "./LinkedNode";
import D3CircularPacking from "./PackGPT";

function GraphsPage() {
    return (
        <Grid>
            <BarChart data={[]} />
            <LinkedNode />
            <CirclePack />
            <D3CircularPacking />
        </Grid>
    );
}

export default GraphsPage;
