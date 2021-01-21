import { Container } from '../../src/main';

type MyServices = {
  'name.knighted': (input: string) => string;
};

type MyParameters = {
  'title.sir': string;
};

type MyContainerInstance = Container<MyServices, MyParameters>;
type MyContainer = Container.Definition.From<MyContainerInstance>;

const container: MyContainerInstance = new Container(
  {
    'title.sir': () => 'Sir',
  },
  {
    'name.knighted': ({ parameter }) => (input: string) => {
      const title = parameter('title.sir');

      return `${title} ${input}`;
    },
  },
);

type MyFunctionToWrap = (input: string) => string;

type MySubsetParameters = Container.Subset.Parameters<MyContainer, Container.Subset.None>;
type MySubsetServices = Container.Subset.Services<MyContainer, 'name.knighted'>;

type MySubsetContainer = Container.Subset.Compose<MyContainer, MySubsetParameters, MySubsetServices>;
type MySubsetWrapped = Container.MakeAware<MySubsetContainer, MyFunctionToWrap>;

const fn: MySubsetWrapped = ({ parameter, service }) => (name: string) => {
  // parameter(''); // cannot be used, no parameters available

  const knight = service('name.knighted');

  return knight(name);
};

container.resolve(fn); // returns MyFunctionToWrap
