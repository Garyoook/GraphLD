const node_env = process.env.NODE_ENV;
// export const GRAPHDB_HOST = 'http://127.0.0.1:7200';
export const GRAPHDB_HOST =
  node_env === 'production'
    ? 'http://146.169.43.78:7200'
    : 'http://127.0.0.1:7200';

export const GraphDB_config = {
  repo_graphDB: 'SemanticWebVis',
  db_prefix_URL: 'http://www.semwebtech.org/mondial/10/meta#',
};
