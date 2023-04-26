import LineChart from '@/pages/graphs/LineChart';
import ScatterPlot from '@/pages/graphs/ScatterPlot';
import TreeMap from '@/pages/graphs/TreeMap';
import MultipleLineChart from '@/pages/graphs/multipleLineChart';
import CloseIcon from '@mui/icons-material/Close';
import {
  AppBar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  PaperProps,
  Toolbar,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import Draggable from 'react-draggable';
import { VisDataProps } from '..';
import BarChart from '../../graphs/BarChart';
import PieChart from '../../graphs/PieChart';

// draggable rendering area for the dialog
function draggablePaper(props: PaperProps) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

enum ChartType {
  UNSET = 'Visulisation Unset',
  BAR_CHART = 'Bar Chart',
  PIE_CHART = 'Pie Chart',
  SCATTER_PLOT = 'Scatter Plot',
  LINE_CHART = 'line chart (GoogleCharts format)',
  MULTI_LINE_CHART = 'Multiple Line Chart (ANTV format)',
  TREE_MAP = 'Tree Map',
}

function VisOptions(props: { data: VisDataProps; originalData: any[] }) {
  const { data, headers } = props.data;
  const { originalData } = props;

  const [openVis, setOpenVis] = useState(false);
  const [chartType, setChartType] = useState(ChartType.UNSET);

  const handleVisOpen = (ChartType: ChartType) => {
    setChartType(ChartType);
    setOpenVis(true);
  };

  const handleVisClose = () => {
    setOpenVis(false);
  };

  function displayChart(chartType: ChartType, data: (string | number)[][]) {
    switch (chartType) {
      case ChartType.BAR_CHART:
        return <BarChart headers={headers} data={data} />;
      case ChartType.PIE_CHART:
        return <PieChart headers={headers} data={data} />;
      case ChartType.SCATTER_PLOT:
        return <ScatterPlot headers={headers} data={data} />;
      case ChartType.LINE_CHART:
        return <LineChart headers={headers} data={data} />;
      case ChartType.MULTI_LINE_CHART:
        return <MultipleLineChart headers={headers} data={originalData} />;
      case ChartType.TREE_MAP:
        return <TreeMap headers={headers} data={data} />;
      default:
        return null;
    }
  }

  return (
    <div>
      <List>
        <ListItem button onClick={() => handleVisOpen(ChartType.BAR_CHART)}>
          <ListItemText primary={ChartType.BAR_CHART} />
        </ListItem>
        <Divider />
        <ListItem button onClick={() => handleVisOpen(ChartType.PIE_CHART)}>
          <ListItemText primary={ChartType.PIE_CHART} />
        </ListItem>
        <Divider />
        <ListItem button onClick={() => handleVisOpen(ChartType.SCATTER_PLOT)}>
          <ListItemText primary={ChartType.SCATTER_PLOT} />
        </ListItem>
        <Divider />
        <ListItem
          button
          onClick={() => handleVisOpen(ChartType.MULTI_LINE_CHART)}
        >
          <ListItemText primary={ChartType.MULTI_LINE_CHART} />
        </ListItem>
        <Divider />
        <ListItem button onClick={() => handleVisOpen(ChartType.TREE_MAP)}>
          <ListItemText primary={ChartType.TREE_MAP} />
        </ListItem>
      </List>

      <Dialog
        open={openVis}
        onClose={handleVisClose}
        PaperComponent={draggablePaper}
        fullWidth
        maxWidth="xl"
        aria-labelledby="draggable-dialog-title"
      >
        <AppBar
          sx={{ position: 'relative' }}
          style={{ cursor: 'move' }}
          id="draggable-dialog-title"
        >
          <Toolbar>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              {chartType}
            </Typography>

            <IconButton
              edge="end"
              autoFocus
              color="inherit"
              onClick={handleVisClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <DialogContent>{displayChart(chartType, data)}</DialogContent>
        <DialogActions>
          <Button onClick={handleVisClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default VisOptions;
