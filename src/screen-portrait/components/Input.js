import React, { useCallback, useState } from 'react';
import {
    Image,
    TextInput,
    TextStyle,
    ViewStyle,
    StyleSheet,
    Platform,
} from 'react-native';

import Block from './Block';
import Text from './Text';
import useTheme from '../hooks/useTheme';
import { FontAwesome5 } from '@expo/vector-icons';

const Input = ({
    id = 'Input',
    style,
    color,
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
    search,
    disabled,
    label,
    icon,
    marginBottom,
    marginTop,
    marginHorizontal,
    marginVertical,
    marginRight,
    marginLeft,
    onFocus,
    onBlur,
    ...props
}) => {
    const { assets, colors, sizes_ } = useTheme();
    const [isFocused, setFocused] = useState(false);

    const handleFocus = useCallback(
        (event, focus) => {
            setFocused(focus);
            focus && onFocus?.(event);
            !focus && onBlur?.(event);
        },
        [setFocused, onFocus, onBlur],
    );

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
    const inputColor = color
        ? color
        : colorIndex
            ? colors?.[colorIndex]
            : colors.gray;

    const inputBoxStyles = StyleSheet.flatten([
        style,
        {
            minHeight: sizes_.inputHeight,
            ...(marginBottom && { marginBottom: marginBottom }),
            ...(marginTop && { marginTop: marginTop }),
            ...(marginHorizontal && { marginHorizontal: marginHorizontal }),
            ...(marginVertical && { marginVertical: marginVertical }),
            ...(marginRight && { marginRight: marginRight }),
            ...(marginLeft && { marginLeft: marginLeft }),
        },
    ]);

    const inputContainerStyles = StyleSheet.flatten([
        {
            minHeight: sizes_.inputHeight,
            borderRadius: sizes_.inputRadius,
            borderWidth: isFocused ? 2 : sizes_.inputBorder,
            borderColor: isFocused ? colors.focus : inputColor,
        },
    ]);

    const inputStyles = StyleSheet.flatten([
        {
            flex: 1,
            zIndex: 2,
            height: '100%',
            fontSize: sizes_.p,
            color: colors.input,
            paddingHorizontal: sizes_.inputPadding,
        },
    ]);

    // generate component testID or accessibilityLabel based on Platform.OS
    const inputID =
        Platform.OS === 'android' ? { accessibilityLabel: id } : { testID: id };

    return (
        <Block flex={0} style={inputBoxStyles}>
            {label && (
                <Text bold marginBottom={sizes_.s}>
                    {label}
                </Text>
            )}
            <Block
                row
                align="center"
                justify="flex-end"
                style={inputContainerStyles}>
                {search && assets.search && (
                    <Image
                        source={assets.search}
                        style={{
                            marginLeft: sizes_.inputPadding,
                            tintColor: colors.icon,
                        }}
                    />
                )}
                {icon && (
                    <FontAwesome5
                        style={{
                            marginLeft: sizes_.inputPadding,
                            tintColor: colors.icon,
                        }}
                        // icon={icon}
                        name={icon}
                    />
                )}
                <TextInput
                    {...inputID}
                    {...props}
                    style={inputStyles}
                    editable={!disabled}
                    placeholderTextColor={inputColor}
                    onFocus={event => handleFocus(event, true)}
                    onBlur={event => handleFocus(event, false)}
                />
                {danger && assets.warning && (
                    <Image
                        source={assets.warning}
                        style={{
                            marginRight: sizes_.s,
                            tintColor: colors.danger,
                        }}
                    />
                )}
                {success && assets.check && (
                    <Image
                        source={assets.check}
                        style={{
                            width: 12,
                            height: 9,
                            marginRight: sizes_.s,
                            tintColor: colors.success,
                        }}
                    />
                )}
            </Block>
        </Block>
    );
};

export default React.memo(Input);
