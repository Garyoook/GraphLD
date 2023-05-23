import { db_prefix_URL } from '@/consts';
var stringSimilarity = require('string-similarity');

const testcases = [
  `SELECT ?inflation ?unemployment WHERE {
		?c rdf:type :Country ;
		   :inflation ?inflation ;
		   :unemployment ?unemployment .
	}`,
  `SELECT ?continent ?carcode ?population 
	WHERE {
		?c rdf:type :Country ;
		   :carCode ?carcode ;
		   :population ?population ;
		   :encompassedByInfo ?en .
		?en :encompassedBy ?con ;
			:percent ?percent .
		?con rdf:type :Continent ;
			 :name ?continent .
	}`,
  `SELECT ?country ?year ?population 
	WHERE {
		?c rdf:type :Country ; 
		   :name ?country ;
		   :encompassedByInfo ?en .
		?py rdf:type :PopulationCount ;
			:year ?year;
			:value ?population .
		?c 	:hadPopulation ?py .
	}`,
  `SELECT ?country1 ?country2 ?length
	WHERE {
		?b rdf:type :Border ;
		   :isBorderOf ?c1 ;
		   :isBorderOf ?c2 ;
		   :length ?length .
	  ?c1 rdf:type :Country ;
		  :carCode ?country1 .
	  ?c2 rdf:type :Country ;
		  :carCode ?country2 .
	}`,
];

const patterns = [
  `SELECT ?TAK ?TA1 ?TAn WHERE {
	?CA rdf:type :CA ;
	:DPAK ?TAK ;
	:DPA1 ?TA1 .
	}`,
  `SELECT ?TBK ?TAK ?TA1 ?TB1 WHERE {
	?CA rdf:type :CA ;
	:DPAK ?TAK ;
	:DPA1 ?TA1 .
	?CB rdf:type :CB ;
	:DPBK ?TBK ;
	:DPB1 ?TB1 .
	?CA :PAB ?CB .
	}`,
  `SELECT ?TBK ?TCK ?TA1 WHERE {
	?CA rdf:type :CA ;
		:PAB ?CB ;
		:PAC ?CC ;
		:DPA1 ?TA1 .
	?CB rdf:type :CB ;
		:DPBK ?TBK ;
	?CC rdf:type :CC ;
		:DPCK ?TCK ;
		}`,
  ``,
];

const sim = stringSimilarity.findBestMatch(
  `SELECT ?TAK ?TA1 ?TAn WHERE {
	?CA rdf:type :CA ;
	:DPAK ?TAK ;
	:DPA1 ?TA1 .
	}`,
  [
    `SELECT ?inflation ?unemployment WHERE {
		?c rdf:type :Country ;
		   :inflation ?inflation ;
		   :unemployment ?unemployment .
	}`,
    `SELECT ?continent ?carcode ?population 
	WHERE {
		?c rdf:type :Country ;
		   :carCode ?carcode ;
		   :population ?population ;
		   :encompassedByInfo ?en .
		?en :encompassedBy ?con ;
			:percent ?percent .
		?con rdf:type :Continent ;
			 :name ?continent .
		FILTER ( ?percent > 50)
	}`,
    `SELECT ?country ?year ?population 
	WHERE {
		?c rdf:type :Country ; 
		   :name ?country ;
		   :encompassedByInfo ?en .
		?py rdf:type :PopulationCount ;
			:year ?year;
			:value ?population .
		?c 	:hadPopulation ?py .
	# Filter conditions
		?en :encompassedBy ?con .
		?con rdf:type :Continent ;
			 :name "Australia/Oceania" .
	}`,
    `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
	PREFIX : <${db_prefix_URL}>
	SELECT ?country1 ?country2 ?length
	WHERE {
		?b rdf:type :Border ;
		   :isBorderOf ?c1 ;
		   :isBorderOf ?c2 ;
		   :length ?length .
	  ?c1 rdf:type :Country ;
		  :carCode ?country1 .
	  ?c2 rdf:type :Country ;
		  :carCode ?country2 .
	  # Filter conditions
	  FILTER (?country1<?country2)
	}`,
  ],
);

// console.log(sim);

const target = testcases[3];

const sim2 = stringSimilarity.findBestMatch(target, patterns);
console.log(sim2);
