import { MAIN_HOST } from '../consts';
import { sendGet } from './services/api';

export async function getRepoList() {
  return await sendGet(`${MAIN_HOST}/repositories`, {
    Accept: 'application/sparql-results+json',
  });
}

export async function getStatementsFromRepo(repoId: string) {
  return await sendGet(`${MAIN_HOST}/repositories/${repoId}/statements`, {
    Accept: 'application/json',
  });
}
