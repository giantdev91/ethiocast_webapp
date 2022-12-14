import React, {PureComponent} from 'react';
import {View, Text} from 'react-native';
import Category_Item from './Category_Item';

class CategoryList extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            scrolled: false,
        };
    }
    render() {
        const cats = this.props.Cats;
        const columns = this.props.Columns;

        return (
            <View>
                <FlatList
                    style={{
                        backgroundColor: '#111',
                        borderTopLeftRadius:
                            GLOBAL.App_Theme == 'Honua' ? 5 : 0,
                        marginLeft: GLOBAL.App_Theme == 'Honua' ? 4 : 0,
                    }}
                    ref={ref => (this.flatList = ref)}
                    data={cats}
                    Width={GLOBAL.COL_7}
                    numColumns={columns}
                    horizontal={
                        this.props.horizontal != undefined ? true : false
                    }
                    removeClippedSubviews={true}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={this.renderItem}
                />
                {RenderIf(
                    this.props.Type == 'Channels' &&
                        GLOBAL.App_Theme != 'Honua',
                )(
                    <View
                        style={{
                            marginLeft: GLOBAL.App_Theme == 'Honua' ? 4 : 0,
                            borderBottomLeftRadius:
                                GLOBAL.App_Theme == 'Honua' ? 5 : 0,
                            height: GLOBAL.ROW_7,
                            backgroundColor: 'rgba(0, 0, 0, 0.40)',
                            flexDirection: 'column',
                            alignContent: 'flex-start',
                            width: GLOBAL.Device_Width,
                            marginBottom: 5,
                            paddingLeft: 20,
                            justifyContent: 'center',
                        }}
                    >
                        <Text style={[styles.H1, styles.Shadow]}>
                            {this.props.SelectedCategoryName}
                        </Text>
                        <Text
                            style={[
                                styles.Medium,
                                styles.Shadow,
                                {marginTop: -5},
                            ]}
                        >
                            {this.props.SelectedCategoryLength}{' '}
                            {LANG.getTranslation('channels')}
                        </Text>
                    </View>,
                )}
                {RenderIf(
                    this.props.Type == 'Movies' && GLOBAL.App_Theme != 'Honua',
                )(
                    <View
                        style={{
                            marginLeft: GLOBAL.App_Theme == 'Honua' ? 4 : 0,
                            borderBottomLeftRadius:
                                GLOBAL.App_Theme == 'Honua' ? 5 : 0,
                            height: GLOBAL.ROW_7,
                            backgroundColor: 'rgba(0, 0, 0, 0.40)',
                            flexDirection: 'column',
                            alignContent: 'flex-start',
                            width: GLOBAL.Device_Width,
                            marginBottom: 5,
                            paddingLeft: 20,
                            justifyContent: 'center',
                        }}
                    >
                        <Text style={[styles.H1, styles.Shadow]}>
                            {this.props.SelectedCategoryName}
                        </Text>
                        <Text
                            style={[
                                styles.Medium,
                                styles.Shadow,
                                {marginTop: -5},
                            ]}
                        >
                            {this.props.SelectedCategoryLength}{' '}
                            {LANG.getTranslation('movies')}
                        </Text>
                    </View>,
                )}
                {RenderIf(
                    this.props.Type == 'Albums' && GLOBAL.App_Theme != 'Honua',
                )(
                    <View
                        style={{
                            marginLeft: GLOBAL.App_Theme == 'Honua' ? 4 : 0,
                            borderBottomLeftRadius:
                                GLOBAL.App_Theme == 'Honua' ? 5 : 0,
                            height: GLOBAL.ROW_7,
                            backgroundColor: 'rgba(0, 0, 0, 0.40)',
                            flexDirection: 'column',
                            alignContent: 'flex-start',
                            width: GLOBAL.Device_Width,
                            marginBottom: 5,
                            paddingLeft: 20,
                            justifyContent: 'center',
                        }}
                    >
                        <Text style={[styles.H1, styles.Shadow]}>
                            {this.props.SelectedCategoryName}
                        </Text>
                        <Text
                            style={[
                                styles.Medium,
                                styles.Shadow,
                                {marginTop: -5},
                            ]}
                        >
                            {this.props.SelectedCategoryLength}{' '}
                            {LANG.getTranslation('albums')}
                        </Text>
                    </View>,
                )}
                {/*   {RenderIf(this.props.Type == 'Apps')(
                        <View style={{ height: GLOBAL.ROW_7, backgroundColor: 'rgba(0, 0, 0, 0.40)', flexDirection: 'column', alignContent: 'flex-start', width: GLOBAL.Device_Width, marginBottom: 5, paddingLeft: 20, justifyContent: 'center' }}>
                            <Text style={[styles.H1, styles.Shadow]}>{this.props.SelectedCategory.name}</Text>
                            <Text style={[styles.Medium, styles.Shadow, { marginTop: -5 }]}>{this.props.SelectedCategory.apps.length} {LANG.getTranslation('apps')}</Text>
                        </View>
                    )} */}
            </View>
        );
    }
    renderItem = ({item, index}) => (
        <View>
            <Category_Item
                FromPage={this.props.FromPage}
                Stores={this.props.Stores}
                Index={index}
                ToggleText={this.props.ToggleText}
                SortText={this.props.SortText}
                Type={this.props.Type}
                Cat={item}
                onPress={this.props.onPress}
            />
        </View>
    );
}

export default CategoryList;
