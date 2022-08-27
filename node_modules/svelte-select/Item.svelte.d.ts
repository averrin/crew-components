/** @typedef {typeof __propDef.props}  ItemProps */
/** @typedef {typeof __propDef.events}  ItemEvents */
/** @typedef {typeof __propDef.slots}  ItemSlots */
export default class Item extends SvelteComponentTyped<{
    isActive?: boolean;
    isFirst?: boolean;
    isHover?: boolean;
    isSelectable?: boolean;
    getOptionLabel?: any;
    item?: any;
    filterText?: string;
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type ItemProps = typeof __propDef.props;
export type ItemEvents = typeof __propDef.events;
export type ItemSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        isActive?: boolean;
        isFirst?: boolean;
        isHover?: boolean;
        isSelectable?: boolean;
        getOptionLabel?: any;
        item?: any;
        filterText?: string;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
