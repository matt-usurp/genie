import { Container } from '../../src/main';

type PaginationResolverInput = Record<string, string>;
type PaginationResolverOutput = {
  page: number;
  limit: number;
};

/**
 * A simplistic example of a function that takes in some query parameters and tries to resolve an output.
 */
type PaginationResolver = (query: PaginationResolverInput) => PaginationResolverOutput;

/**
 * These are parameters that we can enforce the owning container to define.
 * Not defining these parameters will cause a build error when given to "resolve()".
 */
type PaginationDependantParameters = {
  'pagination.page.default': number;
  'pagination.limit.default': number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PaginationDependantContainer = Container.Definition<any, PaginationDependantParameters, never>;
type ContainerAwarePaginationResolver = Container.MakeAware<PaginationDependantContainer, PaginationResolver>;

export const pagination: ContainerAwarePaginationResolver = ({ parameter }) => (query) => {
  return {
    page: query['page'] ? parseInt(query['page']) : parameter('pagination.page.default'),
    limit: query['limit'] ? parseInt(query['limit']) : parameter('pagination.limit.default'),
  };
};

// --
// -- Somewhere where middleware is being consumed.
// --

/**
 * All parameters that my container defines.
 * Although its missing those defined by "MyContainerParameters".
 */
type MyContainerParameters = {
  'locale': string;
};

/**
 * Declaring the container as an example.
 *
 * Note, here we merge in the dependant parameters so the "resolve()" function works as expected.
 * This would require us to define the parameters in the definition when constructing our container.
 */
declare const container: Container<never, MyContainerParameters & PaginationDependantParameters, never>;

// Resolves as expected :+1:
const resolved = container.resolve(pagination);

// As expected the following calls will be evaluated as follows.
// In the first example the default values are used.
resolved({}); // { page: parameter('pagination.page.default'), limit: parameter('pagination.limit.default') }
resolved({ page: '5', limit: '10' }); // { page: 5, limit: 10 }
