import "preact/debug";
import { render } from "preact";
import { IStore } from "@citolab/preact-store";
import * as ctx from "qtiCustomInteractionContext";
import Interaction from "./interaction";
import style from "./styles.css";
import { Configuration, IMSpci, QtiVariableJSON } from "@citolab/tspci";
import configProps from "./config.json";
import { StateModel, initStore } from "./store";

type PropTypes = typeof configProps;

class App implements IMSpci<PropTypes> {
  typeIdentifier = "mathlivePci"; // typeIdentifier is mandatory for all PCI's
  config: Configuration<PropTypes>; // reference to the interface of the config object which you get when getInstance is called by the player
  state: string; // keep a reference to the state
  shadowdom: ShadowRoot; // Not mandatory, but its wise to create a shadowroot
  store: IStore<StateModel>;
  dom: HTMLElement;

  private logActions: { type: string; payload: unknown }[] = []; // optional logActions
  private initialState: StateModel = { input: undefined }; // optional initial state
  constructor() {
    ctx && ctx.register(this);
  }

  getInstance = (dom: HTMLElement, config: Configuration<PropTypes>, stateString: string) => {
    config.properties = { ...configProps, ...config.properties }; // merge current props with incoming
    this.config = config;

    this.logActions = stateString ? JSON.parse(stateString).log : [];
    this.store = initStore(this.initialState);
    try {
      const restoredState = stateString ? JSON.parse(stateString) : null;
      if (restoredState) {
        this.store.restoreState(restoredState?.state, this.logActions);
      }
    } catch (error) {
      console.log(error);
    }

    dom.parentElement.addEventListener("setresponse", (e: CustomEvent) => {
      const response = e.detail as QtiVariableJSON;
      if (response.base && response.base.string) {
        this.store.dispatch<{ input: string }>({ type: "SET_INPUT", payload: { input: response.base?.string as string } });
      }
    });

    this.dom = dom;
    this.shadowdom = dom.attachShadow({ mode: "open" });
    this.render();

    this.config.onready && this.config.onready(this);
  };

  render = () => {
    render(null, this.shadowdom);
    const css = document.createElement("style");
    css.innerHTML = style;
    this.shadowdom.appendChild(css);
    render(<Interaction config={this.config.properties} dom={this.dom} store={this.store} />, this.shadowdom);
  };

  getState = () =>
    JSON.stringify({
      state: this.store.getState(),
      log: this.store.getActions(),
    });

  getResponse = () => {
    const state = this.store?.getState()?.input || undefined;
    if (state === undefined) return undefined;
    return {
      base: {
        string: this.store.getState().input,
      },
    } as QtiVariableJSON;
  }
}

export default new App();
