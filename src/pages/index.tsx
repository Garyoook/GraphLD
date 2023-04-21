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
