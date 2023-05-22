import { repo_graphDB } from '@/consts';
import { sendSPARQLquery } from '@/pages/services/api';
import { prefix_mapping } from '@/utils';

function queryResultToData(queryRes: any) {
  const head = queryRes.head.vars;
  const results_bindings = queryRes.results.bindings;

  const columns = head.map((h: any) => ({
    field: h,
    headerName: h,
  }));

  const colKeys = columns.map((col: any) => col.field);

  const data = results_bindings.map((data_binding: any, index: number) => {
    const obj: any = {};
    for (const key of colKeys) {
      const value = data_binding[key].value;
      const value_split = value.split('#');
      if (value_split.length > 1) {
        obj[key] = `${prefix_mapping[value_split[0]]}:${value_split[1]}`;
      } else {
        obj[key] = value;
      }
    }
    return {
      id: index,
      ...obj,
    };
  });
  return data;
}

export async function getRangeMapping() {
  const repositoryID = repo_graphDB;
  const query = `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX : <http://www.semwebtech.org/mondial/10/meta#>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
  SELECT ?DP ?T
  WHERE {
      {
          ?DP rdfs:range ?T .
      }
      FILTER (!isBlank(?DP))
      FILTER(STRSTARTS(STR(?T), STR(xsd:)) || STRSTARTS(STR(?T), STR(:)))
  }`;

  // ! for 1 to many, all domain mapping:
  // const infer = true;
  // const queryRes = await sendSPARQLquery(repositoryID, query, infer);
  // const data = queryResultToData(queryRes);
  // let mapping = Object();
  // for (const item of data) {
  //   const { DP } = item;
  //   mapping[DP] = [];
  // }
  // for (const item of data) {
  //   const { DP, T } = item;
  //   mapping[DP].push(T);
  // }

  // ! for 1 to 1, non-infered domain mapping:
  const infer = false;
  const queryRes = await sendSPARQLquery(repositoryID, query, infer);

  const data = queryResultToData(queryRes);

  let mapping = Object();

  for (const item of data) {
    const { DP, T } = item;
    mapping[DP] = T;
  }

  return mapping;
}

export async function getClasses() {
  const repositoryID = repo_graphDB;
  const query = `PREFIX mons: <http://www.semwebtech.org/mondial/10/meta#>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  SELECT DISTINCT ?class
  WHERE {
	  {
		  ?class rdf:type owl:Class . 
	  }
	  FILTER(STRSTARTS(STR(?class), STR(mons:)))
  }`;

  const queryRes = await sendSPARQLquery(repositoryID, query);

  const data = queryResultToData(queryRes);

  const classes = [];
  for (const item of data) {
    classes.push(item.class);
  }
  return classes;
}

export async function getFunctionalProperties() {
  const repositoryID = repo_graphDB;
  const query = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
	PREFIX owl: <http://www.w3.org/2002/07/owl#>
	SELECT ?DP
	WHERE {
		{
			?DP rdf:type owl:FunctionalProperty .
		}
		FILTER (!isBlank(?DP))
	}`;

  const queryRes = await sendSPARQLquery(repositoryID, query);

  const data = queryResultToData(queryRes);

  const DPs = [];
  for (const item of data) {
    DPs.push(item.DP);
  }
  return DPs;
}

export async function getDatatypeProperties() {
  const repositoryID = repo_graphDB;
  const query = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  PREFIX : <http://www.semwebtech.org/mondial/10/meta#>
  SELECT ?DP
  WHERE {
      {
          ?DP rdf:type owl:DatatypeProperty .
      }
      FILTER (!isBlank(?DP))
      FILTER(STRSTARTS(STR(?DP), STR(:)))
  }`;

  const queryRes = await sendSPARQLquery(repositoryID, query);

  const data = queryResultToData(queryRes);

  const DPs = [];
  for (const item of data) {
    DPs.push(item.DP);
  }
  return DPs;
}

export async function getObjectPropertiesList() {
  const repositoryID = repo_graphDB;
  const query = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  PREFIX : <http://www.semwebtech.org/mondial/10/meta#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  SELECT ?PAB ?range
  WHERE {
      {
          ?PAB rdf:type owl:ObjectProperty .
          ?PAB rdfs:range ?range .
      }
      FILTER (!isBlank(?PAB))
      FILTER(STRSTARTS(STR(?PAB), STR(:)))
  }`;

  const infer = false;
  const queryRes = await sendSPARQLquery(repositoryID, query, infer);

  const data = queryResultToData(queryRes);

  const objectPropsList = [];
  for (const item of data) {
    objectPropsList.push(item.PAB);
  }
  return objectPropsList;
}

export async function getObjectPropertyMapping() {
  const repositoryID = repo_graphDB;
  const query = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  PREFIX : <http://www.semwebtech.org/mondial/10/meta#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  SELECT ?PAB ?domain ?range
  WHERE {
      {
          ?PAB rdf:type owl:ObjectProperty ;
              rdfs:range ?range ;
            rdfs:domain ?domain .
      }
      FILTER (!isBlank(?PAB) && !isBlank(?domain) && !isBlank(?range))
      FILTER(STRSTARTS(STR(?PAB), STR(:)))
  }`;

  const infer = false;
  const queryRes = await sendSPARQLquery(repositoryID, query, infer);

  const data = queryResultToData(queryRes);

  const objectPropsMapping: any = {};
  for (const item of data) {
    const { PAB, domain, range } = item;
    objectPropsMapping[PAB] = {
      domain,
      range,
    };
  }
  return objectPropsMapping;
}

export async function getDomainMapping() {
  const repositoryID = repo_graphDB;
  const query = `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX : <http://www.semwebtech.org/mondial/10/meta#>
  SELECT ?DP ?domain
  WHERE {
	  {
		  ?DP rdfs:domain ?domain ;
	  }
  #    FILTER EXISTS {
  #        ?domain rdfs:subClassOf ?super
  #    }
	  FILTER(!isBlank(?DP) && !isBlank(?domain))
	  FILTER(STRSTARTS(STR(?DP), STR(:)))
	  FILTER(STRSTARTS(STR(?domain), STR(:)))
  }`;

  // ! for 1 to many, all domain mapping:
  const infer = true;
  const queryRes = await sendSPARQLquery(repositoryID, query, infer);
  const data = queryResultToData(queryRes);
  let mapping = Object();
  for (const item of data) {
    const { DP } = item;
    mapping[DP] = [];
  }
  for (const item of data) {
    const { DP, domain } = item;
    mapping[DP].push(domain);
  }

  // ! for 1 to 1, non-infered domain mapping:
  // const infer = false; // to remove infered parent classes.
  // const queryRes = await sendSPARQLquery(repositoryID, query, infer);
  // const data = queryResultToData(queryRes);
  // let mapping = Object();
  // for (const item of data) {
  //   const { DP, domain } = item;
  //   mapping[DP] = domain;
  // }

  return mapping;
}

export async function getKeyDataProperties() {
  const repositoryID = repo_graphDB;
  const query = `PREFIX owl: <http://www.w3.org/2002/07/owl#>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX : <http://www.semwebtech.org/mondial/10/meta#>
      
  SELECT ?DP
  WHERE {
      ?DP rdf:type owl:InverseFunctionalProperty ;
  #    	owl:inverseOf ?inverseDP .
  #    ?DP rdf:type owl:ObjectProperty .
      FILTER (!isBlank(?DP))
  } 
  
  `;

  const queryRes = await sendSPARQLquery(repositoryID, query);

  const data = queryResultToData(queryRes);

  const DPs = [];
  for (const item of data) {
    DPs.push(item.DP);
  }
  return DPs;
}
