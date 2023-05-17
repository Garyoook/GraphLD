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
}

export const ranges_type_mapping: any = {
  'xsd:nonNegativeInteger': DATA_DIMENTION_TYPE.SCALAR,
  'xsd:gYear': DATA_DIMENTION_TYPE.DISCRETE,
  'xsd:decimal': DATA_DIMENTION_TYPE.SCALAR,
  'xsd:string': DATA_DIMENTION_TYPE.LEXICAL,
  'xsd:date': DATA_DIMENTION_TYPE.DISCRETE,
};

export const ChartType_mapping = {
  scatter: ChartType.SCATTER_PLOT_ANTV,
  bar: ChartType.BAR_CHART_ANTV,
  bubble: ChartType.BUBBLE_CHART_ANTV,
  wordClouds: ChartType.WORD_CLOUD_ANTV,
  calendar: ChartType.CALENDAR_ANTV,
  pie: ChartType.PIE_CHART_ANTV,
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
