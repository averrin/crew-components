export default function getItems({ dispatch, loadOptions, convertStringItemsToObjects, filterText }: {
    dispatch: any;
    loadOptions: any;
    convertStringItemsToObjects: any;
    filterText: any;
}): Promise<{
    filteredItems: any;
    isWaiting: boolean;
    isFocused: boolean;
    listOpen: boolean;
}>;
