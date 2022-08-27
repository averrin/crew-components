/** @typedef {typeof __propDef.props}  SelectionProps */
/** @typedef {typeof __propDef.events}  SelectionEvents */
/** @typedef {typeof __propDef.slots}  SelectionSlots */
export default class Selection extends SvelteComponentTyped<{
    item?: any;
    getSelectionLabel?: any;
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type SelectionProps = typeof __propDef.props;
export type SelectionEvents = typeof __propDef.events;
export type SelectionSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        item?: any;
        getSelectionLabel?: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
