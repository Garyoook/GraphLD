import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    List,
    ListItem,
    ListItemText,
    Paper,
    PaperProps,
} from "@mui/material";
import { useState } from "react";
import Draggable from "react-draggable";
import BarChart from "../../graphs/BarChart";
import PieChart from "../../graphs/PieChart";

// draggable rendering area for the dialog
function paperComponent(props: PaperProps) {
    return (
        <Draggable
            handle='#draggable-dialog-title'
            cancel={'[class*="MuiDialogContent-root"]'}>
            <Paper {...props} />
        </Draggable>
    );
}

enum ChartType {
    UNSET,
    BAR_CHART,
    PIE_CHART,
}

function VisOptions(props) {
    const { data } = props;

    const [openVis, setOpenVis] = useState(false);
    const [chartType, setChartType] = useState(ChartType.UNSET);

    const handleVisOpen = (ChartType) => {
        setChartType(ChartType);
        setOpenVis(true);
    };

    const handleVisClose = () => {
        setOpenVis(false);
    };

    function displayChart(chartType, data) {
        switch (chartType) {
            case ChartType.BAR_CHART:
                return <BarChart data={data} />;
            case ChartType.PIE_CHART:
                return <PieChart data={data} />;
            default:
                return null;
        }
    }

    return (
        <div>
            <List>
                <ListItem
                    button
                    onClick={() => handleVisOpen(ChartType.BAR_CHART)}>
                    <ListItemText primary='Bar Chart' />
                </ListItem>
                <Divider />
                <ListItem
                    button
                    onClick={() => handleVisOpen(ChartType.PIE_CHART)}>
                    <ListItemText primary='Bubble Chart' />
                </ListItem>
            </List>
            <Dialog
                open={openVis}
                onClose={handleVisClose}
                PaperComponent={paperComponent}
                fullWidth
                aria-labelledby='draggable-dialog-title'>
                <DialogTitle
                    style={{ cursor: "move" }}
                    id='draggable-dialog-title'>
                    Choose your visualisation
                </DialogTitle>
                <DialogContent>{displayChart(chartType, data)}</DialogContent>
                <DialogActions>
                    <Button onClick={handleVisClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default VisOptions;
