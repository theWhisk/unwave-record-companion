import { Axiom } from '@axiomhq/js';

const token = process.env.AXIOM_TOKEN;
const dataset = process.env.AXIOM_DATASET;
const isConfigured = Boolean(token && dataset);

const axiomClient = isConfigured ? new Axiom({ token: token! }) : null;

type Fields = Record<string, unknown>;

function makeLog(level: 'info' | 'warn' | 'error') {
  return (message: string, fields: Fields = {}): void => {
    if (!axiomClient) return;
    axiomClient.ingest(dataset!, [{ level, message, ...fields }]);
  };
}

export const log = {
  info:  makeLog('info'),
  warn:  makeLog('warn'),
  error: makeLog('error'),
};

export async function flushAxiom(): Promise<void> {
  if (!axiomClient) return;
  await axiomClient.flush();
}
