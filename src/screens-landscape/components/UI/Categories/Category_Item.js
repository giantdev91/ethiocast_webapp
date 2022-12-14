import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

class Category extends PureComponent {
    renderButtonBack() {
        return (
            <View style={{ backgroundColor: '#222' }}>
                <TouchableHighlightFocus
                    style={{ height: GLOBAL.ROW_10, width: GLOBAL.COL_7 }}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => Actions.Home()}
                >
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            flexDirection: 'row',
                        }}
                    >
                        <View
                            style={{ justifyContent: 'center', marginLeft: 10 }}
                        >
                            <FontAwesome5
                                style={{
                                    color: '#fff',
                                    fontSize: GLOBAL.Device_IsAppleTV ? 35 : 20,
                                }}
                                // icon={SolidIcons.arrowLeft}
                                name="arrow-left"
                            />
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.H5,
                                    { marginLeft: 10, marginRight: 20 },
                                ]}
                            >
                                {LANG.getTranslation('back')}
                            </Text>
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.Medium,
                                    {
                                        marginLeft: 10,
                                        marginRight: 20,
                                        marginTop: -3,
                                        color: '#999',
                                    },
                                ]}
                            >
                                {LANG.getTranslation('home')}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlightFocus>
            </View>
        );
    }
    renderButtonSearchMovies() {
        return (
            <View style={{ backgroundColor: '#222' }}>
                <TouchableHighlightFocus
                    style={{ height: GLOBAL.ROW_10, width: GLOBAL.COL_7 }}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() =>
                        Actions.SearchBox({
                            fromPage: 'Movies',
                            stores: this.props.Stores,
                        })
                    }
                >
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.H5,
                                { marginLeft: 10, marginRight: 20 },
                            ]}
                        >
                            {LANG.getTranslation('search')}
                        </Text>
                        {RenderIf(GLOBAL.SearchMovies.length > 0)(
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.Medium,
                                    {
                                        marginLeft: 10,
                                        marginRight: 20,
                                        marginTop: -3,
                                        color: '#999',
                                    },
                                ]}
                            >
                                {GLOBAL.SearchMovies.length}{' '}
                                {LANG.getTranslation('movies')}
                            </Text>,
                        )}
                        {RenderIf(GLOBAL.SearchMovies.length == 0)(
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.Medium,
                                    {
                                        marginLeft: 10,
                                        marginRight: 20,
                                        marginTop: -3,
                                        color: '#999',
                                    },
                                ]}
                            >
                                {LANG.getTranslation('movies')}
                            </Text>,
                        )}
                    </View>
                </TouchableHighlightFocus>
            </View>
        );
    }
    renderButtonSortMovies() {
        return (
            <View
                style={{
                    backgroundColor: '#333',
                    borderTopLeftRadius: GLOBAL.App_Theme == 'Honua' ? 5 : 0,
                }}
            >
                <TouchableHighlightFocus
                    style={{
                        height: GLOBAL.ROW_10,
                        width: GLOBAL.COL_7,
                        borderTopLeftRadius:
                            GLOBAL.App_Theme == 'Honua' ? 5 : 0,
                    }}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this.props.onPress(-1, this.props.Index)}
                >
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <View>
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.H5,
                                    { marginLeft: 10, marginRight: 20 },
                                ]}
                            >
                                {LANG.getTranslation('sorting')}
                            </Text>

                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.Medium,
                                    {
                                        marginLeft: 10,
                                        marginRight: 20,
                                        marginTop: -3,
                                        color: '#999',
                                    },
                                ]}
                            >
                                {this.props.SortText}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlightFocus>
            </View>
        );
    }
    renderButtonSearchChannels() {
        return (
            <View style={{ backgroundColor: '#222' }}>
                <TouchableHighlightFocus
                    style={{ height: GLOBAL.ROW_10, width: GLOBAL.COL_7 }}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => Actions.SearchBox({ fromPage: 'Channels' })}
                >
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.H5,
                                { marginLeft: 10, marginRight: 20 },
                            ]}
                        >
                            {LANG.getTranslation('search')}
                        </Text>
                        {RenderIf(GLOBAL.SearchChannels.length > 0)(
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.Medium,
                                    {
                                        marginLeft: 10,
                                        marginRight: 20,
                                        marginTop: -3,
                                        color: '#999',
                                    },
                                ]}
                            >
                                {GLOBAL.SearchChannels.length}{' '}
                                {LANG.getTranslation('channels')}
                            </Text>,
                        )}
                        {RenderIf(GLOBAL.SearchChannels.length == 0)(
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.Medium,
                                    {
                                        marginLeft: 10,
                                        marginRight: 20,
                                        marginTop: -3,
                                        color: '#999',
                                    },
                                ]}
                            >
                                {LANG.getTranslation('channels')}
                            </Text>,
                        )}
                    </View>
                </TouchableHighlightFocus>
            </View>
        );
    }
    renderButtonToggleChannels() {
        return (
            <View style={{ backgroundColor: '#333' }}>
                <TouchableHighlightFocus
                    style={{ height: GLOBAL.ROW_10, width: GLOBAL.COL_7 }}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this.props.onPress(-2)}
                >
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.H5,
                                { marginLeft: 10, marginRight: 20 },
                            ]}
                        >
                            {LANG.getTranslation('toggle_view')}
                        </Text>
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.Medium,
                                {
                                    marginLeft: 10,
                                    marginRight: 20,
                                    marginTop: -3,
                                    color: '#999',
                                },
                            ]}
                        >
                            {this.props.ToggleText}
                        </Text>
                    </View>
                </TouchableHighlightFocus>
            </View>
        );
    }
    renderButtonSortChannels() {
        return (
            <View
                style={{
                    backgroundColor: '#444',
                    borderTopLeftRadius: GLOBAL.App_Theme == 'Honua' ? 5 : 0,
                }}
            >
                <TouchableHighlightFocus
                    style={{
                        height: GLOBAL.ROW_10,
                        width: GLOBAL.COL_7,
                        borderTopLeftRadius:
                            GLOBAL.App_Theme == 'Honua' ? 5 : 0,
                    }}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this.props.onPress(-1)}
                >
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.H5,
                                { marginLeft: 10, marginRight: 20 },
                            ]}
                        >
                            {LANG.getTranslation('sorting')}
                        </Text>
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.Medium,
                                {
                                    marginLeft: 10,
                                    marginRight: 20,
                                    marginTop: -3,
                                    color: '#999',
                                },
                            ]}
                        >
                            {this.props.SortText}
                        </Text>
                    </View>
                </TouchableHighlightFocus>
            </View>
        );
    }

    render() {
        const cat = this.props.Cat;
        if (this.props.Type == 'Channels') {
            var check = GLOBAL.Menu.find(m => m.name == 'Search');
            if (cat.custom_type && cat.custom_type === 'sort') {
                if (
                    GLOBAL.UserInterface.channel.enable_sorting_channels == true
                ) {
                    return this.renderButtonSortChannels();
                } else {
                    return null;
                }
            } else if (cat.custom_type && cat.custom_type === 'toggle') {
                if (
                    GLOBAL.UserInterface.channel.enable_toggle_channels == true
                ) {
                    return this.renderButtonToggleChannels();
                } else {
                    return null;
                }
            } else if (cat.custom_type && cat.custom_type === 'search') {
                if (check != undefined) {
                    return this.renderButtonSearchChannels();
                } else {
                    return null;
                }
            } else if (cat.custom_type && cat.custom_type === 'back') {
                return this.renderButtonBack();
            } else {
                if (cat.channels.length > 0) {
                    return (
                        <TouchableHighlightFocus
                            style={{ height: GLOBAL.ROW_10, width: GLOBAL.COL_7 }}
                            underlayColor={GLOBAL.Button_Color}
                            onPress={() => this.props.onPress(cat.id)}
                        >
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Text
                                    numberOfLines={1}
                                    style={[
                                        styles.H5,
                                        { marginLeft: 10, marginRight: 20 },
                                    ]}
                                >
                                    {cat.name}
                                </Text>
                                <Text
                                    numberOfLines={1}
                                    style={[
                                        styles.Medium,
                                        {
                                            marginLeft: 10,
                                            marginRight: 20,
                                            marginTop: -3,
                                            color: '#999',
                                        },
                                    ]}
                                >
                                    {cat.channels == undefined
                                        ? 0
                                        : cat.channels.length}{' '}
                                    {LANG.getTranslation('channels')}
                                </Text>
                            </View>
                        </TouchableHighlightFocus>
                    );
                } else {
                    return (
                        <View
                            style={{ height: GLOBAL.ROW_10, width: GLOBAL.COL_7 }}
                            underlayColor={GLOBAL.Button_Color}
                            onPress={() => this.props.onPress(cat.id)}
                        >
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Text
                                    numberOfLines={1}
                                    style={[
                                        styles.H5,
                                        { marginLeft: 10, marginRight: 20 },
                                    ]}
                                >
                                    {cat.name}
                                </Text>
                                <Text
                                    numberOfLines={1}
                                    style={[
                                        styles.Medium,
                                        {
                                            marginLeft: 10,
                                            marginRight: 20,
                                            marginTop: -3,
                                            color: '#999',
                                        },
                                    ]}
                                >
                                    {cat.channels == undefined
                                        ? 0
                                        : cat.channels.length}{' '}
                                    {LANG.getTranslation('channels')}
                                </Text>
                            </View>
                        </View>
                    );
                }
            }
        }
        if (this.props.Type == 'Movies') {
            var check = GLOBAL.Menu.find(m => m.name == 'Search');
            if (cat.custom_type && cat.custom_type === 'sort') {
                return this.renderButtonSortMovies();
            } else if (cat.custom_type && cat.custom_type === 'search') {
                if (check != undefined) {
                    return this.renderButtonSearchMovies();
                } else {
                    return null;
                }
            } else if (cat.custom_type && cat.custom_type === 'back') {
                return this.renderButtonBack();
            } else {
                if (cat.movies.length > 0) {
                    return (
                        <TouchableHighlightFocus
                            style={{ height: GLOBAL.ROW_10, width: GLOBAL.COL_7 }}
                            underlayColor={GLOBAL.Button_Color}
                            onPress={() =>
                                this.props.onPress(cat.id, this.props.Index)
                            }
                        >
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Text
                                    numberOfLines={1}
                                    style={[
                                        styles.H5,
                                        { marginLeft: 10, marginRight: 20 },
                                    ]}
                                >
                                    {cat.name}
                                </Text>
                                <Text
                                    numberOfLines={1}
                                    style={[
                                        styles.Medium,
                                        {
                                            marginLeft: 10,
                                            marginRight: 20,
                                            marginTop: -3,
                                            color: '#999',
                                        },
                                    ]}
                                >
                                    {cat.movies == undefined
                                        ? 0
                                        : cat.movies.length}{' '}
                                    {LANG.getTranslation('movies')}
                                </Text>
                            </View>
                        </TouchableHighlightFocus>
                    );
                } else {
                    return (
                        <View
                            style={{ height: GLOBAL.ROW_10, width: GLOBAL.COL_7 }}
                            underlayColor={GLOBAL.Button_Color}
                            onPress={() =>
                                this.props.onPress(cat.id, this.props.Index)
                            }
                        >
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Text
                                    numberOfLines={1}
                                    style={[
                                        styles.H5,
                                        { marginLeft: 10, marginRight: 20 },
                                    ]}
                                >
                                    {cat.name}
                                </Text>
                                <Text
                                    numberOfLines={1}
                                    style={[
                                        styles.Medium,
                                        {
                                            marginLeft: 10,
                                            marginRight: 20,
                                            marginTop: -3,
                                            color: '#999',
                                        },
                                    ]}
                                >
                                    {cat.movies == undefined
                                        ? 0
                                        : cat.movies.length}{' '}
                                    {LANG.getTranslation('movies')}
                                </Text>
                            </View>
                        </View>
                    );
                }
            }
        }
        if (this.props.Type == 'Albums') {
            if (cat.albums.length > 0) {
                return (
                    <TouchableHighlightFocus
                        style={{ height: GLOBAL.ROW_10, width: GLOBAL.COL_7 }}
                        underlayColor={GLOBAL.Button_Color}
                        onPress={() =>
                            this.props.onPress(cat.id, this.props.Index)
                        }
                    >
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.H5,
                                    { marginLeft: 10, marginRight: 20 },
                                ]}
                            >
                                {cat.name}
                            </Text>
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.Medium,
                                    {
                                        marginLeft: 10,
                                        marginRight: 20,
                                        marginTop: -3,
                                        color: '#999',
                                    },
                                ]}
                            >
                                {cat.albums == undefined
                                    ? 0
                                    : cat.albums.length}{' '}
                                {LANG.getTranslation('albums')}
                            </Text>
                        </View>
                    </TouchableHighlightFocus>
                );
            } else {
                return (
                    <View
                        style={{ height: GLOBAL.ROW_10, width: GLOBAL.COL_7 }}
                        underlayColor={GLOBAL.Button_Color}
                        onPress={() =>
                            this.props.onPress(cat.id, this.props.Index)
                        }
                    >
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.H5,
                                    { marginLeft: 10, marginRight: 20 },
                                ]}
                            >
                                {cat.name}
                            </Text>
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.Medium,
                                    {
                                        marginLeft: 10,
                                        marginRight: 20,
                                        marginTop: -3,
                                        color: '#999',
                                    },
                                ]}
                            >
                                {cat.albums == undefined
                                    ? 0
                                    : cat.albums.length}{' '}
                                {LANG.getTranslation('albums')}
                            </Text>
                        </View>
                    </View>
                );
            }
        }
        if (this.props.Type == 'Apps') {
        }
    }
}
export default Category;
