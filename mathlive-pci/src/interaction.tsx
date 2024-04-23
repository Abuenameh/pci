import { useStore, IStore, Action } from "@citolab/preact-store";
import { ActionType, StateModel } from "./store";
import configProps from "./config.json";
import { useState, useRef } from "preact/hooks";

declare module "preact" {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<React.HTMLAttributes<MathfieldElement>, MathfieldElement>;
    }
  }
}

type PropTypes = typeof configProps;

const Interaction = ({ config, dom, store }: { config: PropTypes; dom: Document | ShadowRoot, store: IStore<StateModel> }) => {
  const mf = useRef();
  const state = useStore(store);
  const [eventHandled, setEventHandled] = useState<boolean>(false);
  
  const handleInput = (e: Event) => {
    if (!eventHandled) {
      const input = e.target as HTMLInputElement;
      store.dispatch<{ input: string }>({ type: "SET_INPUT", payload: { input: input.value } });
      setEventHandled(true);
    }
  };

  return <math-field ref={mf}
                     math-virtual-keyboard-policy="auto"
                     onfocusin={() => { // @ts-ignore
                       window.mathVirtualKeyboard.layouts = config.layouts}}
                     onInput={handleInput}
                     onPaste={() => setEventHandled(false)}
                     onKeyDown={() => setEventHandled(false)}
                     style={{width: config.width, height: config.height, display: config.display}}>
    {state.input}
  </math-field>;
};


export default Interaction;

