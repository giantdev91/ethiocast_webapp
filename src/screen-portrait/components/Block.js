import React from 'react';
import {
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {LinearGradient} from 'expo-linear-gradient';
import useTheme from '../hooks/useTheme';

const Block = props => {
    const {
        id = 'Block',
        children,
        style,
        shadow,
        card,
        center,
        outlined,
        overflow,
        row,
        safe,
        keyboard,
        scroll,
        color,
        gradient,
        primary,
        secondary,
        tertiary,
        black,
        white,
        gray,
        danger,
        warning,
        success,
        info,
        radius,
        height,
        width,
        margin,
        marginBottom,
        marginTop,
        marginHorizontal,
        marginVertical,
        marginRight,
        marginLeft,
        padding,
        paddingBottom,
        paddingTop,
        paddingHorizontal,
        paddingVertical,
        paddingRight,
        paddingLeft,
        justify,
        align,
        flex = 1,
        wrap,
        blur,
        intensity,
        tint,
        position,
        right,
        left,
        top,
        bottom,
        end,
        start,
        ...rest
    } = props;
    const {colors, sizes_} = useTheme();

    const colorIndex = primary
        ? 'primary'
        : secondary
        ? 'secondary'
        : tertiary
        ? 'tertiary'
        : black
        ? 'black'
        : white
        ? 'white'
        : gray
        ? 'gray'
        : danger
        ? 'danger'
        : warning
        ? 'warning'
        : success
        ? 'success'
        : info
        ? 'info'
        : null;

    const blockColor = color
        ? color
        : colorIndex
        ? colors?.[colorIndex]
        : undefined;

    const blockStyles = StyleSheet.flatten([
        style,
        {
            ...(shadow && {
                shadowColor: colors.shadow,
                shadowOffset: {
                    width: sizes_.shadowOffsetWidth,
                    height: sizes_.shadowOffsetHeight,
                },
                shadowOpacity: sizes_.shadowOpacity,
                shadowRadius: sizes_.shadowRadius,
                elevation: sizes_.elevation,
            }),
            ...(card && {
                backgroundColor: colors.card,
                borderRadius: sizes_.cardRadius,
                padding: sizes_.cardPadding,
                shadowColor: colors.shadow,
                shadowOffset: {
                    width: sizes_.shadowOffsetWidth,
                    height: sizes_.shadowOffsetHeight,
                },
                shadowOpacity: sizes_.shadowOpacity,
                shadowRadius: sizes_.shadowRadius,
                elevation: sizes_.elevation,
            }),
            ...(margin !== undefined && {margin}),
            ...(marginBottom && {marginBottom}),
            ...(marginTop && {marginTop}),
            ...(marginHorizontal && {marginHorizontal}),
            ...(marginVertical && {marginVertical}),
            ...(marginRight && {marginRight}),
            ...(marginLeft && {marginLeft}),
            ...(padding !== undefined && {padding}),
            ...(paddingBottom && {paddingBottom}),
            ...(paddingTop && {paddingTop}),
            ...(paddingHorizontal && {paddingHorizontal}),
            ...(paddingVertical && {paddingVertical}),
            ...(paddingRight && {paddingRight}),
            ...(paddingLeft && {paddingLeft}),
            ...(radius && {borderRadius: radius}),
            ...(height && {height}),
            ...(width && {width}),
            ...(overflow && {overflow}),
            ...(flex !== undefined && {flex}),
            ...(row && {flexDirection: 'row'}),
            ...(align && {alignItems: align}),
            ...(center && {justifyContent: 'center'}),
            ...(justify && {justifyContent: justify}),
            ...(wrap && {flexWrap: wrap}),
            ...(blockColor && {backgroundColor: blockColor}),
            ...(outlined && {
                borderWidth: 1,
                borderColor: blockColor,
                backgroundColor: 'transparent',
            }),
            ...(position && {position}),
            ...(right !== undefined && {right}),
            ...(left !== undefined && {left}),
            ...(top !== undefined && {top}),
            ...(bottom !== undefined && {bottom}),
        },
    ]);

    // generate component testID or accessibilityLabel based on Platform.OS
    const blockID =
        Platform.OS === 'android' ? {accessibilityLabel: id} : {testID: id};

    if (safe) {
        return (
            <SafeAreaView {...blockID} {...rest} style={blockStyles}>
                {children}
            </SafeAreaView>
        );
    }

    if (keyboard) {
        return (
            <KeyboardAwareScrollView {...blockID} {...rest} style={blockStyles}>
                {children}
            </KeyboardAwareScrollView>
        );
    }

    if (scroll) {
        return (
            <ScrollView {...blockID} {...rest} style={blockStyles}>
                {children}
            </ScrollView>
        );
    }

    if (gradient) {
        return (
            <LinearGradient
                {...blockID}
                colors={gradient}
                style={blockStyles}
                // end={end}
                // start={start}
                {...rest}>
                {children}
            </LinearGradient>
        );
    }

    return (
        <View {...blockID} {...rest} style={blockStyles}>
            {children}
        </View>
    );
};

export default React.memo(Block);
