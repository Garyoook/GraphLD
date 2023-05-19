import { Backdrop, Box, Grow, LinearProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  getClasses,
  getDatatypeProperties,
  getDomainMapping,
  getFunctionalProperties,
  getKeyDataProperties,
  getObjectPropertiesList,
  getObjectPropertyMapping,
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
  const [loading, setLoading] = useState<boolean>(true);

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

      const ObjectPropsList = await getObjectPropertiesList();
      // console.log('Object Props: ', ObjectPropsList);
      console.log('Object DP list ready');

      const ObjectPropsMapping = await getObjectPropertyMapping();
      // console.log('Object Props Mapping: ', ObjectPropsMapping);
      console.log('Object DP mapping ready');

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
      ConceptualModelInfo['ObjectPropsMapping'] = ObjectPropsMapping;
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
              fontFamily: '"Gill Sans", sans-serif',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
            open={loading}
            TransitionComponent={Grow}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                margin: 30,
              }}
            >
              <div
                style={{
                  marginRight: 20,
                  alignSelf: 'flex-end',
                }}
              >
                Graph LD
              </div>

              <div
                style={{
                  color: '#fff',
                  fontSize: 30,
                  alignSelf: 'flex-end',
                }}
              >
                - better way to know your Linked Data
              </div>
            </div>

            <Box
              sx={{
                width: '60%',
              }}
            >
              <LinearProgress color="inherit" />
            </Box>
          </Backdrop>
        ) : (
          Dashboard()
        )}
      </header>
    </div>
  );
}

export default HomePage;
