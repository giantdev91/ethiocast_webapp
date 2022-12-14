import React from 'react';
import {StyleSheet, Modal as RNModal, ViewStyle, Platform} from 'react-native';

import {useTheme} from '../hooks/';

import Block from './Block';
import Button from './Button';
import Image from './Image';

const Modal = ({id = 'Modal', children, style, onRequestClose, ...props}) => {
    const {assets, colors, sizes_} = useTheme();
    const modalStyles = StyleSheet.flatten([style, {}]);

    // generate component testID or accessibilityLabel based on Platform.OS
    const modalID =
        Platform.OS === 'android' ? {accessibilityLabel: id} : {testID: id};

    return (
        <RNModal
            {...modalID}
            {...props}
            transparent
            style={modalStyles}
            animationType="slide"
            onRequestClose={onRequestClose}>
            <Block justify="flex-end">
                <Block safe card flex={0} color="rgba(0,0,0,0.8)">
                    <Button
                        top={0}
                        right={0}
                        position="absolute"
                        onPress={() => onRequestClose?.()}>
                        <Image source={assets.close} color={colors.white} />
                    </Button>
                    <Block
                        flex={0}
                        marginTop={sizes_.xxl}
                        paddingHorizontal={sizes_.padding}>
                        {children}
                    </Block>
                </Block>
            </Block>
        </RNModal>
    );
};

export default React.memo(Modal);
