import { Container } from './definition';

export class ServiceContainer<
  ServiceMapping extends Container.Service.Mapping,
  ParameterMapping extends Container.Parameter.Mapping = Container.Parameter.Mapping,
  EnvironmentMapping extends Container.Environment.Mapping = Container.Environment.Mapping,
> {
  public constructor(
    public readonly parameters: Container.Parameter.Definition<ParameterMapping, EnvironmentMapping>,
    public readonly services: Container.Service.Definition<ParameterMapping, ServiceMapping>,
  ) {}

  public resolve<WrapperFunction>(fn: Container.ContainerAwareFunction<ParameterMapping, ServiceMapping, WrapperFunction>): WrapperFunction {
    return fn as any;
  }
}
