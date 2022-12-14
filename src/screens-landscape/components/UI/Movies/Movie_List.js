import React, {PureComponent} from 'react';
import {View} from 'react-native';
import Movie_List_Item from './Movie_List_Item';
import Tag_List_Item from './Tag_List_Item';
import Movie_List_Item_List from './Movie_List_Item_List';

class Movie_List extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            scrolled: false,
        };
    }
    render() {
        const movies = this.props.Movies;
        const columns = this.props.Columns;
        if (GLOBAL.Movie_Selected_Row == undefined) {
            GLOBAL.Movie_Selected_Row = 0;
        }
        if (GLOBAL.Tag_Selected_Row == undefined) {
            GLOBAL.Tag_Selected_Row = 0;
        }
        var test = movies.length / columns;
        if (!isNaN(test) && test != 0) {
            if (this.props.Type == 'Movies') {
                if (test < GLOBAL.Movie_Selected_Row) {
                    GLOBAL.Movie_Selected_Row = 0;
                }
            } else {
                if (test < GLOBAL.Tag_Selected_Row) {
                    GLOBAL.Tag_Selected_Row = 0;
                }
            }
        }

        return (
            <FlatList
                //{...this.props}
                ref={ref => (this.flatList = ref)}
                data={movies}
                Width={this.props.Width}
                numColumns={columns}
                horizontal={this.props.horizontal != undefined ? true : false}
                removeClippedSubviews={true}
                keyExtractor={(item, index) => index.toString()}
                onScrollToIndexFailed={() => {}}
                renderItem={this.renderItem}
                onContentSizeChange={() => {
                    if (
                        movies != undefined &&
                        this.props.scrollType != 'Search' &&
                        this.props.FromPage != 'Home' &&
                        this.props.FromPage != 'Renting' &&
                        this.props.FromPage != 'Favorites' &&
                        this.props.FromPage != 'Watching' &&
                        this.props.FromPage != 'Details'
                    ) {
                        try {
                            if (
                                this.flatList.scrollToIndex &&
                                this.state.scrolled == false &&
                                movies.length > 0
                            ) {
                                this.setState({
                                    scrolled: true,
                                });
                                this.flatList.scrollToIndex({
                                    index:
                                        this.props.Type == 'Movies'
                                            ? GLOBAL.Movie_Selected_Row
                                            : GLOBAL.Tag_Selected_Row,
                                    animated: false,
                                    viewPosition: 0,
                                });
                            }
                        } catch (e) {}
                    }
                }}
            />
        );
    }
    renderItem = ({item, index}) => (
        <View>
            {RenderIf(this.props.Type == 'Movies')(
                <Movie_List_Item
                    FromPage={this.props.FromPage}
                    Movie={item}
                    Index={index}
                    Width={this.props.Width}
                    onPress={this.props.onPress}
                />,
            )}
            {RenderIf(this.props.Type == 'MoviesList')(
                <Movie_List_Item_List
                    Movie={item}
                    Index={index}
                    Width={this.props.Width}
                    onPress={this.props.onPress}
                />,
            )}
            {RenderIf(this.props.Type == 'Tags')(
                <Tag_List_Item
                    Movie={item}
                    Index={index}
                    Width={this.props.Width}
                    onPress={this.props.onPress}
                />,
            )}
        </View>
    );
}

export default Movie_List;
