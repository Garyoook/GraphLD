import store from '@/store';
import { Backdrop, Box, Grow, LinearProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import Dashboard from './dashBoard';
import './index.css';

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
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  function FullScreenLoading() {
    return (
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
            GraphLD
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
    );
  }

  return (
    <Provider store={store}>
      <div className="App">
        <header className="App-header">
          {/* {RDFPage()} */}
          {loading ? FullScreenLoading() : ''}
          <div style={{ display: loading ? 'none' : 'block' }}>
            {Dashboard()}
          </div>
        </header>
      </div>
    </Provider>
  );
}

export default HomePage;
