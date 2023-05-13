import {
  getClasses,
  getDatatypeProperties,
  getDomainMapping,
  getFunctionalProperties,
  getKeyDataProperties,
  getObjectProperties,
  getRangeMapping,
} from './SparqlPage/ConceptualModel/service';
import Dashboard from './dashBoard';
import './index.css';

export const DP_Range_mapping = await getRangeMapping();
// console.log('DP-T Map: ', DP_Range_mapping);
console.log('FunctionalDP - Range map ready');

export const classesList = await getClasses();
// console.log('Classes: ', classesList);
console.log('Classes list ready');

export const FunctionalPropsList = await getFunctionalProperties();
// console.log('Functional Props: ', FunctionalPropsList);
console.log('Functional DP list ready');

export const DatatypePropsList = await getDatatypeProperties();
// console.log('Functional Props: ', FunctionalPropsList);
console.log('Datatype Props list ready');

export const ObjectPropsList = await getObjectProperties();
// console.log('Object Props: ', ObjectPropsList);
console.log('Object DP list ready');

export const DP_domain_mapping = await getDomainMapping();
// console.log('DP-Domain Map: ', DP_domain_mapping);
console.log('DP - domain mapping ready');

export const DPKList = await getKeyDataProperties();
// console.log('Key DPs: ', DPKList);
console.log('Key Functional DP list ready');

function HomePage() {
  // ! START experimental code:
  // import mondial_metadata_ from './mondial-meta.json';
  // import { useEffect } from 'react';
  // import { convertPrefixToNamespace } from '../utils';

  // const mondial_metadata = mondial_metadata_;
  // useEffect(() => {
  //   const mondial_metadata_clone: any = [];
  //   for (const item of mondial_metadata) {
  //     convertPrefixToNamespace(item);
  //     mondial_metadata_clone.push(item);
  //   }
  //   console.log('modified', mondial_metadata_clone);
  // }, []);
  // ! END experimental code

  return (
    <div className="App">
      <header className="App-header">
        {/* {RDFPage()} */}
        {Dashboard()}
      </header>
    </div>
  );
}

export default HomePage;
