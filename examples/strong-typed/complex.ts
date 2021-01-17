import { Container, ServiceContainer } from '../../src/main';

/**
 * In this example the environment provides some variables to the container.
 * To make this type strong we define a mapping.
 *
 * Note, the value must always be a string as environment values are always strings.
 * This is not something this package is doing, its just how the environment works.
 */
type EnvironmentVariables = {
  'LOCALE': string;
  'TTL': string;
};

/**
 * Parameters can be used to expose environment variables and format/validate them.
 *
 * Here we expose both the environment variables and format them.
 * Assuming here that TTL is a timestamp.
 */
type ServiceParameters = {
  'locale': string;
  'ttl': number;
};

/**
 * These parameters use the environment to ensure the parameters are localised.
 *
 * In this case we have english as a fallback.
 * But we also recognise some Japanese.
 */
const parameters: Container.Parameter.Definition<ServiceParameters, EnvironmentVariables> = {
  'locale': ({ environment }) => environment('LOCALE').toLowerCase(),
  'ttl': ({ environment }) => parseInt(environment('TTL')),
};

/**
 * Here we define a greeting service that takes an input name and outputs a greeting string.
 *
 * Note, here the services are defined as their literal definitions.
 * The service container will expect a special definition that is a wrapped function.
 */
type Services = {
  'greeter': (name: string) => string;
};

/**
 * Services are declared within a wrapper function that provides container services.
 * This is the same as how we will be wrapping your functions later for service depedencies.
 *
 * Note, services are cached once called initially. This isn't a problem for services that
 * are functions, but if you are expecting a new instance of something every time it is
 * best to define a factory and call that instead.
 */
const services: Container.Service.Definition<ServiceParameters, Services> = {
  'greeter': ({ parameter }) => (name) => {
    const locale = parameter('locale');

    if (locale === 'jp') {
      return `こんにちは、${name}`;
    }

    return `Hello ${name}`;
  },
};

type MyContainer = ServiceContainer<Services, ServiceParameters, EnvironmentVariables>;
const container: MyContainer = new ServiceContainer(parameters, services);

type MyHandler = (name: string) => { alive: boolean; greeting?: string; };
type MyHandlerContainerAware = Container.MakeAware<MyContainer, MyHandler>;

const handler: MyHandlerContainerAware = ({ parameter, service }) => (name: string) => {
  const ttl = parameter('ttl');

  if (ttl === 0) {
    return {
      alive: false,
    };
  }

  const greeter = service('greeter');

  return {
    alive: true,
    greeting: greeter(name),
  };
};

container.resolve(handler); // returns MyHandler with dependencies provided
