import React, {useCallback, useState} from 'react';
import {Platform, Pressable} from 'react-native';

import {useTheme} from '../hooks/';
import Block from '../components/Block';
import Image from '../components/Image';

const Checkbox = ({onPress, haptic = true, id = 'Checkbox', ...props}) => {
    const {colors, icons, sizes_} = useTheme();
    const [checked, setChecked] = useState(false);

    const handlePress = useCallback(() => {
        onPress?.(!checked);
        setChecked(!checked);
    }, [checked, haptic, setChecked, onPress]);

    // generate component testID or accessibilityLabel based on Platform.OS
    const checkboxID =
        Platform.OS === 'android' ? {accessibilityLabel: id} : {testID: id};

    return (
        <Pressable {...checkboxID} hitSlop={sizes_.s} onPress={handlePress}>
            <Block
                flex={0}
                align="center"
                justify="center"
                gray={!checked}
                outlined={!checked}
                width={sizes_.checkboxWidth}
                height={sizes_.checkboxHeight}
                radius={sizes_.checkboxRadius}
                gradient={checked ? colors.checkbox : undefined}
                {...props}>
                {checked && (
                    <Image
                        source={icons.check}
                        color={colors.checkboxIcon}
                        width={sizes_.checkboxIconWidth}
                        height={sizes_.checkboxIconHeight}
                    />
                )}
            </Block>
        </Pressable>
    );
};

export default React.memo(Checkbox);
