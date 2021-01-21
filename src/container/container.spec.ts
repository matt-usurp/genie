import { Container } from '../main';
import { InternalContainer } from './container';

type TestEnvironmentMapping = {
  ENV_FOO: string;
  ENV_BAR: string;
};

const env: TestEnvironmentMapping = {
  ENV_FOO: 'assert:environment:foo',
  ENV_BAR: 'assert:environment:bar',
};

type TestParameterMapping = {
  'param.foo': string;
  'param.bar': string;
  'static.baz': number;
};

const params: Container.Parameter.Definition<TestParameterMapping, TestEnvironmentMapping> = {
  'param.foo': ({ environment }) => environment('ENV_FOO'),
  'param.bar': ({ environment }) => `assert:parameter(${environment('ENV_BAR')})`,
  'static.baz': () => 1234,
};

type TestServiceMapping = {
  'bazzer': (input: number) => number;
  'foobar': () => string;
};

const services: Container.Service.Definition<TestParameterMapping, TestServiceMapping> = {
  'bazzer': ({ parameter }) => (input) => input + parameter('static.baz'),
  'foobar': ({ parameter }) => () => `assert:service(${parameter('param.foo')} && ${parameter('param.bar')})`,
};

// type TestContainer = PublicServiceContainer<TestServiceMapping, TestParameterMapping, TestEnvironmentMapping>;

const ignore = {} as any;

describe('src/container/container.ts', (): void => {
  describe('InternalContainer', () => {
    describe('environment', (): void => {
      it('with valid environment map, return value', async(): Promise<void> => {
        const container = new InternalContainer(ignore, ignore, env);

        expect(container.environment('ENV_FOO')).toEqual('assert:environment:foo');
        expect(container.environment('ENV_BAR')).toEqual('assert:environment:bar');
      });
    });

    describe('parameter', (): void => {
      it('with valid parameter map, return value', async(): Promise<void> => {
        const container = new InternalContainer(params, ignore, env);

        expect(container.parameter('param.foo')).toEqual('assert:environment:foo');
        expect(container.parameter('param.bar')).toEqual('assert:parameter(assert:environment:bar)');
        expect(container.parameter('static.baz')).toEqual(1234);
      });
    });

    describe('service', (): void => {
      it('with valid service map, return value', async(): Promise<void> => {
        const container = new InternalContainer(params, services, env);

        expect(container.service('bazzer')(10000)).toBe(11234);
        expect(container.service('foobar')()).toBe('assert:service(assert:environment:foo && assert:parameter(assert:environment:bar))');
      });
    });
  });
});
