import { useStore, IStore, Action } from "@citolab/preact-store";
import { ActionType, StateModel } from "./store";
import configProps from "./config.json";
import { useState, useRef } from "preact/hooks";
import { MathfieldElement } from "mathlive";

declare module "preact" {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<React.HTMLAttributes<MathfieldElement>, MathfieldElement>;
    }
  }
}

type PropTypes = typeof configProps;

const Interaction = ({ config, dom, store }: { config: PropTypes; dom: Document | ShadowRoot, store: IStore<StateModel> }) => {
  const mf = useRef<MathfieldElement>();
  const state = useStore(store);

  dom.addEventListener("changed", (e: CustomEvent) => {
    mf.current.setValue(e.detail);
  })
  
  const handleChange = (e: Event) => {
      const input = e.target as HTMLInputElement;
      store.dispatch<{ input: string }>({ type: "SET_INPUT", payload: { input: input.value } });
  };

  return <math-field ref={mf}
                     math-virtual-keyboard-policy="auto"
                     onfocusin={() => { // @ts-ignore
                       window.mathVirtualKeyboard.layouts = config.layouts}}
                     onChange={handleChange}
                     style={{width: 'auto', height: 'auto', 'min-width': config.width, 'min-height': config.height, display: config.display}}>
    {state.input}
  </math-field>;
};


export default Interaction;

