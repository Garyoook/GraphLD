import { Backdrop, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
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

export const ConceptualModelInfo: any = {};

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
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    initConceptualModelInfo().then(() => {
      console.log('Conceptual Model Info ready');
    });
  }, []);

  async function initConceptualModelInfo() {
    try {
      setLoading(true);
      const DP_Range_mapping = await getRangeMapping();
      // console.log('DP-T Map: ', DP_Range_mapping);
      console.log('FunctionalDP - Range map ready');

      const classesList = await getClasses();
      // console.log('Classes: ', classesList);
      console.log('Classes list ready');

      const FunctionalPropsList = await getFunctionalProperties();
      // console.log('Functional Props: ', FunctionalPropsList);
      console.log('Functional DP list ready');

      const DatatypePropsList = await getDatatypeProperties();
      // console.log('Functional Props: ', FunctionalPropsList);
      console.log('Datatype Props list ready');

      const ObjectPropsList = await getObjectProperties();
      // console.log('Object Props: ', ObjectPropsList);
      console.log('Object DP list ready');

      const DP_domain_mapping = await getDomainMapping();
      // console.log('DP-Domain Map: ', DP_domain_mapping);
      console.log('DP - domain mapping ready');

      const DPKList = await getKeyDataProperties();
      // console.log('Key DPs: ', DPKList);
      console.log('Key Functional DP list ready');

      ConceptualModelInfo['DP_Range_mapping'] = DP_Range_mapping;
      ConceptualModelInfo['classesList'] = classesList;
      ConceptualModelInfo['FunctionalPropsList'] = FunctionalPropsList;
      ConceptualModelInfo['DatatypePropsList'] = DatatypePropsList;
      ConceptualModelInfo['ObjectPropsList'] = ObjectPropsList;
      ConceptualModelInfo['DP_domain_mapping'] = DP_domain_mapping;
      ConceptualModelInfo['DPKList'] = DPKList;
    } catch (error) {
      console.log(error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        {/* {RDFPage()} */}
        {loading ? (
          <Backdrop
            sx={{
              color: '#fff',
              fontSize: 60,
              fontWeight: 'bold',
              backgroundColor: '#1976d2',
              zIndex: (theme) => theme.zIndex.drawer + 1,
            }}
            open={loading}
          >
            <CircularProgress color="inherit" />

            <div style={{ marginLeft: 20 }}> Loading LD visualiser </div>
          </Backdrop>
        ) : (
          Dashboard()
        )}
      </header>
    </div>
  );
}

export default HomePage;
