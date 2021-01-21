import { InternalContainer, ServiceContainer } from './internal';

export class Container<
  ServiceMapping extends Container.Service.Mapping,
  ParameterMapping extends Container.Parameter.Mapping = Container.Parameter.Mapping,
  EnvironmentMapping extends Container.Environment.Mapping = Container.Environment.Mapping,
> extends ServiceContainer<ServiceMapping, ParameterMapping, EnvironmentMapping> {}

export namespace Container {
  export type Definition<
    ServiceMapping extends Container.Service.Mapping,
    ParameterMapping extends Container.Parameter.Mapping,
    EnvironmentMapping extends Container.Environment.Mapping,
  > = {
    services: ServiceMapping;
    parameters: ParameterMapping;
    envars: EnvironmentMapping;
  };

  export namespace Definition {
    export type VagueKind = Definition<any, any, any>;

    export type From<GivenContainer> = (
      GivenContainer extends ServiceContainer<infer InferServices, infer InferParameters, infer InferEnvironmentVariables>
        ? Definition<InferServices, InferParameters, InferEnvironmentVariables>
        : (
          GivenContainer extends InternalContainer<infer InferServices, infer InferParameters, infer InferEnvironmentVariables>
            ? Definition<InferServices, InferParameters, InferEnvironmentVariables>
            : never
        )
    );
  }

  export namespace Environment {
    export type Mapping = Record<string, string | undefined>;

    export type LocatorFunction<EnvironmentMapping extends Mapping> = <K extends keyof EnvironmentMapping>(variable: K) => EnvironmentMapping[K];
    export type LocatorFunctionFactory = <EnvironmentMapping extends Mapping>(mapping: EnvironmentMapping) => LocatorFunction<EnvironmentMapping>;
  }

  export namespace Parameter {
    export type Mapping = Record<string, unknown>;

    export type Definition<
      ParameterMapping extends Mapping,
      EnvironmentMapping extends Environment.Mapping = Environment.Mapping,
    > = {
      [K in keyof ParameterMapping]: FactoryFunction<EnvironmentMapping, ParameterMapping, ParameterMapping[K]>;
    };

    export type FactoryFunctionTooling<
      EnvironmentMapping extends Environment.Mapping,
      ParameterMapping extends Mapping,
    > = {
      environment: Environment.LocatorFunction<EnvironmentMapping>;
      parameter: LocatorFunction<ParameterMapping>;
    };

    export type FactoryFunction<
      EnvironmentMapping extends Environment.Mapping,
      ParameterMapping extends Mapping,
      ReturnValue,
    > = (tooling: FactoryFunctionTooling<EnvironmentMapping, ParameterMapping>) => ReturnValue;

    export type LocatorFunction<ParameterMapping extends Mapping> = <K extends keyof ParameterMapping>(parameter: K) => ParameterMapping[K];
    export type LocatorFunctionFactory = <EnvironmentMapping extends Environment.Mapping, ParameterMapping extends Mapping>(mapping: Definition<ParameterMapping, EnvironmentMapping>) => LocatorFunction<ParameterMapping>;
  }

  export namespace Service {
    export type Mapping = Record<string, unknown>;

    export type Definition<
      ParameterMapping extends Parameter.Mapping,
      ServiceMapping extends Mapping,
    > = {
      [K in keyof ServiceMapping]: FactoryFunction<ParameterMapping, ServiceMapping, ServiceMapping[K]>;
    };

    export type FactoryFunctionTooling<
      ParameterMapping extends Parameter.Mapping,
      ServiceMapping extends Mapping,
    > = {
      parameter: Parameter.LocatorFunction<ParameterMapping>;
      service: LocatorFunction<ServiceMapping>;
    };

    export type FactoryFunction<
      ParameterMapping extends Parameter.Mapping,
      ServiceMapping extends Mapping,
      ReturnValue,
    > = (tooling: FactoryFunctionTooling<ParameterMapping, ServiceMapping>) => ReturnValue;

    export type LocatorFunction<ServiceMapping extends Mapping> = <K extends keyof ServiceMapping>(service: K) => ServiceMapping[K];
    export type LocatorFunctionFactory = <ParameterMapping extends Parameter.Mapping, ServiceMapping extends Mapping>(mapping: Definition<ParameterMapping, ServiceMapping>) => LocatorFunction<ServiceMapping>;
  }

  export type MakeAware<
    GivenDefinition extends Definition.VagueKind,
    Wrapped,
  > = (
    GivenDefinition extends Definition<infer InferServices, infer InferParameters, any>
      ? ContainerAwareFunction<
          InferParameters,
          InferServices,
          Wrapped
        >
      : never
  );

  export type ContainerAwareFunction<
    ParameterMapping extends Parameter.Mapping,
    ServiceMapping extends Service.Mapping,
    Wrapped,
  > = (tooling: Service.FactoryFunctionTooling<ParameterMapping, ServiceMapping>) => Wrapped;

  export namespace Subset {
    export type Compose<
      GivenDefinition extends Definition.VagueKind,
      SubsetParameters extends keyof GivenDefinition['parameters'],
      SubsetServices extends keyof GivenDefinition['services'],
    > = (
      GivenDefinition extends Definition<infer InferServices, infer InferParameters, infer InferEnvironment>
        ? Definition<
            Pick<InferServices, SubsetServices>,
            Pick<InferParameters, SubsetParameters>,
            InferEnvironment
          >
        : never
    );

    export type None = never;
    export type NoParameters = never;
    export type NoServices = never;

    export type Services<
      GivenDefinition extends Definition.VagueKind,
      SubsetServices extends keyof GivenDefinition['services'],
    > = SubsetServices;

    export type Parameters<
      GivenDefinition extends Definition.VagueKind,
      SubsetParameters extends keyof GivenDefinition['parameters'],
    > = SubsetParameters;
  }
}
