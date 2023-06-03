import BarChartAntV from '@/pages/graphs/ANTVCharts/BarChartAntV';
import BubbleChartAntV from '@/pages/graphs/ANTVCharts/BubbleChartAntV';
import CalendarChart from '@/pages/graphs/ANTVCharts/CalendarAntV';
import ChordAntV from '@/pages/graphs/ANTVCharts/ChordAntV';
import CirclePackingAntV from '@/pages/graphs/ANTVCharts/CirclePackingAntV';
import ColumnChartAntV from '@/pages/graphs/ANTVCharts/ColumnChartAntV';
import GroupedBarChart from '@/pages/graphs/ANTVCharts/GroupedBarAntV';
import GroupedColumnChart from '@/pages/graphs/ANTVCharts/GroupedColumnAntV';
import HeatmapAntV from '@/pages/graphs/ANTVCharts/HeatmapAntv';
import LineChartAntV from '@/pages/graphs/ANTVCharts/LineChartAntV';
import NetworkChart from '@/pages/graphs/ANTVCharts/NetworkAntV';
import PieChartAntV from '@/pages/graphs/ANTVCharts/PieChartAntV';
import SankeyAntV from '@/pages/graphs/ANTVCharts/SankeyAntV';
import ScatterPlotAntV from '@/pages/graphs/ANTVCharts/ScatterPlotAntV';
import SpiderChart from '@/pages/graphs/ANTVCharts/SpiderAntV';
import StackedBarChart from '@/pages/graphs/ANTVCharts/StackedBarAntV';
import StackedColumnChart from '@/pages/graphs/ANTVCharts/StackedColumnAntV';
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
import { RecommendationProps, VisDataProps } from '..';
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
export enum ChartType {
  UNSET = 'Visulisation Unset',
  BAR_CHART = 'Bar Chart',
  PIE_CHART = 'Pie Chart',
  SCATTER_PLOT = 'Scatter Plot',
  LINE_CHART = 'line chart',
  TREE_MAP = 'Tree Map',
  LINE_CHART_ANTV = 'line chart ',
  MULTI_LINE_CHART = 'Multiple Line Chart ',
  SPIDER_CHART_ANTV = 'Spider Chart ',
  STACKED_COLUMN_CHART_ANTV = 'Stacked Bar Chart (vertical)',
  GROUPED_COLUMN_CHART_ANTV = 'Grouped Bar Chart (vertical)',
  STACKED_BAR_CHART_ANTV = 'Stacked Bar Chart (horizontal)',
  GROUPED_BAR_CHART_ANTV = 'Grouped Bar Chart (horizontal)',
  BAR_CHART_ANTV = 'Bar Chart (horizontal)',
  COLUMN_CHART_ANTV = 'Bar Chart (vertical)',
  PIE_CHART_ANTV = 'Pie Chart ',
  SCATTER_PLOT_ANTV = 'Scatter Plot ',
  TREE_MAP_ANTV = 'Tree Map ',
  CHORD_DIAGRAM_ANTV = 'Chord Diagram ',
  BUBBLE_CHART_ANTV = 'Bubble Chart ',
  WORD_CLOUDS_ANTV = 'Word Clouds ',
  TREE_ANTV = 'Hierarchy Tree ',
  CIRCLE_PACKING_ANTV = 'Circle Packing ',
  SUNBURST_ANTV = 'Sunburst Chart ',
  SANKEY_ANTV = 'Sankey Chart ',
  CALENDAR_ANTV = 'Calendar Chart ',
  NETWORK_ANTV = 'Network Chart ',
  HEATMAP_ANTV = 'Heatmap',
}

function VisOptions(props: {
  data: VisDataProps;
  originalData: any[];
  recommendations: RecommendationProps[];
}) {
  const { data, headers } = props.data;
  const { originalData, recommendations } = props;

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
      case ChartType.BAR_CHART_ANTV:
        return <BarChartAntV headers={headers} data={originalData} />;
      case ChartType.PIE_CHART_ANTV:
        return <PieChartAntV headers={headers} data={originalData} />;
      case ChartType.COLUMN_CHART_ANTV:
        return <ColumnChartAntV headers={headers} data={originalData} />;
      case ChartType.LINE_CHART_ANTV:
        return <LineChartAntV headers={headers} data={originalData} />;
      case ChartType.MULTI_LINE_CHART:
        return <MultipleLineChart headers={headers} data={originalData} />;
      case ChartType.STACKED_COLUMN_CHART_ANTV:
        return <StackedColumnChart headers={headers} data={originalData} />;
      case ChartType.GROUPED_COLUMN_CHART_ANTV:
        return <GroupedColumnChart headers={headers} data={originalData} />;
      case ChartType.STACKED_BAR_CHART_ANTV:
        return <StackedBarChart headers={headers} data={originalData} />;
      case ChartType.GROUPED_BAR_CHART_ANTV:
        return <GroupedBarChart headers={headers} data={originalData} />;
      case ChartType.SCATTER_PLOT_ANTV:
        return <ScatterPlotAntV headers={headers} data={originalData} />;
      case ChartType.TREE_MAP_ANTV:
        return <TreeMapAntV headers={headers} data={originalData} />;
      case ChartType.CHORD_DIAGRAM_ANTV:
        return <ChordAntV headers={headers} data={originalData} />;
      case ChartType.BUBBLE_CHART_ANTV:
        return <BubbleChartAntV headers={headers} data={originalData} />;
      case ChartType.WORD_CLOUDS_ANTV:
        return <WordCloudAntV headers={headers} data={originalData} />;
      case ChartType.TREE_ANTV:
        return <TreeAntV headers={headers} data={originalData} />;
      case ChartType.CIRCLE_PACKING_ANTV:
        return <CirclePackingAntV headers={headers} data={originalData} />;
      case ChartType.SUNBURST_ANTV:
        return <SunBurst headers={headers} data={originalData} />;
      case ChartType.SANKEY_ANTV:
        return <SankeyAntV headers={headers} data={originalData} />;
      case ChartType.CALENDAR_ANTV:
        return <CalendarChart headers={headers} data={originalData} />;
      case ChartType.SPIDER_CHART_ANTV:
        return <SpiderChart headers={headers} data={originalData} />;
      case ChartType.HEATMAP_ANTV:
        return <HeatmapAntV headers={headers} data={originalData} />;
      case ChartType.NETWORK_ANTV:
        return <NetworkChart headers={headers} data={originalData} />;

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
    ChartType.COLUMN_CHART_ANTV,
    ChartType.BAR_CHART_ANTV,
    ChartType.STACKED_COLUMN_CHART_ANTV,
    ChartType.GROUPED_COLUMN_CHART_ANTV,
    ChartType.STACKED_BAR_CHART_ANTV,
    ChartType.GROUPED_BAR_CHART_ANTV,
    ChartType.SCATTER_PLOT_ANTV,
    ChartType.BUBBLE_CHART_ANTV,
    ChartType.LINE_CHART_ANTV,
    ChartType.MULTI_LINE_CHART,
    ChartType.PIE_CHART_ANTV,
    ChartType.CHORD_DIAGRAM_ANTV,
    ChartType.SANKEY_ANTV,
    ChartType.HEATMAP_ANTV,
    ChartType.NETWORK_ANTV,
    ChartType.WORD_CLOUDS_ANTV,
    ChartType.TREE_ANTV,
    ChartType.TREE_MAP_ANTV,
    ChartType.CIRCLE_PACKING_ANTV,
    ChartType.SUNBURST_ANTV,
    ChartType.CALENDAR_ANTV,
    ChartType.SPIDER_CHART_ANTV,
  ];

  function renderVisOptions(options: RecommendationProps[]) {
    if (options.length > 0) {
      return options.map((option, index) => {
        return (
          <div key={index}>
            <ListItem
              key={index}
              button
              onClick={() => handleVisOpen(option.chart)}
            >
              <ListItemText
                primary={option.chart}
                secondary={
                  isNaN(option.rating) ? undefined : `rating: ${option.rating}`
                }
              />
            </ListItem>
            <Divider />
          </div>
        );
      });
    }
  }

  return (
    <div>
      Recommended Visulisations:
      <Divider />
      <List>{renderVisOptions(recommendations)}</List>
      <br />
      <br />
      <br />
      All Visualisations:
      <br />
      AntV
      <Divider />
      <List>
        {renderVisOptions(
          VisOptions_ANTV.map((o) => {
            return { chart: o, rating: NaN };
          }),
        )}
      </List>
      Google Charts
      <List>
        {renderVisOptions(
          VisOptions_GoogleCharts.map((o) => {
            return { chart: o, rating: NaN };
          }),
        )}
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
              color="inherit"
              onClick={handleVisClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <DialogContent>{displayChart(chartType, data)}</DialogContent>
        <DialogActions
          sx={{ border: '#1976d255 solid 2px', borderRadius: '3px' }}
        >
          <Button onClick={handleVisClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default VisOptions;
