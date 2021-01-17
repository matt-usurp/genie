
type ServiceMapping = Record<string, unknown>;
type SerivceMappingDefinition<M extends ServiceMapping> = {
  [K in keyof M]: () => M[K];
};

type MyServices = {
  foo: number;
  bar: string;
};

const services: SerivceMappingDefinition<MyServices> = {
  foo: () => 1,
  bar: () => 'foo',
};

type ParameterMapping = Record<string, unknown>;
type ParameterMappingDefinition<M extends ParameterMapping> = {
  [K in keyof M]: () => M[K];
};

type MyParameters = {
  baz: string;
};

const parameters: ParameterMappingDefinition<MyParameters> = {
  baz: () => 'boo',
};

type ServiceLocatorFunction<S> = <K extends keyof S>(service: K) => S[K];
type ParameterLocatorFunction<P> = <K extends keyof P>(parameter: K) => P[K];

type FunctionWrapper<S, P, R> = (
  tooling: {
    service: ServiceLocatorFunction<S>;
    parameter: ParameterLocatorFunction<P>;
  },
) => R;

declare class ServiceProvider<S extends ServiceMapping, P extends ParameterMapping> {
  public readonly services: SerivceMappingDefinition<S>;
  public readonly parameters: ParameterMappingDefinition<P>;

  public constructor(
    services: SerivceMappingDefinition<S>,
    parameters: ParameterMappingDefinition<P>,
  );

  public provide<R>(fn: FunctionWrapper<S, P, R>): R;
}

const di = new ServiceProvider<MyServices, MyParameters>(services, parameters);
type MyContainer = typeof di;

const provided = di.provide(({ service, parameter }) => (a: number) => {
  service('foo');
  parameter('baz');

  return a;
});

provided(1);

type ServiceAware<P extends ServiceProvider<any, any>, R> = P extends ServiceProvider<infer S, infer P>
  ? FunctionWrapper<S, P, R>
  : never;

type MyWrapperFunction = ServiceAware<MyContainer, (a: number) => number>;

const a: MyWrapperFunction = () => (a) => a;

const aaaaaa = di.provide(a);

aaaaaa(1);

type CreateSubset<INN extends ServiceProvider<ServiceMapping, ParameterMapping>, NS extends keyof INN['services'], NP extends keyof INN['parameters']> = (
  INN extends ServiceProvider<infer S, infer P>
    ? ServiceProvider<Pick<S, NS>, Pick<P, NP>>
    : never
);

type CreateServiceSubset<INN extends ServiceProvider<ServiceMapping, ParameterMapping>, NS extends keyof INN['services']> = NS;
type CreateParameterSubset<INN extends ServiceProvider<ServiceMapping, ParameterMapping>, NS extends keyof INN['parameters']> = NS;

type MySubsetServices = CreateServiceSubset<MyContainer, 'bar'>;
type MySubsetParameters = CreateParameterSubset<MyContainer, never>;

type MySubset = CreateSubset<MyContainer, MySubsetServices, MySubsetParameters>;
type MySubsetWrapperFunction = ServiceAware<MySubset, (a: number) => number>;

const b: MySubsetWrapperFunction = ({ service }) => (a: number) => {
  service('bar');

  return a;
};

const aaa = di.provide(b);

aaa(1);
