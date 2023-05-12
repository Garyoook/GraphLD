const regex = /(?<!rdf)(?:\?|:)[a-zA-Z_][a-zA-Z0-9_]*/gm;

// Alternative syntax using RegExp constructor
// const regex = new RegExp('(?<!rdf)(?:\\?|:)([a-zA-Z_][a-zA-Z0-9_]*)', 'gm')

const str = `SELECT ?TBK ?TAK ?TA1 ?TB1 WHERE {
?CA rdf:type :CA ;
:DPAK ?TAK ;
:DPA1 ?TA1 .
?CB rdf:type :CB ;
:DPBK ?TBK ;
:DPB1 ?TB1 .
?CA :PAB ?CB .
}`;
let m;

while ((m = regex.exec(str)) !== null) {
  // This is necessary to avoid infinite loops with zero-width matches
  if (m.index === regex.lastIndex) {
    regex.lastIndex++;
  }

  // The result can be accessed through the `m`-variable.
  m.forEach((match, groupIndex) => {
    console.log(`Found match, group ${groupIndex}: ${match}`);
  });
}
