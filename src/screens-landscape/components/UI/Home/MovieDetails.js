import React, {useState, useEffect} from 'react';
import {View, Text, Animated} from 'react-native';

function MovieDetails({onMount}) {
    const [value, setValue] = useState([]);
    this.fadeAnimation = new Animated.Value(0);

    useEffect(() => {
        onMount([value, setValue]);
        this.fadeIn();
    }, [onMount, value]);

    fadeIn = () => {
        Animated.timing(this.fadeAnimation, {
            toValue: 1,
            duration: 2000,
        }).start();
    };
    return (
        <Animated.View
            style={{
                padding: 20,
                height: 180,
                opacity: this.fadeAnimation,
                position: 'relative',
                backgroundColor: 'rgba(0, 0, 0, 0.40)',
            }}
        >
            <View>
                <Text numberOfLines={1} style={[styles.H1, {marginBottom: 10}]}>
                    {value.name} ({value.year})
                </Text>
                <Text
                    numberOfLines={3}
                    style={[styles.Standard, {marginRight: 100}]}
                >
                    {value.moviedescriptions != undefined
                        ? value.moviedescriptions[0].description
                        : ''}
                </Text>
                <Text
                    numberOfLines={1}
                    style={[styles.Medium, {marginTop: 10, marginRight: 100}]}
                >
                    {value.actors}
                </Text>
            </View>
        </Animated.View>
    );
}
export default MovieDetails;
