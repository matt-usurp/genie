import { Container } from './types';

type ServiceContainerCache<
  ParameterMapping extends Container.Parameter.Mapping,
  ServiceMapping extends Container.Service.Mapping,
> = {
  parameters: Partial<ParameterMapping>;
  services: Partial<ServiceMapping>;
};

export class PublicServiceContainer<
  ServiceMapping extends Container.Service.Mapping,
  ParameterMapping extends Container.Parameter.Mapping = Container.Parameter.Mapping,
  EnvironmentMapping extends Container.Environment.Mapping = Container.Environment.Mapping,
> {
  private readonly caches: ServiceContainerCache<ParameterMapping, ServiceMapping> = {
    parameters: {},
    services: {},
  };

  public constructor(
    public readonly parameters: Container.Parameter.Definition<ParameterMapping, EnvironmentMapping>,
    public readonly services: Container.Service.Definition<ParameterMapping, ServiceMapping>,
    public readonly env: EnvironmentMapping,
  ) {}

  public resolve<WrapperFunction>(fn: Container.ContainerAwareFunction<ParameterMapping, ServiceMapping, WrapperFunction>): WrapperFunction {
    return fn({
      parameter: this.parameter.bind(this),
      service: this.service.bind(this),
    });
  }

  public service<K extends keyof ServiceMapping>(service: K): ServiceMapping[K] {
    const cached = this.caches.services[service];

    if (cached !== undefined) {
      // Seems that negative checks on undefined do not removed undefined from the type.
      // This assertion should be considered safe.
      return cached as ServiceMapping[K];
    }

    const resolver = this.services[service];

    if (resolver === undefined) {
      throw new Error([
        `Service "${service}" has no factory or resolver assigned.`,
        'Please make sure the service definition map is valid.'
      ].join(' '));
    }

    const resolved = resolver({
      parameter: this.parameter.bind(this),
      service: this.service.bind(this),
    });

    return this.caches.services[service] = resolved;
  }

  public parameter<K extends keyof ParameterMapping>(parameter: K): ParameterMapping[K] {
    const cached = this.caches.parameters[parameter];

    if (cached !== undefined) {
      // Seems that negative checks on undefined do not removed undefined from the type.
      // This assertion should be considered safe.
      return cached as ParameterMapping[K];
    }

    const resolver = this.parameters[parameter];

    if (resolver === undefined) {
      throw new Error([
        `Parameter "${parameter}" has no factory or resolver assigned.`,
        'Please make sure the parameter definition map is valid.'
      ].join(' '));
    }

    const resolved = resolver({
      environment: this.environment.bind(this),
      parameter: this.parameter.bind(this),
    });

    return this.caches.parameters[parameter] = resolved;
  }

  public environment<K extends keyof EnvironmentMapping>(environment: K): EnvironmentMapping[K] {
    const value = this.env[environment];

    if (value === undefined) {
      throw new Error([
        `Environment Variable "${environment}" was not found or populated.`,
        'Please make sure the environment variable is accessible through the "process.env" global.'
      ].join(' '));
    }

    return value;
  }
}

export class ServiceContainer <
  ServiceMapping extends Container.Service.Mapping,
  ParameterMapping extends Container.Parameter.Mapping = Container.Parameter.Mapping,
  EnvironmentMapping extends Container.Environment.Mapping = Container.Environment.Mapping,
> {
  private readonly internal: PublicServiceContainer<ServiceMapping, ParameterMapping, EnvironmentMapping>;

  public constructor(
    parameters: Container.Parameter.Definition<ParameterMapping, EnvironmentMapping>,
    services: Container.Service.Definition<ParameterMapping, ServiceMapping>,
  ) {
    this.internal = new PublicServiceContainer<ServiceMapping, ParameterMapping, EnvironmentMapping>(
      parameters,
      services,
      process.env as unknown as EnvironmentMapping,
    );
  }

  public resolve<WrapperFunction>(fn: Container.ContainerAwareFunction<ParameterMapping, ServiceMapping, WrapperFunction>): WrapperFunction {
    return this.internal.resolve(fn);
  }
}
