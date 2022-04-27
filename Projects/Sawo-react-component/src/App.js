import React from "react";
import "./App.css";

//Dashboard Content
import Sawo from "sawo";
import Dashboard from "./dashboard";

function App() {

let [payload, setPayload] = React.useState(false);

React.useEffect(() => {
  var config = {
      containerID: "sawo-container",
      identifierType: "email",
      apiKey: process.env.REACT_APP_API_SAWO,
      onSuccess: (payload) => {
        // console.log(payload); 
        setPayload(payload)
      },
    };
    let sawo = new Sawo(config);
    sawo.showForm();
 }, []); 

   return (
      <>
         <div
          id="sawo-container"
          style={{ height: "300px", width: "300px" }}
        ></div>
        {payload &&(
            <>
              <Dashboard payload={payload} />
            </>
          )}
      </>
  );
}
export default App;
