import { EditorView } from 'codemirror';

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
});
