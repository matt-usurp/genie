import { Container } from '../types';

export const environment = <M extends Container.Environment.Mapping>(mapping: M) => <K extends keyof M>(environment: K): M[K] => {
  const value = mapping[environment];

  if (value === undefined) {
    throw new Error([
      `Environment Variable "${environment}" was not found or populated.`,
      'Please make sure the environment variable is accessible through the "process.env" global.'
    ].join(' '));
  }

  return value;
};
