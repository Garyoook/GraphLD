import axios from 'axios';

const config = {
  headers: {},
  params: {},
};

export async function sendGet(url: string, headers?: any, params?: any) {
  config.headers = { ...config.headers, ...headers };
  config.params = { ...config.params, ...params };
  return await axios.get(url, config);
}

export async function sendPost(url: string, data: string) {
  return await axios.post(url, data, config);
}

export async function sendSPARQLquery(
  repositoryID: string,
  query: string,
  infer: boolean = true,
) {
  const url = `http://localhost:7200/repositories/${repositoryID}`;
  const header_sqparql = { Accept: 'application/sparql-results+json' };
  const resp = await sendGet(url, header_sqparql, {
    repositoryID: repositoryID,
    query: query,
    infer: infer,
  });

  if (resp.status === 200) {
    return resp.data;
  }
}
