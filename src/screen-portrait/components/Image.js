import React from 'react';
import {
    StyleSheet,
    Image as RNImage,
    ImageStyle,
    ImageBackground,
    Platform,
} from 'react-native';

import useTheme from '../hooks/useTheme';

const Image = ({
    id = 'Image',
    style,
    children,
    avatar,
    shadow,
    rounded,
    background,
    radius,
    color,
    height,
    width,
    transform,
    padding,
    paddingVertical,
    paddingHorizontal,
    paddingRight,
    paddingLeft,
    paddingTop,
    paddingBottom,
    margin,
    marginVertical,
    marginHorizontal,
    marginRight,
    marginLeft,
    marginTop,
    marginBottom,
    ...props
}) => {
    const {colors, sizes_} = useTheme();

    const imageStyles = StyleSheet.flatten([
        style,
        {
            borderRadius: sizes_.imageRadius,
            ...(height && {height}),
            ...(width && {width}),
            ...(margin && {margin}),
            ...(marginBottom && {marginBottom}),
            ...(marginTop && {marginTop}),
            ...(marginHorizontal && {marginHorizontal}),
            ...(marginVertical && {marginVertical}),
            ...(marginRight && {marginRight}),
            ...(marginLeft && {marginLeft}),
            ...(padding && {padding}),
            ...(paddingBottom && {paddingBottom}),
            ...(paddingTop && {paddingTop}),
            ...(paddingHorizontal && {paddingHorizontal}),
            ...(paddingVertical && {paddingVertical}),
            ...(paddingRight && {paddingRight}),
            ...(paddingLeft && {paddingLeft}),
            ...(rounded && {borderRadius: sizes_.radius, overflow: 'hidden'}),
            ...(radius !== undefined && {
                borderRadius: radius,
                overflow: 'hidden',
            }),
            ...(color && {tintColor: color}),
            ...(transform && {transform}),
            ...(shadow && {
                shadowColor: colors.shadow,
                shadowOffset: {
                    width: sizes_.shadowOffsetWidth,
                    height: sizes_.shadowOffsetHeight,
                },
                shadowOpacity: sizes_.shadowOpacity,
                shadowRadius: sizes_.shadowRadius,
            }),
            ...(avatar && {
                height: sizes_.avatarSize,
                width: sizes_.avatarSize,
                borderRadius: sizes_.avatarRadius,
                overflow: 'hidden',
            }),
        },
    ]);

    // generate component testID or accessibilityLabel based on Platform.OS
    const imageID =
        Platform.OS === 'android' ? {accessibilityLabel: id} : {testID: id};

    if (background) {
        return (
            <ImageBackground {...imageID} style={imageStyles} {...props}>
                {children}
            </ImageBackground>
        );
    }

    return <RNImage {...imageID} style={imageStyles} {...props} />;
};

export default Image;
