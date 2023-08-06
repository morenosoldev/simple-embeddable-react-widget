import React from "react";
import ReactDOM from "react-dom";
import Widget from "./components/Widget/Widget";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import Config from "./config";

const widgetName = Config.name;
const widgetConfigName = widgetName + "Config";
const defaultconfig = {
  someDefaultConfiguration: false,
};
let widgetComponent = null;

function app(window) {
  console.log(`${widgetName} starting`);
  // If we don't already have a name for widget's global object
  // assigned by the host, then they must be using the simple <script> tag method
  // so we need to get our data out of that tag
  if (!window[widgetName]) {
    let tag = document.getElementById(widgetName + "-Script");

    if (!tag) {
      throw Error(`Cannot find script tag with id {$widgetName}-Script`);
    }

    let rawData = tag.getAttribute("data-config");
    rawData = rawData.replace(/'/g, '"');
    console.log(rawData);
    let data = JSON.parse(rawData);

    window[widgetName] = data.name;

    let placeholder = {};
    (placeholder.q = []).push(["init", data.config]);

    window[window[widgetName]] = placeholder;
  }

  let placeholder = window[window[widgetName]];

  // override temporary (until the app loaded) handler
  // for widget's API calls
  window[window[widgetName]] = apiHandler;
  window[widgetConfigName] = defaultconfig;

  if (placeholder) {
    console.log(`${widgetName} placeholder found`);
    let tag = document.getElementById(widgetName + "-Script");

    if (!tag) {
      throw Error(`Cannot find script tag with id {$widgetName}-Script`);
    }

    let rawData = tag.getAttribute("data-config");
    rawData = rawData.replace(/'/g, '"');
    console.log(rawData);
    let data = JSON.parse(rawData);

    let queue = placeholder.q;
    if (queue) {
      console.log(`${widgetName} placeholder queue found`);

      for (var i = 0; i < queue.length; i++) {
        apiHandler(queue[i][0], data, queue[i][1]);
      }
    }
  }
}

/**
    Method that handles all API calls
*/
function apiHandler(api, rawData, params) {
  if (!api) throw Error("API method required");
  api = api.toLowerCase();
  let config = window[widgetConfigName];

  console.log(`Handling API call ${api}`, params, config);

  switch (api) {
    case "init":
      config = Object.assign({}, config, params);
      window[widgetConfigName] = config;

      // get a reference to the created widget component so we can
      // call methods as needed
      const client = new ApolloClient({
        uri: "https://global-chat-qh6v.onrender.com/", // Replace this with the URL of your GraphQL server
        cache: new InMemoryCache(),
        fetchOptions: {
          mode: "no-cors",
        },
      });
      widgetComponent = React.createRef();
      ReactDOM.render(
        <ApolloProvider client={client}>
          <Widget ref={widgetComponent} config={rawData} />
        </ApolloProvider>,
        document.getElementById(config.targetElementId)
      );
      break;
    case "message":
      // Send the message to the current widget instance
      widgetComponent.current.setMessage(params);
      break;
    default:
      throw Error(`Method ${api} is not supported`);
  }
}

app(window);

export default app;
