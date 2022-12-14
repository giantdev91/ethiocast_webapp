import React, {PureComponent} from 'react';
import {View} from 'react-native';
import Store_List_Item_Series from './Store_List_Item_Series';
import Store_List_Item_Movies from './Store_List_Item_Movies';
import Store_List_Item_Education from './Store_List_Item_Education';

class Store_List extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            scrolled: false,
        };
    }
    render() {
        const stores = this.props.Stores;
        const columns = this.props.Columns;
        if (GLOBAL.Store_Sub_Selected_Index == undefined) {
            GLOBAL.Store_Sub_Selected_Index = 0;
        }
        if (GLOBAL.Store_Selected_Index == undefined) {
            GLOBAL.Store_Selected_Index = 0;
        }
        var test = stores.length / columns;
        if (!isNaN(test) && test != 0) {
            if (
                test < GLOBAL.Store_Selected_Index / columns &&
                this.props.SubStore == undefined
            ) {
                GLOBAL.Store_Selected_Index = 0;
            } else if (
                test < GLOBAL.Store_Sub_Selected_Index / columns &&
                this.props.SubStore != undefined
            ) {
                GLOBAL.Store_Sub_Selected_Index = 0;
            }
        }
        return (
            <FlatList
                {...this.props}
                ref={ref => (this.flatList = ref)}
                data={stores}
                numColumns={this.props.Columns}
                horizontal={false}
                removeClippedSubviews={true}
                keyExtractor={(item, index) => index.toString()}
                onScrollToIndexFailed={() => {}}
                renderItem={this.renderItem}
                // onContentSizeChange={() => {
                //     if (stores != undefined) {
                //         try {
                //             if (this.flatList.scrollToIndex && this.state.scrolled == false && stores.length > 0) {
                //                 this.setState({
                //                     scrolled: true
                //                 })
                //                 this.flatList.scrollToIndex({ index: this.props.SubStore != undefined && this.props.SubStore == true ? (GLOBAL.Store_Sub_Selected_Index / columns) : (GLOBAL.Store_Selected_Index / columns), animated: false, viewPosition: 0 });
                //             }
                //         } catch (e) {

                //         }
                //     }
                // }}
            />
        );
    }
    renderItem = ({item, index}) => (
        <View>
            {RenderIf(this.props.Type == 'Series')(
                <Store_List_Item_Series
                    key={item.id}
                    Store={item}
                    Index={index}
                    Width={this.props.Width}
                    SubStore={this.props.SubStore}
                    _loadSeriesFromStore={this.props._loadSeriesFromStore}
                />,
            )}
            {RenderIf(this.props.Type == 'Movies')(
                <Store_List_Item_Movies
                    key={item.id}
                    Store={item}
                    Index={index}
                    Width={this.props.Width}
                    SubStore={this.props.SubStore}
                    _loadMoviesFromStore={this.props._loadMoviesFromStore}
                />,
            )}
            {RenderIf(this.props.Type == 'Education')(
                <Store_List_Item_Education
                    key={item.id}
                    Store={item}
                    Index={index}
                    Width={this.props.Width}
                    SubStore={this.props.SubStore}
                    _loadEducationFromStore={this.props._loadEducationFromStore}
                />,
            )}
        </View>
    );
}
export default Store_List;
