import {
  getClasses,
  getDomainMapping,
  getFunctionalProperties,
  getObjectProperties,
  getRangeMapping,
} from './SparqlPage/ConceptualModel/service';
import Dashboard from './dashBoard';
import './index.css';

export const DP_Range_mapping = await getRangeMapping();
console.log('DP-T Map: ', DP_Range_mapping);

export const classesList = await getClasses();
console.log('Classes: ', classesList);

export const FunctionalPropsList = await getFunctionalProperties();
console.log('Functional Props: ', FunctionalPropsList);

export const ObjectPropsList = await getObjectProperties();
console.log('Object Props: ', ObjectPropsList);

export const DP_domain_mapping = await getDomainMapping();
console.log('DP-Domain Map: ', DP_domain_mapping);

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
