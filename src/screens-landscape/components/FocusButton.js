import React, {useCallback, useState} from 'react';
import {Animated, View, TouchableHighlight} from 'react-native';
// import GLOBALModule from '../../datalayer/global';
var GLOBALModule = require('../../datalayer/global');
var GLOBAL = GLOBALModule.default;

const FocusButton = props => {
    const [focus, setFocus] = useState(false);

    const onFocus = useCallback(() => {
        setFocus(true);
    }, []);

    const onBlur = useCallback(() => {
        setFocus(false);
    }, []);
    focusButton = () => {
        if (props.hideUnderlay != true) {
            return;
        }
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 150,
            //easing: Easing.ease
        }).start();
    };
    blurButton = () => {
        if (props.hideUnderlay != true) {
            return;
        }
        Animated.timing(animatedValue, {
            toValue: 0,
            duration: 150,
            //easing: Easing.ease
        }).start();
    };

    animatedValue = new Animated.Value(0);
    fadeAnimation = new Animated.Value(1);

    const styles = [
        props.style,
        {
            padding: GLOBAL.BUTTON_MARGIN,
            backgroundColor: 'transparent',
            borderRadius:
                props.BorderRadius != undefined ? props.BorderRadius : 0,
        },
    ];

    return (
        <TouchableHighlight
            {...props}
            hasTVPreferredFocus={props.hasTVPreferredFocus}
            removeMoveResponder
            activeOpacity={1}
            //onPressIn={() => focusButton()}
            //onPressOut={() => blurButton()}
            onBlur={() => {
                if (props.onBlurExtra != undefined) {
                    props.onBlurExtra();
                }
                onBlur();
            }}
            onFocus={() => {
                if (props.onFocusExtra != undefined) {
                    props.onFocusExtra();
                }
                onFocus();
            }}
            style={[
                styles,
                {backgroundColor: focus ? GLOBAL.Button_Color : null},
            ]}
        >
            <Animated.View
                style={[
                    styles,
                    {
                        flex: 1,

                        transform: [
                            {
                                scaleX: animatedValue.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [1, 1.3],
                                }),
                            },
                            {
                                scaleY: animatedValue.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [1, 1.3],
                                }),
                            },
                        ],
                    },
                ]}
            >
                {props.children}
            </Animated.View>
        </TouchableHighlight>
    );
};
export default FocusButton;
