import { store } from '../core/store';
import { CURRENT_MATERIAL_TYPE } from '../const/symbol';
import { bind, convert2UniqueString } from '../utils/common';
import { Mutation, EMaterialType, BabelDescriptor } from '../interfaces';
import { invariant } from '../utils/error';
import { quacksLikeADecorator } from '../utils/decorator';

function createMutation(target: Object, name: string | symbol | number, original: any, isAtom: boolean) {
  const stringMethodName = convert2UniqueString(name);
  return function (...payload: any[]) {
    this[CURRENT_MATERIAL_TYPE] = EMaterialType.MUTATION;
    store.dispatch({
      name: stringMethodName,
      payload,
      type: EMaterialType.MUTATION,
      domain: this,
      original: bind(original, this) as Mutation,
      isAtom,
    });
    /**
     * @todo: 如果从 effect 进来，设置成 effect，否则设置成 default
     */
    this[CURRENT_MATERIAL_TYPE] = EMaterialType.DEFAULT;
  };
}

/**
 * decorator @mutation, update state by mutation styling.
 */
export function mutation(...args: any[]) {
  let isAtom: boolean = false;
  const decorator = (target: Object, name: string | symbol | number, descriptor?: BabelDescriptor<any>): any => {
    // typescript only: @mutation method = () => {}
    if (descriptor === void 0) {
      let mutationFunc: Function;
      Object.defineProperty(target, name, {
        enumerable: true,
        configurable: true,
        get: function () {
          return mutationFunc;
        },
        set: function (original) {
          mutationFunc = createMutation(target, name, original, isAtom);
        },
      });
      return;
    }

    // babel/typescript: @mutation method() {}
    if (descriptor.value !== void 0) {
      const original: Mutation = descriptor.value;
      descriptor.value = createMutation(target, name, original, isAtom);
      return descriptor;
    }

    // babel only: @mutation method = () => {}
    const { initializer } = descriptor;
    descriptor.initializer = function () {
      invariant(!!initializer, 'The initializer of the descriptor doesn\'t exist, please compile it by using babel and correspond decorator plugin.');

      return createMutation(target, name, initializer && initializer.call(this), isAtom);
    };

    return descriptor;
  }

  if (quacksLikeADecorator(args)) {
    // @decorator
    return decorator.apply(null, args as any);
  }
  // @decorator(args)
  isAtom = args[0] !== void 0 ? args[0] : false;

  return decorator;
}
