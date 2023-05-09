import BarChartAntV from '@/pages/graphs/ANTVCharts/BarChartAntV';
import BubbleChartAntV from '@/pages/graphs/ANTVCharts/BubbleChartAntV';
import ChordAntV from '@/pages/graphs/ANTVCharts/ChordAntV';
import CirclePackingAntV from '@/pages/graphs/ANTVCharts/CirclePackingAntV';
import LineChartAntV from '@/pages/graphs/ANTVCharts/LineChartAntV';
import PieChartAntV from '@/pages/graphs/ANTVCharts/PieChartAntV';
import ScatterPlotAntV from '@/pages/graphs/ANTVCharts/ScatterPlotAntV';
import SunBurst from '@/pages/graphs/ANTVCharts/SunBurstAntV';
import TreeAntV from '@/pages/graphs/ANTVCharts/TreeAntV';
import TreeMapAntV from '@/pages/graphs/ANTVCharts/TreeMapAntV';
import WordCloudAntV from '@/pages/graphs/ANTVCharts/WordCloudAntV';
import MultipleLineChart from '@/pages/graphs/ANTVCharts/multipleLineChart';
import LineChart from '@/pages/graphs/GoogleCharts/LineChart';
import ScatterPlot from '@/pages/graphs/GoogleCharts/ScatterPlot';
import TreeMap from '@/pages/graphs/GoogleCharts/TreeMap';
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
import BarChart from '../../graphs/GoogleCharts/BarChart';
import PieChart from '../../graphs/GoogleCharts/PieChart';

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

// TODO: add more charts enums
enum ChartType {
  UNSET = 'Visulisation Unset',
  BAR_CHART = 'Bar Chart',
  PIE_CHART = 'Pie Chart',
  SCATTER_PLOT = 'Scatter Plot',
  LINE_CHART = 'line chart',
  TREE_MAP = 'Tree Map',
  LINE_CHART_ANTV = 'line chart ',
  MULTI_LINE_CHART = 'Multiple Line Chart ',
  BARCHART_ANTV = 'Bar Chart ',
  PIE_CHART_ANTV = 'Pie Chart ',
  SCATTER_PLOT_ANTV = 'Scatter Plot ',
  TREE_MAP_ANTV = 'Tree Map ',
  CHORD_DIAGRAM_ANTV = 'Chord Diagram ',
  BUBBLE_CHART_ANTV = 'Bubble Chart ',
  WORD_CLOUD_ANTV = 'Word Cloud ',
  TREE_ANTV = 'Hierarchy Tree ',
  CIRCLE_PACKING_ANTV = 'Circle Packing ',
  SUNBURST_ANTV = 'Sunburst Chart',
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

  // TODO: add more charts render slots
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
      case ChartType.TREE_MAP:
        return <TreeMap headers={headers} data={data} />;
      case ChartType.BARCHART_ANTV:
        return <BarChartAntV headers={headers} data={originalData} />;
      case ChartType.LINE_CHART_ANTV:
        return <LineChartAntV headers={headers} data={originalData} />;
      case ChartType.MULTI_LINE_CHART:
        return <MultipleLineChart headers={headers} data={originalData} />;
      case ChartType.PIE_CHART_ANTV:
        return <PieChartAntV headers={headers} data={originalData} />;
      case ChartType.SCATTER_PLOT_ANTV:
        return <ScatterPlotAntV headers={headers} data={originalData} />;
      case ChartType.TREE_MAP_ANTV:
        return <TreeMapAntV headers={headers} data={originalData} />;
      case ChartType.CHORD_DIAGRAM_ANTV:
        return <ChordAntV headers={headers} data={originalData} />;
      case ChartType.BUBBLE_CHART_ANTV:
        return <BubbleChartAntV headers={headers} data={originalData} />;
      case ChartType.WORD_CLOUD_ANTV:
        return <WordCloudAntV headers={headers} data={originalData} />;
      case ChartType.TREE_ANTV:
        return <TreeAntV headers={headers} data={originalData} />;
      case ChartType.CIRCLE_PACKING_ANTV:
        return <CirclePackingAntV headers={headers} data={originalData} />;
      case ChartType.SUNBURST_ANTV:
        return <SunBurst headers={headers} data={originalData} />;

      default:
        return 'You specified an invalid chart type, please check the code';
    }
  }

  // TODO add more charts options here
  const VisOptions_GoogleCharts = [
    ChartType.BAR_CHART,
    ChartType.PIE_CHART,
    ChartType.SCATTER_PLOT,
    ChartType.LINE_CHART,
    ChartType.TREE_MAP,
  ];

  const VisOptions_ANTV = [
    ChartType.BARCHART_ANTV,
    ChartType.SCATTER_PLOT_ANTV,
    ChartType.BUBBLE_CHART_ANTV,
    ChartType.LINE_CHART_ANTV,
    ChartType.MULTI_LINE_CHART,
    ChartType.PIE_CHART_ANTV,
    ChartType.CHORD_DIAGRAM_ANTV,
    ChartType.WORD_CLOUD_ANTV,
    ChartType.TREE_ANTV,
    ChartType.TREE_MAP_ANTV,
    ChartType.CIRCLE_PACKING_ANTV,
    ChartType.SUNBURST_ANTV,
  ];

  function renderVisOptions(options: ChartType[]) {
    return options.map((chartType) => {
      return (
        <>
          <ListItem button onClick={() => handleVisOpen(chartType)}>
            <ListItemText primary={chartType} />
          </ListItem>
          <Divider />
        </>
      );
    });
  }

  return (
    <div>
      AntV:
      <Divider />
      <List>{renderVisOptions(VisOptions_ANTV)}</List>
      Google Charts:
      <List>{renderVisOptions(VisOptions_GoogleCharts)}</List>
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
