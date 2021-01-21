import { Container } from './core';

type ContainerCache = {
  parameters: Partial<Container.Parameter.Mapping>;
  services: Partial<Container.Service.Mapping>;
};

export class InternalContainer<
  ServiceMapping extends Container.Service.Mapping,
  ParameterMapping extends Container.Parameter.Mapping,
  EnvironmentMapping extends Container.Environment.Mapping,
> {
  private readonly caches: ContainerCache = {
    parameters: {},
    services: {},
  };

  public constructor(
    public readonly parameters: Container.Parameter.Definition<ParameterMapping, EnvironmentMapping>,
    public readonly services: Container.Service.Definition<ParameterMapping, ServiceMapping>,
    public readonly env: EnvironmentMapping,
  ) {}

  public resolve<
    WrapperFunction,
    GivenFunction extends Container.ContainerAwareFunction<UnknownParameterMapping, UnknownServiceMapping, WrapperFunction>,
    UnknownParameterMapping extends ParameterMapping,
    UnknownServiceMapping extends ServiceMapping,
  >(fn: GivenFunction): WrapperFunction {
    return fn({
      parameter: this.parameter.bind(this),
      service: this.service.bind(this),
    });
  }

  public service<
    UnknownServiceMapping extends ServiceMapping,
    K extends keyof ServiceMapping
  >(service: K): UnknownServiceMapping[K] {
    const cached = this.caches.services[service];

    if (cached !== undefined) {
      // Seems that negative checks on undefined do not removed undefined from the type.
      // This assertion should be considered safe.
      return cached as UnknownServiceMapping[K];
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

    this.caches.services[service] = resolved;

    return resolved as unknown as UnknownServiceMapping[K];
  }

  public parameter<
    UnknownParameterMapping extends ParameterMapping,
    K extends keyof UnknownParameterMapping,
  >(parameter: K): UnknownParameterMapping[K] {
    const cached = this.caches.parameters[parameter];

    if (cached !== undefined) {
      // Seems that negative checks on undefined do not removed undefined from the type.
      // This assertion should be considered safe.
      return cached as UnknownParameterMapping[K];
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

    this.caches.parameters[parameter] = resolved;

    return resolved as unknown as UnknownParameterMapping[K];
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
  ParameterMapping extends Container.Parameter.Mapping,
  EnvironmentMapping extends Container.Environment.Mapping,
> {
  private readonly internal: InternalContainer<ServiceMapping, ParameterMapping, EnvironmentMapping>;

  public constructor(
    parameters: Container.Parameter.Definition<ParameterMapping, EnvironmentMapping>,
    services: Container.Service.Definition<ParameterMapping, ServiceMapping>,
  ) {
    this.internal = new InternalContainer<ServiceMapping, ParameterMapping, EnvironmentMapping>(
      parameters,
      services,
      process.env as unknown as EnvironmentMapping,
    );
  }

  public resolve<WrapperFunction>(fn: Container.ContainerAwareFunction<ParameterMapping, ServiceMapping, WrapperFunction>): WrapperFunction {
    return this.internal.resolve(fn);
  }
}
