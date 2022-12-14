import React, { ReactElement, useState, useEffect } from 'react';
import { View, ImageBackground, TouchableOpacity, BackHandler, TVMenuControl } from 'react-native';
import { Block, Text, ScaledImage } from '../../components';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, Input, Button } from '@ui-kitten/components';
import SIZES from '../../constants/sizes';
import Voice from '@react-native-voice/voice';
import * as Animatable from 'react-native-animatable';
import { CommonActions } from '@react-navigation/native';
import { sendPageReport, sendActionReport, sendSearchReport } from '../../../reporting/reporting';
import TimerMixin from 'react-timer-mixin';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

export default ({ navigation }): React.ReactElement => {
    var store_search_timer;
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    const [stores, setStores] = useState([]);
    const [storesSearch, setStoresSearch] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [columns, setColumns] = useState(GLOBAL.Device_IsPortrait ? 1 : 4);

    const [showVoiceButton, setShowVoiceButton] = useState(false);
    const [showVoiceEnabled, setShowVoiceEnabled] = useState(false);
    const [extraSearchResults, setExtraSearchResults] = useState([]);

    var sizes = SIZES.getSizing();
    useEffect(() => {
        return () => sendPageReport('Movie Stores', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        var storesIn = GLOBAL.MovieStores;
        setStores(storesIn);
        setStoresSearch(storesIn);
        if (storesIn.length == 1 && storesIn[0].substores.length == 0) {
            var item = storesIn[0];
            onOpenStore(item);
        }

        if (GLOBAL.Device_System == "Apple" || GLOBAL.Device_System == "Android" || GLOBAL.Device_System == "Amazon") {
            Voice.onSpeechResults = onSpeechResultsHandler.bind(this);
        }
        if (GLOBAL.Device_System == "Apple" || GLOBAL.Device_System == "Android" || GLOBAL.Device_System == "Amazon") {
            Voice.isAvailable().then((result) => {
                setShowVoiceButton(true);
            })
        }
        return () => {
            TimerMixin.clearTimeout(store_search_timer);
            if (GLOBAL.Device_System == "Apple" || GLOBAL.Device_System == "Android" || GLOBAL.Device_System == "Amazon") {
                Voice.destroy().then(Voice.removeAllListeners);
            }
        };
    }, []);
    useEffect(() => {
        const backAction = () => {
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [
                        { name: 'Home' }
                    ],
                })
            );
            return true;
        };
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );
        return () => backHandler.remove();
    }, []);
    const onStartSpeech = async () => {
        if (showVoiceEnabled == false) {
            setShowVoiceEnabled(true)
            try {
                await Voice.start('en-US');
            } catch (e) {
                setShowVoiceEnabled(false)
                Voice.stop();
            }
        } else {
            setShowVoiceEnabled(false)
            Voice.stop();
        }
    }
    const onSpeechResultsHandler = (e) => {
        if (e.value != '') {
            try {
                var newInput = e.value;
                var splitInput = newInput.toString().split(',')

                var extraSearch = [];
                splitInput.forEach(element => {

                    var extra = {
                        name: element
                    }
                    extraSearch.push(extra)
                });
                if (splitInput.length > 0) {
                    Voice.stop().then(() => {
                        sendActionReport('Search Voice', 'Movie Stores', moment().unix(), splitInput[0]);
                        setShowVoiceEnabled(false);
                        setSearchTerm(splitInput[0]);
                        setExtraSearchResults(extraSearch);
                        onSearchStores(splitInput[0]);
                    })
                }
            } catch (e) { }
        }
    };
    const onSearchExtra = (searchTerm) => {
        setSearchTerm(searchTerm);
        onSearchStores(searchTerm);
    }
    const renderExtra = ({ item }) => {
        return (
            <FocusButton style={{ backgroundColor: '#333', margin: 5, borderRadius: 100 }} onPress={() => onSearchExtra(item.name)}>
                <Text style={{ paddingHorizontal: 10, padding: 4 }}>{item.name}</Text>
            </FocusButton>
        )
    }

    const renderStore = ({ item }) => {
        return (
            <FocusButton style={{ borderRadius: 5, width: (sizes.width / columns) - 4 }} onPress={() => onOpenStore(item)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.40)', flexDirection: 'column', margin: 5, borderRadius: 5, borderColor: '#111', borderWidth: 4, }}>
                    <View style={{ backgroundColor: '#000', flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
                        <ScaledImage uri={GLOBAL.ImageUrlCMS + item.logo} width={(sizes.width / columns) - 22} style={{ borderTopLeftRadius: 3, borderTopRightRadius: 3, }} />
                    </View>
                    <View style={{ padding: 10 }}>
                        {getSubText(item)}
                    </View>
                </View>
            </FocusButton>
        )
    }
    const SearchIcon = (props) => (
        <Icon {...props} fill='#fff' name='search-outline' />
    );
    const onStartSearchTimer = (searchTerm) => {
        TimerMixin.clearTimeout(store_search_timer);
        store_search_timer = TimerMixin.setTimeout(() => {
            sendSearchReport(moment().unix(), searchTerm);
        }, 2000);
    }
    const onSearchStores = (searchTerm) => {
        var storesSearchOut = storesSearch.filter(c => c.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1);
        setSearchTerm(searchTerm);
        setStores(storesSearchOut);
    }
    const getSubText = (store) => {
        if (store.genres != undefined) {
            var movies = 0;
            store.genres.forEach(element => {
                movies = movies + element.movies.length;
            });
            if (store.genres.length == 0) {
                return (
                    <View>
                        <Text numberOfLines={1} h5 bold>{store.name}</Text>
                        <Text numberOfLines={1} >{LANG.getTranslation("more")} {LANG.getTranslation("movies")} ></Text>
                    </View>
                )
            } else {
                return (
                    <View>
                        <Text numberOfLines={1} h5 bold>{store.name}</Text>
                        <Text numberOfLines={1} >{store.genres.length + "  " + LANG.getTranslation("categories")}</Text>
                        <Text numberOfLines={1} >{movies + " " + LANG.getTranslation("movies")}</Text>
                    </View>
                )
            }
        }
    }

    const SpeechIcon = (props) => (
        <Icon {...props} fill='#fff' name='mic-outline' />
    );

    const onClearSearch = () => {
        setSearchTerm('');
        setStores(storesSearch);
    }
    const onOpenStore = (item) => {
        if (item.substores.length != 0) {
            navigation.navigate({
                name: 'Movies ',
                params: {
                    stores: item.substores,
                    sub_store: true
                },
                merge: true,
            });
        } else {

            navigation.navigate({
                name: 'Categories',
                params: {
                    store: item,
                },
                merge: true,
            });
        }
    }
    const onPressBack = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [
                    { name: 'Home' }
                ],
            })
        );
    }
    return (

        <Block

            flex={1}
            width={sizes.width}
            align="center"
            justify="center"
            color={'transparent'} >
            {showVoiceEnabled &&
                <View style={{ borderRadius: 5, backgroundColor: 'rgba(0, 0, 0, 0.80)', position: 'absolute', width: sizes.width * 0.3, height: sizes.width * 0.3, zIndex: 99999, justifyContent: 'center', alignContent: 'center', alignItems: 'center', alignSelf: 'center', flex: 1 }}>
                    <Animatable.View animation="pulse" easing="ease-in-out" iterationCount="infinite">
                        <FontAwesome5 style={[styles.Shadow, { color: '#fff', fontSize: 50, padding: 0, margin: 0 }]} name="microphone" />
                    </Animatable.View>
                </View>
            }

            <View style={{ flexDirection: 'column', width: sizes.width, backgroundColor: 'rgba(0, 0, 0, 0.80)', paddingTop: 10 }}>
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ paddingLeft: 10, marginRight: 0, borderRadius: 100, justifyContent: 'center', alignItems: 'center', margin: 10 }}>
                        <FocusButton style={{ borderRadius: 100 }} onPress={() => onPressBack()}>
                            <FontAwesome5 style={{ fontSize: 18, color: '#fff' }} name="arrow-left" />
                        </FocusButton>
                    </View>

                    <View style={{ borderRadius: 100, flex: 1, flexDirection: 'row', borderColor: '#999', borderWidth: 1, marginHorizontal: 20 }}>

                        <View style={{ flex: 1, flexDirection: 'row', width: sizes.width, alignSelf: 'center', paddingVertical: 5, paddingLeft: 20 }}>
                            <Input
                                status='basic'
                                style={{ width: '100%', backgroundColor: 'transparent', paddingRight: showVoiceButton ? 0 : 20, borderColor: 'transparent' }}
                                value={searchTerm}
                                autoComplete={'off'}
                                placeholder={LANG.getTranslation('filter') + '...'}
                                accessoryLeft={SearchIcon}
                                underlineColorAndroid='transparent'
                                onChangeText={nextValue => onSearchStores(nextValue)}
                            />
                        </View>
                        <View style={{ alignSelf: 'center' }}>
                            {showVoiceButton &&
                                <Button style={{ borderRadius: 100 }} appearance='ghost' accessoryLeft={SpeechIcon} onPress={onStartSpeech} />
                            }
                        </View>
                    </View>
                </View>
                <View style={{ marginLeft: 10 }}>
                    <FlatList
                        key={extraSearchResults}
                        extraData={extraSearchResults}
                        data={extraSearchResults}
                        horizontal={true}
                        removeClippedSubviews={true}
                        keyExtractor={(item, index) => index.toString()}
                        onScrollToIndexFailed={() => { }}
                        renderItem={renderExtra}
                    />
                </View>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', width: sizes.width }}>
                <LinearGradient
                    colors={['rgba(0, 0, 0, 0.80)', 'rgba(0, 0, 0, 0.0)']}
                    style={{ flex: 1, width: sizes.width, height: '100%' }}
                    start={{ x: 0.5, y: 0 }}>
                    <View style={{ flex: 1, paddingTop: 10, alignSelf: 'center' }}>
                        {(stores.length > 1 || searchTerm.length > 0) &&
                            <FlatList
                                key={searchTerm}
                                extraData={searchTerm}
                                data={stores}
                                numColumns={columns}
                                horizontal={false}
                                removeClippedSubviews={true}
                                keyExtractor={(item, index) => index.toString()}
                                onScrollToIndexFailed={() => { }}
                                renderItem={renderStore}
                            />
                        }
                    </View>
                </LinearGradient>
            </View>
        </Block >


    )
}