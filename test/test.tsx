import React from "react";
import ReactDOM from "react-dom/server";
import { createLocalized } from "..";
import de from "./de";
import en from "./en";

const t = createLocalized(de, "de", { en });

console.log(ReactDOM.renderToString(<div>{t["hiddenMenu.reloadPage"]}</div>));
