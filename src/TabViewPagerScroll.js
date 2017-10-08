/* @flow */

import * as React from 'react';
import { Animated, Platform, View, StyleSheet, ScrollView } from 'react-native';
import { PagerRendererPropType } from './TabViewPropTypes';
import type { PagerRendererProps, Route } from './TabViewTypeDefinitions';

type ScrollEvent = {
  nativeEvent: {
    contentOffset: {
      x: number,
      y: number,
    },
  },
};

type State = {
  initialOffset: { x: number, y: number },
};

type Props<T> = PagerRendererProps<T>;

export default class TabViewPagerScroll<T: Route<*>> extends React.Component<
  Props<T>,
  State
> {
  static propTypes = PagerRendererPropType;

  constructor(props: Props<T>) {
    super(props);
    this.state = {
      initialOffset: {
        x: this.props.navigationState.index * this.props.layout.width,
        y: 0,
      },
    };
  }

  state: State;

  componentDidMount() {
    this._scrollTo(
      this.props.navigationState.index * this.props.layout.width,
      false
    );
    this._resetListener = this.props.subscribe('reset', this._scrollTo);
  }

  componentDidUpdate(prevProps: Props<T>) {
    const amount = this.props.navigationState.index * this.props.layout.width;
    if (
      prevProps.navigationState !== this.props.navigationState ||
      prevProps.layout !== this.props.layout
    ) {
      if (
        Platform.OS === 'android' ||
        prevProps.navigationState !== this.props.navigationState
      ) {
        global.requestAnimationFrame(() => this._scrollTo(amount));
      } else {
        this._scrollTo(amount, false);
      }
    }
  }

  componentWillUnmount() {
    this._resetListener.remove();
  }

  _resetListener: Object;
  _scrollView: ?ScrollView;
  _nextOffset = 0;
  _isIdle: boolean = true;

  _scrollTo = (x: number, animated = this.props.animationEnabled !== false) => {
    this._nextOffset = x;

    if (this._isIdle && this._scrollView) {
      this._scrollView.scrollTo({
        x,
        animated,
      });
    }
  };

  _handleMomentumScrollEnd = (e: ScrollEvent) => {
    const nextIndex = Math.round(
      e.nativeEvent.contentOffset.x / this.props.layout.width
    );
    this._isIdle = true;
    this.props.jumpToIndex(nextIndex);
  };

  _handleScroll = (e: ScrollEvent) => {
    this._isIdle =
      Math.abs(e.nativeEvent.contentOffset.x - this._nextOffset) < 0.1;
    this.props.panX.setValue(
      -e.nativeEvent.contentOffset.x + this.props.layout.width
    );
  };

  /* $FlowFixMe */
  _setRef: Function = (el: ScrollView) => (this._scrollView = el._component);

  render() {
    const { children, layout, navigationState } = this.props;
    return (
      <Animated.ScrollView
        horizontal
        pagingEnabled
        directionalLockEnabled
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="always"
        scrollEnabled={this.props.swipeEnabled}
        automaticallyAdjustContentInsets={false}
        bounces={false}
        alwaysBounceHorizontal={false}
        scrollsToTop={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={this._handleScroll}
        onMomentumScrollEnd={this._handleMomentumScrollEnd}
        contentOffset={this.state.initialOffset}
        style={styles.container}
        contentContainerStyle={layout.width ? null : styles.container}
        ref={this._setRef}
      >
        {React.Children.map(children, (child, i) => (
          <View
            key={navigationState.routes[i].key}
            testID={navigationState.routes[i].testID}
            style={
              layout.width
                ? { width: layout.width, overflow: 'hidden' }
                : i === navigationState.index ? styles.page : null
            }
          >
            {i === navigationState.index || layout.width ? child : null}
          </View>
        ))}
      </Animated.ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },

  page: {
    flex: 1,
    overflow: 'hidden',
  },
});
