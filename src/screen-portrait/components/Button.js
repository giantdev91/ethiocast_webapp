import React, {useCallback} from 'react';
import {
    ViewStyle,
    Vibration,
    StyleSheet,
    TouchableOpacity,
    Platform,
} from 'react-native';

import useTheme from '../hooks/useTheme';

const Button = ({
    id = 'Button',
    children,
    style,
    color,
    gradient,
    primary,
    secondary,
    tertiary,
    black,
    white,
    light,
    dark,
    gray,
    danger,
    warning,
    success,
    info,
    flex,
    radius,
    round,
    rounded,
    disabled,
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
    align,
    justify,
    height,
    width,
    row,
    outlined,
    social,
    activeOpacity = 0.7,
    shadow = true,
    position,
    right,
    left,
    top,
    bottom,
    haptic = true,
    vibrate,
    vibrateRepeat,
    onPress,
    ...props
}) => {
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
        : light
        ? 'light'
        : dark
        ? 'dark'
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

    const buttonColor = color
        ? color
        : colorIndex
        ? colors?.[colorIndex]
        : 'transparent';

    const buttonStyles = StyleSheet.flatten([
        style,
        {
            minHeight: sizes_.xl,
            minWidth: sizes_.xl,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: buttonColor,
            borderRadius: rounded ? sizes_.s : sizes_.buttonRadius,
            ...(shadow &&
                buttonColor !== 'transparent' && {
                    shadowColor: colors.shadow,
                    shadowOffset: {
                        width: sizes_.shadowOffsetWidth,
                        height: sizes_.shadowOffsetHeight,
                    },
                    shadowOpacity: sizes_.shadowOpacity,
                    shadowRadius: sizes_.shadowRadius,
                    elevation: sizes_.elevation,
                }),
            ...(row && {flexDirection: 'row'}),
            ...(radius && {borderRadius: radius}),
            ...(flex !== undefined && {flex}),
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
            ...(align && {alignItems: align}),
            ...(justify && {justifyContent: justify}),
            ...(height && {height}),
            ...(width && {width}),
            ...(typeof outlined === 'boolean' && {
                borderWidth: sizes_.buttonBorder,
                borderColor: buttonColor,
                backgroundColor: 'transparent',
            }),
            ...(typeof outlined === 'string' && {
                borderWidth: sizes_.buttonBorder,
                borderColor: outlined,
            }),
            ...(social && {
                backgroundColor: colors?.[social],
                width: sizes_.socialSize,
                height: sizes_.socialSize,
                borderRadius: sizes_.socialRadius,
            }),
            ...(disabled && {opacity: 0.5}),
            ...(position && {position}),
            ...(right !== undefined && {right}),
            ...(left !== undefined && {left}),
            ...(top !== undefined && {top}),
            ...(bottom !== undefined && {bottom}),
        },
    ]);

    /* handle onPress event */
    const handlePress = useCallback(
        event => {
            onPress?.(event);

            /* vibrate onPress */
            if (vibrate) {
                Vibration.vibrate(vibrate, vibrateRepeat);
            }

            // /* haptic feedback onPress */
            // if (haptic) {
            //   Haptics.selectionAsync();
            // }
        },
        [haptic, vibrate, vibrateRepeat, onPress],
    );

    if (round) {
        const maxSize = Math.max(
            Number(buttonStyles.width || 0),
            Number(buttonStyles.minWidth || 0),
            Number(buttonStyles.maxWidth || 0),
            Number(buttonStyles.height || 0),
            Number(buttonStyles.minHeight || 0),
            Number(buttonStyles.maxHeight || 0),
        );
        buttonStyles.maxWidth = maxSize;
        buttonStyles.maxHeight = maxSize;
        buttonStyles.borderRadius = maxSize / 2;
    }

    const gradientStyles = StyleSheet.flatten([
        buttonStyles,
        {
            flex: 1,
            width: '100%',
            ...(round && {maxWidth: buttonStyles.maxWidth}),
        },
    ]);

    // generate component testID or accessibilityLabel based on Platform.OS
    const buttonID =
        Platform.OS === 'android' ? {accessibilityLabel: id} : {testID: id};

    if (gradient) {
        return (
            <FocusButton
                {...buttonID}
                activeOpacity={activeOpacity}
                onPress={handlePress}
                {...props}
                style={buttonStyles}>
                {/* <LinearGradient
          style={gradientStyles}
          colors={gradient}
          start={[0, 1]}
          end={[1, 0]}>
          {children}
        </LinearGradient> */}
            </FocusButton>
        );
    }

    if (social) {
        const socialIcon =
            social === 'facebook'
                ? 'logo-facebook'
                : social === 'twitter'
                ? 'logo-twitter'
                : 'logo-dribbble';

        return (
            <FocusButton
                {...buttonID}
                activeOpacity={activeOpacity}
                onPress={handlePress}
                {...props}
                style={buttonStyles}>
                {/* <Ionicons
          name={socialIcon}
          size={sizes_.socialIconSize}
          color={colors.white}
        /> */}
            </FocusButton>
        );
    }

    return (
        <FocusButton
            {...buttonID}
            activeOpacity={activeOpacity}
            onPress={handlePress}
            {...props}
            style={buttonStyles}>
            {children}
        </FocusButton>
    );
};

export default React.memo(Button);
