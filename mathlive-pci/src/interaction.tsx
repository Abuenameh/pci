import { useStore, IStore, Action } from "@citolab/preact-store";
import { StateModel } from "./store";
import configProps from "./config.json";
import { useRef, useEffect } from "preact/hooks";
import { MathfieldElement } from "mathlive";
import { QtiVariableJSON } from "@citolab/tspci";

declare module "preact" {
  namespace JSX {
    interface IntrinsicElements {
      "math-field": React.DetailedHTMLProps<React.HTMLAttributes<MathfieldElement>, MathfieldElement>;
    }
  }
}

type PropTypes = typeof configProps;

const Interaction = ({ config, dom, store }: { config: PropTypes; dom: HTMLElement, store: IStore<StateModel> }) => {
  const mf = useRef<MathfieldElement>();
  const state = useStore(store);

  useEffect(() => {
    const handlePointerEvents = (elem) => {
      const pointerEvents = elem ? window.getComputedStyle(elem)["pointer-events"] : "auto";
      if (pointerEvents === "none") {
        mf.current.readonly = true;
      }
      else {
        mf.current.readonly = false;
      }
    };

    const statistic = dom.closest("app-statistic-qti");
    const answer = dom.closest("app-content-qti-answer");

    handlePointerEvents(statistic || answer);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "style") {
          handlePointerEvents(mutation.target)
        }
      });
    });
    const observerConfig = {
      attributes: true,
      attributeFilter: ["style"]
    };

    statistic && observer.observe(statistic, observerConfig);
    answer && observer.observe(answer, observerConfig);

    return () => {
      observer.disconnect();
    }
  }, [])

  const handleChange = (e: Event) => {
      const input = e.target as HTMLInputElement;
      store.dispatch<{ input: string }>({ type: "SET_INPUT", payload: { input: input.value } });
  };

  return <math-field ref={mf}
                     id={config.id}
                     math-virtual-keyboard-policy="auto"
                     onfocusin={() => { // @ts-ignore
                       window.mathVirtualKeyboard.layouts = config.layouts}}
                     onChange={handleChange}
                     style={{width: "auto", height: "auto", "min-width": config.width, "min-height": config.height, display: config.display}}>
    {state.input}
  </math-field>;
};


export default Interaction;

