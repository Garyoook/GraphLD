import { ChartType } from '@/pages/SparqlPage/VisOptions';

export const prefix_mapping: any = {
  'http://www.w3.org/1999/02/22-rdf-syntax-ns': 'rdf',
  // "http://www.semwebtech.org/mondial/10/meta": "xmlns",
  'http://www.semwebtech.org/mondial/10/meta': '',
  'http://www.w3.org/2002/07/owl': 'owl',
  'http://www.w3.org/2000/01/rdf-schema': 'rdfs',
  'http://www.w3.org/2001/XMLSchema': 'xsd',
};

export enum DATA_DIMENTION_TYPE {
  DISCRETE,
  SCALAR,
  LEXICAL,
  TEMPORAL,
}

export const ranges_type_mapping = (range: string) => {
  const mapping: any = {
    'xsd:nonNegativeInteger': DATA_DIMENTION_TYPE.SCALAR,
    'xsd:gYear': DATA_DIMENTION_TYPE.DISCRETE,
    'xsd:decimal': DATA_DIMENTION_TYPE.SCALAR,
    'xsd:string': DATA_DIMENTION_TYPE.LEXICAL,
    'xsd:date': DATA_DIMENTION_TYPE.TEMPORAL,
  };

  return mapping[range];
};

export const ChartType_mapping = {
  // 1-class vis:
  scatter: ChartType.SCATTER_PLOT_ANTV,
  bar: ChartType.BAR_CHART_ANTV,
  bubble: ChartType.BUBBLE_CHART_ANTV,
  wordClouds: ChartType.WORD_CLOUDS_ANTV,
  calendar: ChartType.CALENDAR_ANTV,
  pie: ChartType.PIE_CHART_ANTV,
  // 2-class vis:
  treeMap: ChartType.TREE_MAP_ANTV,
  hierarchyTree: ChartType.TREE_ANTV,
  sunburst: ChartType.SUNBURST_ANTV,
  circlePacking: ChartType.CIRCLE_PACKING_ANTV,
  multiLine: ChartType.MULTI_LINE_CHART,
  spider: ChartType.SPIDER_CHART_ANTV,
  stackedBar: ChartType.STACKED_BAR_CHART_ANTV,
  groupedBar: ChartType.GROUPED_BAR_CHART_ANTV,

  // 3-class vis:
  sankey: ChartType.SANKEY_ANTV,
  chord: ChartType.CHORD_DIAGRAM_ANTV,
};

export function convertPrefixToNamespace(jsonldItem: any) {
  const keys = Object.keys(jsonldItem);
  for (const key of keys) {
    // handle string value:
    if (
      typeof jsonldItem[key] === 'string' &&
      jsonldItem[key].match(/^http.*$/)
    ) {
      const prefix = jsonldItem[key].split('#')[0];
      const name = jsonldItem[key].split('#')[1];
      const newKey = `${prefix_mapping[prefix]}:${name}`;
      jsonldItem[key] = newKey;
    } else if (
      typeof jsonldItem[key] === 'string' &&
      jsonldItem[key].match(/^_:.*$/)
    ) {
      // console.log("jsonldItem[key]: ", jsonldItem);
      // if find Restriction in @type property, change it to rdf:Restriction
      // jsonldItem[key] = "parseType:Collection";
    }

    // handle array value:
    const value_arr = [];
    if (Array.isArray(jsonldItem[key])) {
      for (const item of jsonldItem[key]) {
        // array of object
        if (typeof item === 'object') {
          convertPrefixToNamespace(item);
        }
        // array of string
        if (typeof item === 'string' && item.match(/^http.*$/)) {
          const prefix = item.split('#')[0];
          const name = item.split('#')[1];
          const newKey = `${prefix_mapping[prefix]}:${name}`;
          value_arr.push(newKey);
          jsonldItem[key] = value_arr;
        }
      }
    }

    // handle key formats:
    if (key.match(/^http.*$/)) {
      const prefix = key.split('#')[0];
      const name = key.split('#')[1];
      const value = jsonldItem[key];

      // delete old complicated key
      delete jsonldItem[key];
      const newKey = `${prefix_mapping[prefix]}:${name}`;

      const value_copy: any[] = [];
      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === 'object') {
            convertPrefixToNamespace(item);
          }
          value_copy.push(item);
        }
      }
      // add back to jsonldItem
      jsonldItem[newKey] = value_copy;
    }
  }
}

export function unsecuredCopyToClipboard(text: string) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Unable to copy to clipboard', err);
  }
  document.body.removeChild(textArea);
}
