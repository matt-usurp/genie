import { ServiceContainer } from './service';

export namespace Container {
  type VagueContainerConstraint = ServiceContainer<any, any, any>;

  export namespace Environment {
    export type Mapping = Record<string, string>;

    export type LocatorFunction<GivenMapping extends Mapping> = <K extends keyof GivenMapping>(variable: K) => GivenMapping[K];
  }

  export namespace Parameter {
    export type Mapping = Record<string, unknown>;

    export type Definition<
      ParameterMapping extends Mapping,
      EnvironmentMapping extends Environment.Mapping = Environment.Mapping,
    > = {
      [K in keyof ParameterMapping]: DefineFunction<EnvironmentMapping, ParameterMapping, ParameterMapping[K]>;
    };

    export type DefineFunction<
      EnvironmentMapping extends Environment.Mapping,
      ParameterMapping extends Mapping,
      ReturnValue,
    > = (
      tooling: {
        environment: Environment.LocatorFunction<EnvironmentMapping>;
        parameter: LocatorFunction<ParameterMapping>;
      },
    ) => ReturnValue;

    export type LocatorFunction<GivenMapping extends Mapping> = <K extends keyof GivenMapping>(parameter: K) => GivenMapping[K];
  }

  export namespace Service {
    export type Mapping = Record<string, unknown>;

    export type Definition<
      ParameterMapping extends Parameter.Mapping,
      ServiceMapping extends Mapping,
    > = {
      [K in keyof ServiceMapping]: DefineFunction<ParameterMapping, ServiceMapping, ServiceMapping[K]>;
    };

    export type DefineFunction<
      ParameterMapping extends Parameter.Mapping,
      ServiceMapping extends Mapping,
      ReturnValue,
    > = (
      tooling: {
        parameter: Parameter.LocatorFunction<ParameterMapping>;
        service: LocatorFunction<ServiceMapping>;
      },
    ) => ReturnValue;

    export type LocatorFunction<M extends Mapping> = <K extends keyof M>(service: K) => M[K];
  }

  export type MakeAware<
    GivenProvider extends VagueContainerConstraint,
    Wrapped,
  > = (
    GivenProvider extends ServiceContainer<infer InferServices, infer InferParameters, any>
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
  > = (
    tooling: {
      parameter: Parameter.LocatorFunction<ParameterMapping>;
      service: Service.LocatorFunction<ServiceMapping>;
    },
  ) => Wrapped;

  export namespace Subset {
    export type Compose<
      GivenProvider extends VagueContainerConstraint,
      SubsetParameters extends keyof GivenProvider['parameters'],
      SubsetServices extends keyof GivenProvider['services'],
    > = (
      GivenProvider extends ServiceContainer<infer InferServices, infer InferParameters, infer InferEnvironment>
        ? ServiceContainer<
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
      GivenProvider extends VagueContainerConstraint,
      SubsetServices extends keyof GivenProvider['services'],
    > = SubsetServices;

    export type Parameters<
      GivenProvider extends VagueContainerConstraint,
      SubsetParameters extends keyof GivenProvider['parameters'],
    > = SubsetParameters;
  }
}
