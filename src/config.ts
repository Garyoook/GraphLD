const node_env = process.env.NODE_ENV;

// const GRAPHDB_HOST_DEV = 'http://127.0.0.1:7200';
// const GRAPHDB_HOST_PROD = 'http://146.169.43.78:7200';
const GRAPHDB_HOST_DEV = 'http://127.0.0.1:7200';
const GRAPHDB_HOST_PROD = 'http://graphdb.doc.ic.ac.uk';

export const GRAPHDB_HOST =
  node_env === 'production' ? GRAPHDB_HOST_PROD : GRAPHDB_HOST_DEV;
