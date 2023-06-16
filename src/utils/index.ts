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
  column: ChartType.COLUMN_CHART_ANTV,
  bubble: ChartType.BUBBLE_CHART_ANTV,
  wordClouds: ChartType.WORD_CLOUDS_ANTV,
  calendar: ChartType.CALENDAR_ANTV,
  pie: ChartType.PIE_CHART_ANTV,
  choroplethMap: ChartType.CHOROPLETH_MAP,
  // 2-class vis:
  treemap: ChartType.TREE_MAP_ANTV,
  hierarchyTree: ChartType.TREE_ANTV,
  sunburst: ChartType.SUNBURST_ANTV,
  circlePacking: ChartType.CIRCLE_PACKING_ANTV,
  multiLine: ChartType.MULTI_LINE_CHART,
  spider: ChartType.SPIDER_CHART_ANTV,
  stackedBar: ChartType.STACKED_BAR_CHART_ANTV,
  groupedBar: ChartType.GROUPED_BAR_CHART_ANTV,
  stackedColumn: ChartType.STACKED_COLUMN_CHART_ANTV,
  groupedColumn: ChartType.GROUPED_COLUMN_CHART_ANTV,

  // 3-class vis:
  sankey: ChartType.SANKEY_ANTV,
  chord: ChartType.CHORD_DIAGRAM_ANTV,
  network: ChartType.NETWORK_ANTV,
  heatmap: ChartType.HEATMAP_ANTV,
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

export const countryListAlpha2 = {
  AF: 'Afghanistan',
  AL: 'Albania',
  DZ: 'Algeria',
  AS: 'American Samoa',
  AD: 'Andorra',
  AO: 'Angola',
  AI: 'Anguilla',
  AQ: 'Antarctica',
  AG: 'Antigua and Barbuda',
  AR: 'Argentina',
  AM: 'Armenia',
  AW: 'Aruba',
  AU: 'Australia',
  AT: 'Austria',
  AZ: 'Azerbaijan',
  BS: 'Bahamas (the)',
  BH: 'Bahrain',
  BD: 'Bangladesh',
  BB: 'Barbados',
  BY: 'Belarus',
  BE: 'Belgium',
  BZ: 'Belize',
  BJ: 'Benin',
  BM: 'Bermuda',
  BT: 'Bhutan',
  BO: 'Bolivia (Plurinational State of)',
  BQ: 'Bonaire, Sint Eustatius and Saba',
  BA: 'Bosnia and Herzegovina',
  BW: 'Botswana',
  BV: 'Bouvet Island',
  BR: 'Brazil',
  IO: 'British Indian Ocean Territory (the)',
  BN: 'Brunei Darussalam',
  BG: 'Bulgaria',
  BF: 'Burkina Faso',
  BI: 'Burundi',
  CV: 'Cabo Verde',
  KH: 'Cambodia',
  CM: 'Cameroon',
  CA: 'Canada',
  KY: 'Cayman Islands (the)',
  CF: 'Central African Republic (the)',
  TD: 'Chad',
  CL: 'Chile',
  CN: 'China',
  CX: 'Christmas Island',
  CC: 'Cocos (Keeling) Islands (the)',
  CO: 'Colombia',
  KM: 'Comoros (the)',
  CD: 'Congo (the Democratic Republic of the)',
  CG: 'Congo (the)',
  CK: 'Cook Islands (the)',
  CR: 'Costa Rica',
  HR: 'Croatia',
  CU: 'Cuba',
  CW: 'Curaçao',
  CY: 'Cyprus',
  CZ: 'Czechia',
  CI: "Côte d'Ivoire",
  DK: 'Denmark',
  DJ: 'Djibouti',
  DM: 'Dominica',
  DO: 'Dominican Republic (the)',
  EC: 'Ecuador',
  EG: 'Egypt',
  SV: 'El Salvador',
  GQ: 'Equatorial Guinea',
  ER: 'Eritrea',
  EE: 'Estonia',
  SZ: 'Eswatini',
  ET: 'Ethiopia',
  FK: 'Falkland Islands (the) [Malvinas]',
  FO: 'Faroe Islands (the)',
  FJ: 'Fiji',
  FI: 'Finland',
  FR: 'France',
  GF: 'French Guiana',
  PF: 'French Polynesia',
  TF: 'French Southern Territories (the)',
  GA: 'Gabon',
  GM: 'Gambia (the)',
  GE: 'Georgia',
  DE: 'Germany',
  GH: 'Ghana',
  GI: 'Gibraltar',
  GR: 'Greece',
  GL: 'Greenland',
  GD: 'Grenada',
  GP: 'Guadeloupe',
  GU: 'Guam',
  GT: 'Guatemala',
  GG: 'Guernsey',
  GN: 'Guinea',
  GW: 'Guinea-Bissau',
  GY: 'Guyana',
  HT: 'Haiti',
  HM: 'Heard Island and McDonald Islands',
  VA: 'Holy See (the)',
  HN: 'Honduras',
  HK: 'Hong Kong',
  HU: 'Hungary',
  IS: 'Iceland',
  IN: 'India',
  ID: 'Indonesia',
  IR: 'Iran (Islamic Republic of)',
  IQ: 'Iraq',
  IE: 'Ireland',
  IM: 'Isle of Man',
  IL: 'Israel',
  IT: 'Italy',
  JM: 'Jamaica',
  JP: 'Japan',
  JE: 'Jersey',
  JO: 'Jordan',
  KZ: 'Kazakhstan',
  KE: 'Kenya',
  KI: 'Kiribati',
  KP: "Korea (the Democratic People's Republic of)",
  KR: 'Korea (the Republic of)',
  KW: 'Kuwait',
  KG: 'Kyrgyzstan',
  LA: "Lao People's Democratic Republic (the)",
  LV: 'Latvia',
  LB: 'Lebanon',
  LS: 'Lesotho',
  LR: 'Liberia',
  LY: 'Libya',
  LI: 'Liechtenstein',
  LT: 'Lithuania',
  LU: 'Luxembourg',
  MO: 'Macao',
  MG: 'Madagascar',
  MW: 'Malawi',
  MY: 'Malaysia',
  MV: 'Maldives',
  ML: 'Mali',
  MT: 'Malta',
  MH: 'Marshall Islands (the)',
  MQ: 'Martinique',
  MR: 'Mauritania',
  MU: 'Mauritius',
  YT: 'Mayotte',
  MX: 'Mexico',
  FM: 'Micronesia (Federated States of)',
  MD: 'Moldova (the Republic of)',
  MC: 'Monaco',
  MN: 'Mongolia',
  ME: 'Montenegro',
  MS: 'Montserrat',
  MA: 'Morocco',
  MZ: 'Mozambique',
  MM: 'Myanmar',
  NA: 'Namibia',
  NR: 'Nauru',
  NP: 'Nepal',
  NL: 'Netherlands (the)',
  NC: 'New Caledonia',
  NZ: 'New Zealand',
  NI: 'Nicaragua',
  NE: 'Niger (the)',
  NG: 'Nigeria',
  NU: 'Niue',
  NF: 'Norfolk Island',
  MP: 'Northern Mariana Islands (the)',
  NO: 'Norway',
  OM: 'Oman',
  PK: 'Pakistan',
  PW: 'Palau',
  PS: 'Palestine, State of',
  PA: 'Panama',
  PG: 'Papua New Guinea',
  PY: 'Paraguay',
  PE: 'Peru',
  PH: 'Philippines (the)',
  PN: 'Pitcairn',
  PL: 'Poland',
  PT: 'Portugal',
  PR: 'Puerto Rico',
  QA: 'Qatar',
  MK: 'Republic of North Macedonia',
  RO: 'Romania',
  RU: 'Russian Federation (the)',
  RW: 'Rwanda',
  RE: 'Réunion',
  BL: 'Saint Barthélemy',
  SH: 'Saint Helena, Ascension and Tristan da Cunha',
  KN: 'Saint Kitts and Nevis',
  LC: 'Saint Lucia',
  MF: 'Saint Martin (French part)',
  PM: 'Saint Pierre and Miquelon',
  VC: 'Saint Vincent and the Grenadines',
  WS: 'Samoa',
  SM: 'San Marino',
  ST: 'Sao Tome and Principe',
  SA: 'Saudi Arabia',
  SN: 'Senegal',
  RS: 'Serbia',
  SC: 'Seychelles',
  SL: 'Sierra Leone',
  SG: 'Singapore',
  SX: 'Sint Maarten (Dutch part)',
  SK: 'Slovakia',
  SI: 'Slovenia',
  SB: 'Solomon Islands',
  SO: 'Somalia',
  ZA: 'South Africa',
  GS: 'South Georgia and the South Sandwich Islands',
  SS: 'South Sudan',
  ES: 'Spain',
  LK: 'Sri Lanka',
  SD: 'Sudan (the)',
  SR: 'Suriname',
  SJ: 'Svalbard and Jan Mayen',
  SE: 'Sweden',
  CH: 'Switzerland',
  SY: 'Syrian Arab Republic',
  TW: 'Taiwan',
  TJ: 'Tajikistan',
  TZ: 'Tanzania, United Republic of',
  TH: 'Thailand',
  TL: 'Timor-Leste',
  TG: 'Togo',
  TK: 'Tokelau',
  TO: 'Tonga',
  TT: 'Trinidad and Tobago',
  TN: 'Tunisia',
  TR: 'Turkey',
  TM: 'Turkmenistan',
  TC: 'Turks and Caicos Islands (the)',
  TV: 'Tuvalu',
  UG: 'Uganda',
  UA: 'Ukraine',
  AE: 'United Arab Emirates (the)',
  GB: 'United Kingdom of Great Britain and Northern Ireland (the)',
  UM: 'United States Minor Outlying Islands (the)',
  US: 'United States of America (the)',
  UY: 'Uruguay',
  UZ: 'Uzbekistan',
  VU: 'Vanuatu',
  VE: 'Venezuela (Bolivarian Republic of)',
  VN: 'Viet Nam',
  VG: 'Virgin Islands (British)',
  VI: 'Virgin Islands (U.S.)',
  WF: 'Wallis and Futuna',
  EH: 'Western Sahara',
  YE: 'Yemen',
  ZM: 'Zambia',
  ZW: 'Zimbabwe',
  AX: 'Åland Islands',
};
