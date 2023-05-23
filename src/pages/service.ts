import { GRAPHDB_HOST } from '../config';
import { sendGet } from './services/api';

export async function getRepoList() {
  return await sendGet(`${GRAPHDB_HOST}/repositories`, {
    Accept: 'application/sparql-results+json',
  });
}

export async function getStatementsFromRepo(repoId: string) {
  return await sendGet(`${GRAPHDB_HOST}/repositories/${repoId}/statements`, {
    Accept: 'application/json',
  });
}
