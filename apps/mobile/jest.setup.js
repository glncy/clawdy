import 'react-native-gesture-handler/jestSetup';



// Robust Reanimated Mock
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const View = require('react-native').View;

  class AnimatedView extends React.Component {
    render() {
      return <View {...this.props} />;
    }
  }

  class Keyframe {
    duration() { return this; }
    delay() { return this; }
    springify() { return this; }
    withCallback() { return this; }
  }

  return {
    __esModule: true,
    default: {
      View: AnimatedView,
      Text: View,
      Image: View,
      ScrollView: View,
      Code: View,
      createAnimatedComponent: (c) => c,
      addWhitelistedNativeProps: () => {},
      addWhitelistedUIProps: () => {},
    },
    useSharedValue: (v) => ({ value: v }),
    useAnimatedStyle: (fn) => ({}),
    useDerivedValue: (fn) => ({ value: fn() }),
    useReducedMotion: () => false,
    useAnimatedRef: () => ({ current: null }),
    useAnimatedScrollHandler: () => () => {},
    withTiming: (v) => v,
    withSpring: (v) => v,
    withRepeat: (v) => v,
    withSequence: (...args) => args[0],
    withDelay: (d, v) => v,
    Easing: {
      linear: (v) => v,
      ease: (v) => v,
      quad: (v) => v,
      cubic: (v) => v,
      poly: (v) => v,
      sin: (v) => v,
      circle: (v) => v,
      exp: (v) => v,
      elastic: (v) => v,
      back: (v) => v,
      bounce: (v) => v,
      bezier: (v) => v,
      in: (v) => v,
      out: (v) => v,
      inOut: (v) => v,
    },
    ...(() => {
      const chainable = {
        duration() { return this; },
        delay() { return this; },
        springify() { return this; },
        damping() { return this; },
        mass() { return this; },
        stiffness() { return this; },
        overshootClamping() { return this; },
        restDisplacementThreshold() { return this; },
        restSpeedThreshold() { return this; },
        withCallback() { return this; },
        withInitialValues() { return this; },
      };
      return {
        FadeIn: chainable,
        FadeInDown: chainable,
        FadeInUp: chainable,
        FadeOut: chainable,
        LinearTransition: chainable,
      };
    })(),
    Keyframe,
    globalIsAllAnimationsDisabled: () => false,
  };
});
// Mock Worklets
jest.mock('react-native-worklets', () => ({
  Worklets: {
    createRunOnJS: (fn) => fn,
    createRunOnUI: (fn) => fn,
  },
  createSerializable: (val) => val,
}));


