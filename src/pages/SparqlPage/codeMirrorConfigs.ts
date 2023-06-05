import { EditorView } from 'codemirror';

const SPARQLSyntax_basics = [
  // using info: 'Basic syntaxes of SPARQL'
  // query forms:
  'SELECT',
  'CONSTRUCT',
  'ASK',
  'DESCRIBE',
  // solution sequence & modifiers:
  'ORDER BY',
  'DISTINCT',
  'REDUCED',
  'OFFSET',
  'LIMIT',
  // aggregation:
  'GROUP BY',
  'HAVING',
  // optoinal values:
  'OPTIONAL',
  // filter:
  'FILTER',
];

const SPARQLSyntax_aggregates = [
  // using info: 'Aggregates in SPARQL'
  // aggregate algebra:
  'COUNT',
  'SUM',
  'AVG',
  'MIN',
  'MAX',
  'GroupConcat',
  'SAMPLE',
];

const SPARQLSyntax_functions = [
  // using info: 'Functions in SPARQL'
  // Function Definitions:
  'BOUND()',
  'IF()',
  'COALESCE()',
  'NOT EXISTS()',
  'EXISTS()',
  'sameTerm()',
  'IN()',
  'NOT IN()',
  // Functions on RDF Terms: // isIRI, isBlank, isLiteral, isNumeric, str, lang, datatype, IRI, BNODE, STRDT, STRLANG, UUID, STRUUID
  'isIRI()',
  'isBlank()',
  'isLiteral()',
  'isNumeric()',
  'str()',
  'lang()',
  'datatype()',
  'IRI()',
  'BNODE()',
  'STRDT()',
  'STRLANG()',
  'UUID()',
  'STRUUID()',
  // Functions on strings: // STRLEN, SUBSTR, UCASE LCASE, STRSTARTS, STRENDS, CONTAINS, STRBEFORE STRAFTER, ENCODE_FOR_URI, CONCAT, langMatches, REGEX REPLACE
  'STRLEN()',
  'SUBSTR()',
  'UCASE()',
  'LCASE()',
  'STRSTARTS()',
  'STRENDS()',
  'CONTAINS()',
  'STRBEFORE()',
  'STRAFTER()',
  'ENCODE_FOR_URI()',
  'CONCAT()',
  'langMatches()',
  'REGEX()',
  'REPLACE()',
  // Functions on numerics: // abs, round, ceil, floor, RAND
  'abs()',
  'round()',
  'ceil()',
  'floor()',
  'RAND()',
];

const SPARQL_syntax_with_info = [
  // logical-or, logical-and,
  {
    label: '||',
    type: 'sparql',
    info: 'logical or in SPARQL',
  },
  {
    label: '&&',
    type: 'sparql',
    info: 'logical and in SPARQL',
  },
];

const owlClasses = [
  'owl:AllDifferent',
  'owl:AnnotationProperty',
  'owl:Class',
  'owl:DataRange',
  'owl:DatatypeProperty',
  'owl:DeprecatedClass',
  'owl:DeprecatedProperty',
  'owl:FunctionalProperty',
  'owl:InverseFunctionalProperty',
  'owl:Nothing',
  'owl:ObjectProperty',
  'owl:Ontology',
  'owl:OntologyProperty',
  'owl:Restriction',
  'owl:SymmetricProperty',
  'owl:Thing',
  'owl:TransitiveProperty',
];

const owlProps = [
  'owl:allValuesFrom',
  'owl:backwardCompatibleWith',
  'owl:cardinality',
  'owl:complementOf',
  'owl:differentFromg',
  'owl:disjointWith',
  'owl:distinctMembers',
  'owl:equivalentClass',
  'owl:equivalentProperty',
  'owl:hasValue',
  'owl:hasKey',
  'owl:imports',
  'owl:incompatibleWith',
  'owl:intersectionOf',
  'owl:inverseOf',
  'owl:maxCardinality',
  'owl:minCardinality',
  'owl:oneOf',
  'owl:onProperty',
  'owl:priorVersion',
  'owl:sameAs',
  'owl:someValuesFrom',
  'owl:unionOf',
  'owl:versionInfo',
];

export const defaultAutocompletions = [
  {
    label: 'rdf:type',
    type: 'rdf',
  },
  {
    label: 'rdfs:domain',
    type: 'rdfs',
    boost: 2,
  },
  {
    label: 'rdfs:range',
    type: 'rdfs',
    boost: 2,
  },
  {
    label: 'rdfs:subClassOf',
    type: 'rdfs',
    boost: 1,
  },
  {
    label: 'rdfs:subPropertyOf',
    type: 'rdfs',
    boost: 1,
  },
  {
    label: 'rdfs:label',
    type: 'rdfs',
    boost: -1,
  },
  {
    label: 'rdfs:comment',
    type: 'rdfs',
    boost: -1,
  },
  // less used owl terms
  ...[...owlClasses, ...owlProps].map((item) => {
    return {
      label: item,
      type: 'owl',
    };
  }),
  // commonly used owl terms, assign additional ranking (boost) to them to make them appear on top
  {
    label: 'owl:Class',
    type: 'owl',
    boost: 2,
  },
  {
    label: 'owl:FunctionalProperty',
    type: 'owl',
    boost: 2,
  },
  {
    label: 'owl:InverseFunctionalProperty',
    type: 'owl',
    boost: 2,
  },
  {
    label: 'owl:ObjectProperty',
    type: 'owl',
    boost: 2,
  },
  {
    label: 'owl:DatatypeProperty',
    type: 'owl',
    boost: 1,
  },
  // SPAQRL syntaxes
  ...SPARQLSyntax_basics.map((item) => {
    return {
      label: item,
      type: 'sparql',
      info: 'Basic syntaxes of SPARQL',
    };
  }),
  ...SPARQLSyntax_aggregates.map((item) => {
    return {
      label: item,
      type: 'sparql',
      info: 'Aggregates in SPARQL',
    };
  }),
  ...SPARQLSyntax_functions.map((item) => {
    return {
      label: item,
      type: 'sparql',
      info: 'Functions in SPARQL',
    };
  }),
  ...SPARQL_syntax_with_info,
];

export const customIconsTheme = /*@__PURE__*/ EditorView.theme({
  '.cm-completionIcon-class': {
    '&:after': {
      content: "'C'",
    },
  },

  '.cm-completionIcon-property': {
    '&:after': { content: "'DP'", fontSize: '50%', verticalAlign: 'middle' },
  },

  '.cm-completionIcon-owl': {
    '&:after': {
      content: "'OWL'",
      fontSize: '50%',
      verticalAlign: 'middle',
    },
  },
  '.cm-completionIcon-rdf': {
    '&:after': {
      content: "'RDF'",
      fontSize: '50%',
      verticalAlign: 'middle',
    },
  },
  '.cm-completionIcon-rdfs': {
    '&:after': {
      content: "'RDFS'",
      fontSize: '50%',
      verticalAlign: 'middle',
    },
  },

  '.cm-completionIcon-sparql': {
    '&:after': {
      content: "'SPARQL'",
      fontSize: '50%',
      verticalAlign: 'middle',
    },
  },
});
